import api from './api';
import { Project, ProjectParams } from '../types/project';

const projectsService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get('/api/proyectos');
        return response.data;
    },

    getById: async (id: number): Promise<Project> => {
        const response = await api.get(`/api/proyectos/${id}`);
        return response.data;
    },

    create: async (data: ProjectParams): Promise<Project> => {
        const response = await api.post('/api/proyectos', data);
        return response.data;
    },

    update: async (id: number, data: ProjectParams): Promise<Project> => {
        const response = await api.put(`/api/proyectos/${id}`, data);
        return response.data;
    },

    // Endpoint específico para sincronizar con ERP (Futuro)
    sync: async (): Promise<void> => {
        await api.post('/api/proyectos/sync');
    }
};

export default projectsService;
