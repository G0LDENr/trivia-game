import { supabase } from '../lib/supabase.js';

export const SalaModel = {
  generarCodigo() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  },

  async crearSala(datos) {
    try {
      let codigo = this.generarCodigo();
      let existe = true;
      
      while (existe) {
        const { data: salaExistente, error } = await supabase
          .from('salas')
          .select('codigo')
          .eq('codigo', codigo);
        
        if (!error && (!salaExistente || salaExistente.length === 0)) {
          existe = false;
        } else {
          codigo = this.generarCodigo();
        }
      }
      
      const nuevaSala = {
        codigo,
        nombre_sala: datos.nombreSala,
        creador_id: datos.creadorId,
        creador_nombre: datos.creadorNombre,
        jugadores: [{
          id: datos.creadorId,
          nombre: datos.creadorNombre,
          puntaje: 0,
          respuestas: [],
          preguntas_respondidas: 0,
          completado: false
        }],
        estado: 'esperando',
        max_jugadores: datos.maxJugadores || 4
      };
      
      const { data, error } = await supabase
        .from('salas')
        .insert([nuevaSala])
        .select();
      
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error al crear sala:', error);
      return { success: false, error: error.message };
    }
  },

  async unirseSala(codigo, jugador) {
    try {
      const { data: sala, error: findError } = await supabase
        .from('salas')
        .select('*')
        .eq('codigo', codigo.toUpperCase());
      
      if (findError) throw findError;
      if (!sala || sala.length === 0) throw new Error('Sala no encontrada');
      
      const salaData = sala[0];
      
      if (salaData.estado !== 'esperando') {
        throw new Error('La partida ya comenzó');
      }
      
      let jugadores = salaData.jugadores;
      if (typeof jugadores === 'string') jugadores = JSON.parse(jugadores);
      
      if (jugadores.length >= salaData.max_jugadores) throw new Error('La sala está llena');
      if (jugadores.some(j => j.id === jugador.id)) throw new Error('Ya estás en esta sala');
      
      jugadores.push({
        id: jugador.id,
        nombre: jugador.nombre,
        puntaje: 0,
        respuestas: [],
        preguntas_respondidas: 0,
        completado: false
      });
      
      const { data, error } = await supabase
        .from('salas')
        .update({ jugadores: JSON.stringify(jugadores) })
        .eq('codigo', codigo.toUpperCase())
        .select();
      
      if (error) throw error;
      const salaActualizada = data[0];
      salaActualizada.jugadores = jugadores;
      
      return { success: true, data: salaActualizada };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getSalaByCodigo(codigo) {
    try {
      const { data, error } = await supabase
        .from('salas')
        .select('*')
        .eq('codigo', codigo.toUpperCase());
      
      if (error) return { success: false, error: error.message };
      if (!data || data.length === 0) return { success: false, error: 'Sala no encontrada' };
      
      const sala = data[0];
      if (sala.jugadores && typeof sala.jugadores === 'string') {
        sala.jugadores = JSON.parse(sala.jugadores);
      }
      
      return { success: true, data: sala };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async actualizarListo(codigo, jugadorId, listo) {
    try {
      const { data: sala, error: findError } = await supabase
        .from('salas')
        .select('*')
        .eq('codigo', codigo.toUpperCase());
      
      if (findError) throw findError;
      if (!sala || sala.length === 0) throw new Error('Sala no encontrada');
      
      let jugadores = sala[0].jugadores;
      if (typeof jugadores === 'string') jugadores = JSON.parse(jugadores);
      
      const index = jugadores.findIndex(j => j.id === jugadorId);
      if (index !== -1) {
        jugadores[index].listo = listo;
      }
      
      const { data, error } = await supabase
        .from('salas')
        .update({ jugadores: JSON.stringify(jugadores) })
        .eq('codigo', codigo.toUpperCase())
        .select();
      
      if (error) throw error;
      const salaActualizada = data[0];
      salaActualizada.jugadores = jugadores;
      
      return { success: true, data: salaActualizada };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async iniciarPartida(codigo) {
    try {
      const { data, error } = await supabase
        .from('salas')
        .update({ estado: 'jugando' })
        .eq('codigo', codigo.toUpperCase())
        .select();
      
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async salirSala(codigo, jugadorId) {
    try {
        const { data: sala, error: findError } = await supabase
        .from('salas')
        .select('*')
        .eq('codigo', codigo.toUpperCase());
        
        if (findError) throw findError;
        if (!sala || sala.length === 0) return { success: true, data: null };
        
        const salaData = sala[0];
        let jugadores = salaData.jugadores;
        if (typeof jugadores === 'string') jugadores = JSON.parse(jugadores);
        
        const esCreador = salaData.creador_id === jugadorId;
        
        jugadores = jugadores.filter(j => j.id !== jugadorId);
        
        // Si el creador se va o no quedan jugadores, eliminar sala
        if (esCreador || jugadores.length === 0) {
        await supabase.from('salas').delete().eq('codigo', codigo.toUpperCase());
        return { success: true, data: null, salaCancelada: true };
        }
        
        const { data, error } = await supabase
        .from('salas')
        .update({ jugadores: JSON.stringify(jugadores) })
        .eq('codigo', codigo.toUpperCase())
        .select();
        
        if (error) throw error;
        const salaActualizada = data[0];
        salaActualizada.jugadores = jugadores;
        return { success: true, data: salaActualizada, salaCancelada: false };
    } catch (error) {
        return { success: false, error: error.message };
    }
    },

  async actualizarPuntaje(codigo, jugadorId, puntaje) {
    try {
      const { data: sala, error: findError } = await supabase
        .from('salas')
        .select('*')
        .eq('codigo', codigo.toUpperCase());
      
      if (findError) throw findError;
      if (!sala || sala.length === 0) throw new Error('Sala no encontrada');
      
      let jugadores = sala[0].jugadores;
      if (typeof jugadores === 'string') jugadores = JSON.parse(jugadores);
      
      const index = jugadores.findIndex(j => j.id === jugadorId);
      if (index !== -1) {
        jugadores[index].puntaje = puntaje;
      }
      
      const { data, error } = await supabase
        .from('salas')
        .update({ jugadores: JSON.stringify(jugadores) })
        .eq('codigo', codigo.toUpperCase())
        .select();
      
      if (error) throw error;
      const salaActualizada = data[0];
      salaActualizada.jugadores = jugadores;
      
      return { success: true, data: salaActualizada };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // NUEVO MÉTODO - Actualizar respuesta de un jugador
  async actualizarRespuesta(codigo, jugadorId, preguntaIndex, esCorrecta, puntaje, tiempoUsado) {
    try {
      const { data: sala, error: findError } = await supabase
        .from('salas')
        .select('*')
        .eq('codigo', codigo.toUpperCase());
      
      if (findError) throw findError;
      if (!sala || sala.length === 0) throw new Error('Sala no encontrada');
      
      let jugadores = sala[0].jugadores;
      if (typeof jugadores === 'string') jugadores = JSON.parse(jugadores);
      
      const index = jugadores.findIndex(j => j.id === jugadorId);
      if (index !== -1) {
        jugadores[index].respuestas.push({
          pregunta: preguntaIndex,
          esCorrecta,
          puntaje,
          tiempoUsado
        });
        jugadores[index].puntaje += puntaje;
        jugadores[index].preguntas_respondidas += 1;
        
        if (jugadores[index].preguntas_respondidas === 15) {
          jugadores[index].completado = true;
        }
      }
      
      const todosCompletaron = jugadores.every(j => j.completado === true);
      
      const updateData = { 
        jugadores: JSON.stringify(jugadores) 
      };
      
      if (todosCompletaron) {
        updateData.estado = 'terminado';
      }
      
      const { data, error } = await supabase
        .from('salas')
        .update(updateData)
        .eq('codigo', codigo.toUpperCase())
        .select();
      
      if (error) throw error;
      const salaActualizada = data[0];
      salaActualizada.jugadores = jugadores;
      
      return { success: true, data: salaActualizada, todosCompletaron };
    } catch (error) {
      console.error('Error al actualizar respuesta:', error);
      return { success: false, error: error.message };
    }
  }
};