import api from './api';

export interface Employee {
    dni: string;
    inspector: string;
    telefono?: string;
    distrito?: string;
    tipo?: string; // 'OPERARIO' | 'CHOFER' | 'INSPECTOR' | 'SUPERVISOR'
    estado?: string; // 'ACTIVO' | 'CESADO'
    fechaInicio?: string;
    fechaCese?: string;
    motivoCese?: string;
    area?: string;
    division?: string;
    email?: string;
    hasUser?: boolean;
    userIsActive?: boolean;
    foto?: string; // Base64 (legacy)
    firma?: string; // Base64 (legacy)
    fotoUrl?: string; // File path URL
    firmaUrl?: string; // File path URL
    fechaNacimiento?: string; // YYYY-MM-DD
    id?: number; // legacy id if any
}

export interface PersonalMetadata {
    divisiones: string[];
    areas: string[];
    cargos: string[];
}

export const personalService = {
    getAll: async (): Promise<Employee[]> => {
        const response = await api.get('/api/personal');
        return response.data;
    },

    create: async (data: Partial<Employee>) => {
        const response = await api.post('/api/personal', data);
        return response.data;
    },

    update: async (dni: string, data: Partial<Employee>) => {
        const response = await api.put(`/api/personal/${dni}`, data);
        return response.data;
    },

    importBulk: async (employees: Partial<Employee>[]) => {
        const response = await api.post('/api/import/personal', { employees });
        return response.data;
    },

    sync: async () => {
        const response = await api.post('/api/personal/sync');
        return response.data;
    },

    getMetadata: async (): Promise<PersonalMetadata> => {
        const response = await api.get('/api/personal/metadata');
        return response.data;
    },

    terminate: async (dni: string, date: string, reason: string) => {
        const response = await api.put(`/api/personal/${dni}/terminate`, {
            fechaCese: date,
            motivoCese: reason
        });
        return response.data;
    },

    delete: async (dni: string) => {
        const response = await api.delete(`/api/personal/${dni}`);
        return response.data;
    }
};
