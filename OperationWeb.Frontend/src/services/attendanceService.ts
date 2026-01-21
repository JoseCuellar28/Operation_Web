import api from './api';

export interface AttendanceRecord {
    id: number;
    dni: string;
    nombre: string;
    fecha: string; // ISO
    tipo: 'INGRESO' | 'SALIDA' | 'REFRIGERIO';
    lat?: number;
    lng?: number;
    dispositivo?: string;
    estado: 'A TIEMPO' | 'TARDE' | 'JUSTIFICADO';
}

export const attendanceService = {
    getDailyLogs: async (): Promise<AttendanceRecord[]> => {
        // Attempt real endpoint or mock
        try {
            const response = await api.get('/api/asistencia/diaria');
            return response.data;
        } catch (e) {
            // Mock data for "Fidelidad Web 1" demonstration
            return [
                { id: 1, dni: '41007510', nombre: 'JUAN PEREZ', fecha: new Date().toISOString(), tipo: 'INGRESO', estado: 'A TIEMPO', lat: -12.046, lng: -77.042 },
                { id: 2, dni: '10203040', nombre: 'MARIA LOPEZ', fecha: new Date(Date.now() - 3600000).toISOString(), tipo: 'INGRESO', estado: 'TARDE', lat: -12.050, lng: -77.030 },
            ];
        }
    }
};
