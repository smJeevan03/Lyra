import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

export const generateFlashcards = async (documentId, options) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, { documentId, ...options });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to generate flashcards' };
    }
};

export const generateQuiz = async (documentId, options) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, { documentId, ...options });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to generate quiz' };
    }
};

export const generateSummary = async (documentId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, { documentId });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to generate summary' };
    }
};

export const chat = async (documentId, message) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.CHAT, { documentId, question: message }); // Removed history from payload
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Chat request failed' };
    }
};

export const explainConcept = async (documentId, concept) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, { documentId, concept });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to explain concept' };
    }
};

export const getChatHistory = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch chat history' };
    }
};