import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

export const login = async (email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};

export const register = async (username, email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};

export const changePassword = async (passwords) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, passwords);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An unknown error occurred' };
    }
};