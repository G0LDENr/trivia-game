import { QuestionModel } from '../models/Preguntas.js';

export const QuestionController = {
    // Obtener todas las preguntas
    async getAllQuestions() {
        try {
            const questions = await QuestionModel.getAllQuestions();
            return { success: true, data: questions };
        } catch (error) {
            console.error('Error al obtener preguntas:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener preguntas por categoría
    async getQuestionsByCategory(categoriaId) {
        try {
            const questions = await QuestionModel.getQuestionsByCategory(categoriaId);
            return { success: true, data: questions };
        } catch (error) {
            console.error('Error al obtener preguntas por categoría:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener preguntas por nivel
    async getQuestionsByLevel(nivel) {
        try {
            const questions = await QuestionModel.getQuestionsByLevel(nivel);
            return { success: true, data: questions };
        } catch (error) {
            console.error('Error al obtener preguntas por nivel:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener una pregunta específica
    async getQuestionById(questionId) {
        try {
            const question = await QuestionModel.getQuestionById(questionId);
            return { success: true, data: question };
        } catch (error) {
            console.error('Error al obtener pregunta:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener todas las categorías
    async getAllCategories() {
        try {
            const categories = await QuestionModel.getAllCategories();
            return { success: true, data: categories };
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return { success: false, error: error.message };
        }
    },

    // Crear nueva pregunta
    async createQuestion(questionData) {
        if (!questionData.texto) {
            return { success: false, error: 'El texto de la pregunta es requerido' };
        }
        if (!questionData.respuestas || questionData.respuestas.length !== 4) {
            return { success: false, error: 'Debe tener 4 respuestas' };
        }
        if (!questionData.respuestas.some(r => r.es_correcta)) {
            return { success: false, error: 'Debe haber una respuesta correcta' };
        }

        try {
            const newQuestion = await QuestionModel.createQuestion(
                {
                    texto: questionData.texto,
                    categoria_id: questionData.categoria_id,
                    nivel: questionData.nivel,
                    pista: questionData.pista
                },
                questionData.respuestas
            );
            return { success: true, data: newQuestion };
        } catch (error) {
            console.error('Error al crear pregunta:', error);
            return { success: false, error: error.message };
        }
    },

    // Eliminar pregunta
    async deleteQuestion(questionId) {
        if (!questionId) {
            return { success: false, error: 'ID de pregunta requerido' };
        }

        try {
            await QuestionModel.deleteQuestion(questionId);
            return { success: true, data: { id: questionId } };
        } catch (error) {
            console.error('Error al eliminar pregunta:', error);
            return { success: false, error: error.message };
        }
    }
};