import { supabase } from '../lib/supabase.js';

export const QuestionModel = {
    // Obtener todas las preguntas con sus respuestas agrupadas (orden aleatorio)
    async getAllQuestions() {
        try {
            // Obtener todas las preguntas
            const { data: preguntas, error: errorPreguntas } = await supabase
                .from('preguntas')
                .select('*');

            if (errorPreguntas) throw errorPreguntas;
            
            if (!preguntas || preguntas.length === 0) {
                return [];
            }

            // Obtener todas las respuestas
            const { data: respuestas, error: errorRespuestas } = await supabase
                .from('respuestas')
                .select('*');

            if (errorRespuestas) throw errorRespuestas;

            // Crear un mapa de respuestas por pregunta_id
            const respuestasPorPregunta = {};
            
            if (respuestas && respuestas.length > 0) {
                respuestas.forEach(respuesta => {
                    if (!respuestasPorPregunta[respuesta.pregunta_id]) {
                        respuestasPorPregunta[respuesta.pregunta_id] = [];
                    }
                    respuestasPorPregunta[respuesta.pregunta_id].push(respuesta);
                });
            }

            // Combinar preguntas con sus respuestas
            let resultado = preguntas.map(pregunta => ({
                id: pregunta.id,
                texto: pregunta.texto,
                nivel: pregunta.nivel,
                pista: pregunta.pista,
                categoria_id: pregunta.categoria_id,
                created_at: pregunta.created_at,
                respuestas: respuestasPorPregunta[pregunta.id] || []
            }));

            // Filtrar preguntas que no tienen respuestas
            resultado = resultado.filter(p => p.respuestas.length > 0);
            
            // MEZCLAR PREGUNTAS ALEATORIAMENTE
            for (let i = resultado.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
            }
            
            return resultado;
        } catch (error) {
            console.error('Error en getAllQuestions:', error);
            throw error;
        }
    },

    // Obtener todas las categorías
    async getAllCategories() {
        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .order('nombre');

        if (error) throw error;
        return data;
    }
};