import axios from 'axios';
import { API_BASE_URL } from './constants';

export const quizApi = axios.create({
    baseURL: `${API_BASE_URL}/quizzes`,
});

export const questionApi = axios.create({
    baseURL: `${API_BASE_URL}/questions`,
});

export const quizAttemptApi = axios.create({
    baseURL: `${API_BASE_URL}/quiz-attempts`,
});