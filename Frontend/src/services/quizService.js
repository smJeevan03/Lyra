import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

export const getQuizzesForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch quizzes' };
    }
};

export const getQuizById = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch quiz' };
    }
};

export const submitQuiz = async (quizId, answers) => {
    try {
        const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId), { answers });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to submit quiz' };
    }
};

export const getQuizResults = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch quiz results' };
    }
};

export const deleteQuiz = async (quizId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(quizId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to delete quiz' };
    }
};
export const getAllQuizzes = async () => {
    try {
        // Now that the backend has the '/api/quizzes' route, we use it!
        const response = await axiosInstance.get('/api/quizzes');
        
        // Return the actual data from the backend
        return response.data; 
        
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch all quizzes' };
    }
};
// Add this inside your quizService.js
export const generateQuizFromDocument = async (documentId, numQuestions) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, { 
            documentId, 
            numQuestions 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to generate quiz' };
    }
};
const quizService = {
    getQuizzesForDocument,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
    getAllQuizzes,
    generateQuizFromDocument
};

export default quizService;