import api from './api';
import { LoginRequest, LoginResponse, User } from '../types/auth';

export const authService = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/api/auth/login', credentials);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/api/auth/me');
        return response.data;
    },

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        await api.post('/api/auth/change-password', { oldPassword, newPassword });
    },

    async getCaptcha(): Promise<{ id: string; image: string }> {
        const response = await api.get('/api/auth/captcha');
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
