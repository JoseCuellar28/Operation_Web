import api from './api';
import { LoginRequest, LoginResponse, User } from '../types/auth';

export const authService = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/api/v1/auth/login', credentials);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/api/v1/auth/me');
        return response.data;
    },

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        await api.post('/api/v1/auth/change-password', { oldPassword, newPassword });
    },

    async getCaptcha(): Promise<{ id: string; image: string }> {
        const response = await api.get('/api/v1/auth/captcha');
        return response.data;
    },

    async forgotPassword(dniOrEmail: string): Promise<void> {
        await api.post('/api/v1/auth/forgot-password', { dniOrEmail });
    },

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await api.post('/api/v1/auth/reset-password', { token, newPassword });
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
