import api from './api';

export interface Project {
    id: number;
    nombre: string;
    division?: string; // Optional
    estado: string;
    fechaInicio?: string; // Optional
    cliente?: string; // Optional
    // Assignment fields from legacy
    id_cuadrilla?: string;
    id_efectivo?: string;
}

export const projectsService = {
    getAll: async (): Promise<Project[]> => {
        const response = await api.get('/api/proyectos');
        return response.data;
    },

    create: async (data: Partial<Project>) => {
        const response = await api.post('/api/proyectos', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Project>) => {
        const response = await api.put(`/api/proyectos/${id}`, data);
        return response.data;
    },

    sync: async () => {
        const response = await api.post('/api/proyectos/sync');
        return response.data;
    }
};
