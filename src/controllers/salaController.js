import { SalaModel } from '../models/Sala.js';

export const SalaController = {
  async crearSala(req) {
    try {
      const result = await SalaModel.crearSala(req);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async unirseSala(codigo, jugador) {
    try {
      const result = await SalaModel.unirseSala(codigo, jugador);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getSalaByCodigo(codigo) {
    try {
      const result = await SalaModel.getSalaByCodigo(codigo);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async actualizarListo(codigo, jugadorId, listo) {
    try {
      const result = await SalaModel.actualizarListo(codigo, jugadorId, listo);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async iniciarPartida(codigo) {
    try {
      const result = await SalaModel.iniciarPartida(codigo);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async salirSala(codigo, jugadorId) {
    try {
      const result = await SalaModel.salirSala(codigo, jugadorId);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async actualizarPuntaje(codigo, jugadorId, puntaje) {
    try {
      const result = await SalaModel.actualizarPuntaje(codigo, jugadorId, puntaje);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async actualizarRespuesta(codigo, jugadorId, preguntaIndex, esCorrecta, puntaje, tiempoUsado) {
    try {
      const result = await SalaModel.actualizarRespuesta(codigo, jugadorId, preguntaIndex, esCorrecta, puntaje, tiempoUsado);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};