import api from './api';

export interface Squad {
    id: string; // e.g. "CUAD-001"
    nombre: string;
    zona: string;
    estado: string; // 'Disponible' | 'Ocupado'
}

export const squadService = {
    getAll: async (): Promise<Squad[]> => {
        // Assuming endpoint
        const response = await api.get('/api/cuadrillas');
        return response.data;
    }
};
