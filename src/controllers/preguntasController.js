import { QuestionModel } from '../models/Preguntas.js';

export const QuestionController = {
    async getAllQuestions() {
        try {
            const questions = await QuestionModel.getAllQuestions();
            return { success: true, data: questions };
        } catch (error) {
            console.error('Controller Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Nuevo método para obtener preguntas por categoría
    async getQuestionsByCategory(categoryId) {
        try {
            const questions = await QuestionModel.getQuestionsByCategory(categoryId);
            return { success: true, data: questions };
        } catch (error) {
            console.error('Controller Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Nuevo método para obtener preguntas de múltiples categorías
    async getQuestionsFromCategories(categoryIds, questionsPerCategory = 10) {
        try {
            const questions = await QuestionModel.getQuestionsFromCategories(categoryIds, questionsPerCategory);
            return { success: true, data: questions };
        } catch (error) {
            console.error('Controller Error:', error);
            return { success: false, error: error.message };
        }
    },

    async getAllCategories() {
        try {
            const categories = await QuestionModel.getAllCategories();
            return { success: true, data: categories };
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return { success: false, error: error.message };
        }
    }
};