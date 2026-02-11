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
    getDailyLogs: async (date?: string): Promise<AttendanceRecord[]> => {
        // Attempt real endpoint or mock
        try {
            // Default to today in YYYY-MM-DD format if not provided
            const queryDate = date || new Date().toISOString().split('T')[0];

            // Backend expects: /api/v1/attendance?date=YYYY-MM-DD
            const response = await api.get(`/api/v1/attendance?date=${queryDate}`);
            return response.data;
        } catch (e) {
            console.error('[AttendanceService] Failed to load attendance. Using fallback mock.', e);
            // Mock data for "Fidelidad Web 1" demonstration
            return [
                { id: 1, dni: '41007510', nombre: 'JUAN PEREZ', fecha: new Date().toISOString(), tipo: 'INGRESO', estado: 'A TIEMPO', lat: -12.046, lng: -77.042 },
                { id: 2, dni: '10203040', nombre: 'MARIA LOPEZ', fecha: new Date(Date.now() - 3600000).toISOString(), tipo: 'INGRESO', estado: 'TARDE', lat: -12.050, lng: -77.030 },
            ];
        }
    }
};
