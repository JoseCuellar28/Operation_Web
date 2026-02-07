import api from './api';

export interface UserStatus {
    id: number;
    dni: string;
    role: string;
    isActive: boolean;
}

export const userService = {
    async createUser(dni: string, role: string = 'Usuario'): Promise<{ id: number; tempPassword: string }> {
        const response = await api.post('/api/auth/register-user', { dni, role, accessWeb: true, accessApp: true });
        return response.data;
    },

    async toggleStatus(dni: string): Promise<{ message: string }> {
        const response = await api.put(`/api/users/${dni}/toggle-status`);
        return response.data;
    },

    async activate(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await api.post('/api/auth/activate', { token, newPassword });
        return response.data;
    },

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await api.post('/api/auth/reset-password', { token, newPassword });
        return response.data;
    }
};
