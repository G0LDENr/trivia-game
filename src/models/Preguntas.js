import { supabase } from '../lib/supabase.js';

export const QuestionModel = {
    // Obtener todas las preguntas con sus respuestas (TODAS las categorías)
    async getAllQuestions() {
        try {
            // Obtener todas las preguntas (sin filtrar por categoría)
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
            
            // MEZCLAR TODAS LAS PREGUNTAS ALEATORIAMENTE (de todas las categorías)
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

    // Obtener preguntas por categoría específica
    async getQuestionsByCategory(categoryId) {
        try {
            const { data: preguntas, error: errorPreguntas } = await supabase
                .from('preguntas')
                .select('*')
                .eq('categoria_id', categoryId);

            if (errorPreguntas) throw errorPreguntas;
            
            if (!preguntas || preguntas.length === 0) {
                return [];
            }

            const { data: respuestas, error: errorRespuestas } = await supabase
                .from('respuestas')
                .select('*');

            if (errorRespuestas) throw errorRespuestas;

            const respuestasPorPregunta = {};
            
            if (respuestas && respuestas.length > 0) {
                respuestas.forEach(respuesta => {
                    if (!respuestasPorPregunta[respuesta.pregunta_id]) {
                        respuestasPorPregunta[respuesta.pregunta_id] = [];
                    }
                    respuestasPorPregunta[respuesta.pregunta_id].push(respuesta);
                });
            }

            let resultado = preguntas.map(pregunta => ({
                id: pregunta.id,
                texto: pregunta.texto,
                nivel: pregunta.nivel,
                pista: pregunta.pista,
                categoria_id: pregunta.categoria_id,
                respuestas: respuestasPorPregunta[pregunta.id] || []
            }));

            resultado = resultado.filter(p => p.respuestas.length > 0);
            
            // Mezclar preguntas de la categoría
            for (let i = resultado.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
            }
            
            return resultado;
        } catch (error) {
            console.error('Error en getQuestionsByCategory:', error);
            throw error;
        }
    },

    // Obtener preguntas de MÚLTIPLES categorías (balanceadas)
    async getQuestionsFromCategories(categoryIds, questionsPerCategory = 10) {
        try {
            let allQuestions = [];
            
            for (const categoryId of categoryIds) {
                const questions = await this.getQuestionsByCategory(categoryId);
                // Tomar 'questionsPerCategory' preguntas de cada categoría
                const selectedQuestions = questions.slice(0, questionsPerCategory);
                allQuestions.push(...selectedQuestions);
            }
            
            // Mezclar todas las preguntas seleccionadas
            for (let i = allQuestions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
            }
            
            return allQuestions;
        } catch (error) {
            console.error('Error en getQuestionsFromCategories:', error);
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