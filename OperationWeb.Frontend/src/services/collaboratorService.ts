import api from './api';
import { User } from '../types/auth'; // Reusing User type as it maps to Empleado/Collaborator

export interface Collaborator extends User {
    // Extend if there are specific fields for the list view not in User
}

export const collaboratorService = {
    async getAll(): Promise<Collaborator[]> {
        const response = await api.get<Collaborator[]>('/api/personal');
        return response.data;
    },

    async getById(id: number): Promise<Collaborator> {
        const response = await api.get<Collaborator>(`/api/personal/${id}`);
        return response.data;
    }
};
