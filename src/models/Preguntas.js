import { supabase } from '../lib/supabase.js';

export const QuestionModel = {
    // Obtener todas las preguntas con sus respuestas agrupadas
    async getAllQuestions() {
        try {
            // Obtener todas las preguntas
            const { data: preguntas, error: errorPreguntas } = await supabase
                .from('preguntas')
                .select('*')
                .order('created_at');

            if (errorPreguntas) throw errorPreguntas;
            
            if (!preguntas || preguntas.length === 0) {
                return [];
            }

            // Obtener todas las respuestas
            const { data: respuestas, error: errorRespuestas } = await supabase
                .from('respuestas')
                .select('*')
                .order('orden');

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
            const resultado = preguntas.map(pregunta => ({
                id: pregunta.id,
                texto: pregunta.texto,
                nivel: pregunta.nivel,
                pista: pregunta.pista,
                categoria_id: pregunta.categoria_id,
                created_at: pregunta.created_at,
                respuestas: respuestasPorPregunta[pregunta.id] || []
            }));

            // Filtrar preguntas que no tienen respuestas
            return resultado.filter(p => p.respuestas.length > 0);
        } catch (error) {
            console.error('Error en getAllQuestions:', error);
            throw error;
        }
    },

    // Obtener preguntas por categoría
    async getQuestionsByCategory(categoriaId) {
        try {
            const { data: preguntas, error: errorPreguntas } = await supabase
                .from('preguntas')
                .select('*')
                .eq('categoria_id', categoriaId)
                .order('created_at');

            if (errorPreguntas) throw errorPreguntas;
            
            if (!preguntas || preguntas.length === 0) {
                return [];
            }

            const { data: respuestas, error: errorRespuestas } = await supabase
                .from('respuestas')
                .select('*')
                .order('orden');

            if (errorRespuestas) throw errorRespuestas;

            const respuestasPorPregunta = {};
            if (respuestas) {
                respuestas.forEach(respuesta => {
                    if (!respuestasPorPregunta[respuesta.pregunta_id]) {
                        respuestasPorPregunta[respuesta.pregunta_id] = [];
                    }
                    respuestasPorPregunta[respuesta.pregunta_id].push(respuesta);
                });
            }

            const resultado = preguntas.map(pregunta => ({
                id: pregunta.id,
                texto: pregunta.texto,
                nivel: pregunta.nivel,
                pista: pregunta.pista,
                categoria_id: pregunta.categoria_id,
                respuestas: respuestasPorPregunta[pregunta.id] || []
            }));

            return resultado.filter(p => p.respuestas.length > 0);
        } catch (error) {
            console.error('Error en getQuestionsByCategory:', error);
            throw error;
        }
    },

    // Obtener preguntas por nivel
    async getQuestionsByLevel(nivel) {
        try {
            const { data: preguntas, error: errorPreguntas } = await supabase
                .from('preguntas')
                .select('*')
                .eq('nivel', nivel)
                .order('created_at');

            if (errorPreguntas) throw errorPreguntas;
            
            if (!preguntas || preguntas.length === 0) {
                return [];
            }

            const { data: respuestas, error: errorRespuestas } = await supabase
                .from('respuestas')
                .select('*')
                .order('orden');

            if (errorRespuestas) throw errorRespuestas;

            const respuestasPorPregunta = {};
            if (respuestas) {
                respuestas.forEach(respuesta => {
                    if (!respuestasPorPregunta[respuesta.pregunta_id]) {
                        respuestasPorPregunta[respuesta.pregunta_id] = [];
                    }
                    respuestasPorPregunta[respuesta.pregunta_id].push(respuesta);
                });
            }

            const resultado = preguntas.map(pregunta => ({
                id: pregunta.id,
                texto: pregunta.texto,
                nivel: pregunta.nivel,
                pista: pregunta.pista,
                categoria_id: pregunta.categoria_id,
                respuestas: respuestasPorPregunta[pregunta.id] || []
            }));

            return resultado.filter(p => p.respuestas.length > 0);
        } catch (error) {
            console.error('Error en getQuestionsByLevel:', error);
            throw error;
        }
    },

    // Obtener una pregunta específica
    async getQuestionById(questionId) {
        try {
            const { data: pregunta, error: errorPregunta } = await supabase
                .from('preguntas')
                .select('*')
                .eq('id', questionId)
                .single();

            if (errorPregunta) throw errorPregunta;

            const { data: respuestas, error: errorRespuestas } = await supabase
                .from('respuestas')
                .select('*')
                .eq('pregunta_id', questionId)
                .order('orden');

            if (errorRespuestas) throw errorRespuestas;

            return {
                ...pregunta,
                respuestas: respuestas || []
            };
        } catch (error) {
            console.error('Error en getQuestionById:', error);
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
    },

    // Crear nueva pregunta
    async createQuestion(questionData, answers) {
        const { data: question, error: questionError } = await supabase
            .from('preguntas')
            .insert([{
                texto: questionData.texto,
                categoria_id: questionData.categoria_id,
                nivel: questionData.nivel,
                pista: questionData.pista
            }])
            .select()
            .single();

        if (questionError) throw questionError;

        const answersWithId = answers.map((answer, index) => ({
            pregunta_id: question.id,
            texto: answer.texto,
            es_correcta: answer.es_correcta,
            orden: index
        }));

        const { error: answersError } = await supabase
            .from('respuestas')
            .insert(answersWithId);

        if (answersError) throw answersError;

        return { ...question, respuestas: answers };
    },

    // Eliminar pregunta
    async deleteQuestion(questionId) {
        const { error } = await supabase
            .from('preguntas')
            .delete()
            .eq('id', questionId);

        if (error) throw error;
        return true;
    }
};