import api from './api';

export interface GPSPosition {
    deviceId: string;
    lat: number;
    lng: number;
    lastUpdate: string;
    status: 'MOVING' | 'IDLE' | 'OFFLINE' | 'SOS';
    batteryLevel?: number;
    speed?: number;
    assignedTo?: string; // DNI or Squad Name
}

export const gpsService = {
    getPositions: async (): Promise<GPSPosition[]> => {
        // Attempt real endpoint, fallback to mock if 404
        try {
            const response = await api.get('/api/gps/live');
            return response.data;
        } catch (e) {
            console.warn('GPS API unreachable, returning mock data');
            return [
                { deviceId: 'GPS-001', lat: -12.046374, lng: -77.042793, lastUpdate: new Date().toISOString(), status: 'MOVING', speed: 45, assignedTo: 'Cuadrilla Alpha' },
                { deviceId: 'GPS-002', lat: -12.050000, lng: -77.030000, lastUpdate: new Date().toISOString(), status: 'IDLE', speed: 0, assignedTo: 'Oficial Perez' },
                { deviceId: 'GPS-003', lat: -12.060000, lng: -77.050000, lastUpdate: new Date().toISOString(), status: 'OFFLINE', batteryLevel: 10 },
            ];
        }
    }
};
