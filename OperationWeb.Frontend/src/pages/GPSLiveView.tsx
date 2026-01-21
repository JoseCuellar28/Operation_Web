import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { gpsService, GPSPosition } from '../services/gpsService';
import { squadService, Squad } from '../services/squadService';
import { personalService, Employee } from '../services/personalService';
import { MapPin, Navigation, Battery, Signal, User, Truck, Save, X } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet Default Icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color: string) => new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

const Icons = {
    MOVING: createIcon('#22c55e'), // Green
    IDLE: createIcon('#eab308'),   // Yellow
    OFFLINE: createIcon('#64748b'), // Gray
    SOS: createIcon('#ef4444'),    // Red
};

export const GPSLiveView: React.FC = () => {
    const [positions, setPositions] = useState<GPSPosition[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<GPSPosition | null>(null);

    // Assignment Data
    const [squads, setSquads] = useState<Squad[]>([]);
    const [officers, setOfficers] = useState<Employee[]>([]);

    // Assignment Form
    const [assignType, setAssignType] = useState<'SQUAD' | 'OFFICER'>('SQUAD');
    const [assignValue, setAssignValue] = useState('');

    // Polling
    useEffect(() => {
        const fetchGPS = async () => {
            const data = await gpsService.getPositions();
            setPositions(data);
        };

        fetchGPS();
        const interval = setInterval(fetchGPS, 5000); // 5s Update
        return () => clearInterval(interval);
    }, []);

    // Fetch Resources for Side Menu
    useEffect(() => {
        Promise.all([
            squadService.getAll().catch(() => []),
            personalService.getAll().catch(() => [])
        ]).then(([sData, oData]) => {
            setSquads(sData);
            setOfficers(oData.filter(e => e.tipo === 'INSPECTOR' || e.tipo === 'SUPERVISOR'));
        });
    }, []);

    const handleAssign = () => {
        if (!selectedDevice || !assignValue) return;
        alert(`Asignado ${assignType} ${assignValue} al dispositivo ${selectedDevice.deviceId}`);
        // Here we would call an API to persist the assignment
        setSelectedDevice(null);
    };

    return (
        <div className="relative w-full h-full min-h-[calc(100vh-4rem)] flex">
            {/* Map Container */}
            <div className="flex-1 z-0 relative">
                <MapContainer center={[-12.046374, -77.042793]} zoom={13} style={{ width: '100%', height: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {positions.map(pos => (
                        <Marker
                            key={pos.deviceId}
                            position={[pos.lat, pos.lng]}
                            icon={Icons[pos.status] || Icons.OFFLINE}
                            eventHandlers={{
                                click: () => setSelectedDevice(pos),
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <p className="font-bold">{pos.deviceId}</p>
                                    <p>Estado: {pos.status}</p>
                                    <p>Velocidad: {pos.speed || 0} km/h</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Helper Legend */}
                <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[400] text-xs space-y-2">
                    <h4 className="font-bold mb-1">Estados</h4>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> En Movimiento</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Detenido</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-500"></div> Offline</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> SOS / Alerta</div>
                </div>
            </div>

            {/* Side Menu (Legacy Logic Port) */}
            <div
                className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-[1000] 
          ${selectedDevice ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {selectedDevice && (
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Navigation className="w-5 h-5 text-primary" />
                                Detalle GPS
                            </h2>
                            <button
                                onClick={() => setSelectedDevice(null)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto">
                            {/* Device Info */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">ID Dispositivo</span>
                                    <span className="font-medium">{selectedDevice.deviceId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Última Señal</span>
                                    <span className="font-medium text-xs">{new Date(selectedDevice.lastUpdate).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Batería</span>
                                    <span className="font-medium flex items-center gap-1 text-green-600">
                                        <Battery className="w-4 h-4" /> {selectedDevice.batteryLevel || '-'}%
                                    </span>
                                </div>
                            </div>

                            {/* Assignment Form (Legacy Feature) */}
                            <div className="border-t pt-4">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Asignación de Recurso
                                </h3>

                                <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setAssignType('SQUAD')}
                                        className={`flex-1 py-1 text-sm font-medium rounded-md transition-all ${assignType === 'SQUAD' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                                    >
                                        Cuadrilla
                                    </button>
                                    <button
                                        onClick={() => setAssignType('OFFICER')}
                                        className={`flex-1 py-1 text-sm font-medium rounded-md transition-all ${assignType === 'OFFICER' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                                    >
                                        Efectivo
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {assignType === 'SQUAD' ? (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Seleccionar Cuadrilla</label>
                                            <select
                                                className="w-full text-sm border-gray-300 rounded-md p-2 border"
                                                value={assignValue}
                                                onChange={(e) => setAssignValue(e.target.value)}
                                            >
                                                <option value="">-- Seleccionar --</option>
                                                {squads.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Seleccionar Efectivo</label>
                                            <select
                                                className="w-full text-sm border-gray-300 rounded-md p-2 border"
                                                value={assignValue}
                                                onChange={(e) => setAssignValue(e.target.value)}
                                            >
                                                <option value="">-- Seleccionar --</option>
                                                {officers.map(o => <option key={o.dni} value={o.dni}>{o.inspector}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAssign}
                                        disabled={!assignValue}
                                        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Guardar Asignación
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 text-center">
                            <span className="text-xs text-gray-400">Sistema GPS Legacy &copy; 2026</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
