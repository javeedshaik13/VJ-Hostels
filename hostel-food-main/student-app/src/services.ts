import axios from 'axios';
import { API_ENDPOINTS, logger } from './config/config';

interface PauseData {
  pause_from: string;
  pause_meals: string;
  resume_from?: string;
  resume_meals?: string;
}

interface ResumeData {
  resume_from: string;
  resume_meals: string;
}

export const pauseFoodService = async (studentId: number, pauseData: PauseData) => {
    try {
        logger.log('Pausing food service for student:', studentId);
        const response = await axios.post(API_ENDPOINTS.PAUSE_FOOD, {
            studentId,
            ...pauseData
        });
        return response.data;
    } catch (error: any) {
        logger.error('Error pausing food:', error);
        throw new Error('Error pausing food: ' + (error?.message || 'Unknown error'));
    }
};

export const resumeFoodService = async (studentId: number, resumeData: ResumeData) => {
    try {
        logger.log('Resuming food service for student:', studentId);
        const response = await axios.post(`${API_ENDPOINTS.PAUSE_FOOD}/resume`, {
            studentId,
            ...resumeData
        });
        return response.data;
    } catch (error: any) {
        logger.error('Error resuming food:', error);
        throw new Error('Error resuming food: ' + (error?.message || 'Unknown error'));
    }
};

export const getFoodCountService = async (date: string) => {
    try {
        logger.log('Fetching food count for date:', date);
        const response = await axios.get(`${API_ENDPOINTS.STUDENT_STATUS}/food-count`, {
            params: { date }
        });
        return response.data;
    } catch (error: any) {
        logger.error('Error fetching food count:', error);
        throw new Error('Error fetching food count: ' + (error?.message || 'Unknown error'));
    }
};