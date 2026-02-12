import { useState, useEffect } from 'react';
import { ShieldAlert, Search, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

interface Incident {
    id_incidente: number;
    id_cuadrilla: string;
    gravedad: 'LEVE' | 'GRAVE' | 'MORTAL';
    descripcion: string;
    evidencia_url: string;
    estado: 'ABIERTO' | 'CERRADO' | 'ESCALADO';
    timestamp_inicio: string;
}

export default function HSEMonitorView() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [showRedAlert, setShowRedAlert] = useState<Incident | null>(null);

    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

    // Poll Real SQL Data every 5 seconds
    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const res = await api.get('/api/v1/hse/incidents');
                const data = res.data;
                setIncidents(data);

                // Check for new Critical Incidents (simulated logic for "Push" behavior)
                // In production we would compare with previous state or use a timestamp cursor
                const critical = data.find((i: Incident) => (i.gravedad === 'GRAVE' || i.gravedad === 'MORTAL') && i.estado === 'ABIERTO');
                if (critical) {
                    // Only show if we haven't acknowledged it yet (Local Storage or Context logic needed for real prod)
                    // For demo purposes, we trust the "Simulate" button or manual trigger mostly, 
                    // but let's confirm logic.
                }
            } catch (e) { console.error(e); }
        };

        fetchIncidents();
        const interval = setInterval(fetchIncidents, 5000);
        return () => clearInterval(interval);
    }, []);

    // Helper to simulate receiving a Critical Alert Push (keeps demo functionality active for easy testing)
    const simulateCriticalRef = async () => {
        // Now calling the REAL Backend to create the incident first!
        try {
            const mockCritical = {
                id_cuadrilla: 'C-08',
                gravedad: 'GRAVE',
                descripcion: 'Accidente Real Inyectado en BD (Caída de altura)',
                evidencia_url: 'http://evidence.com/photo.jpg'
            };

            await api.post('/api/v1/hse/incident', mockCritical);

            // The polling will pick it up, but for instant UI feedback we fetch immediately
            const res = await api.get('/api/v1/hse/incidents');
            const data = res.data;
            setIncidents(data);
            const newItem = data.find((x: any) => x.descripcion === mockCritical.descripcion);
            if (newItem) setShowRedAlert(newItem);

            new Audio('https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg').play().catch(() => null);
        } catch (e) { alert("Error connecting to DB"); }
    };

    return (
        <div className="p-6 h-full bg-gray-50 flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="text-red-600" /> Supervisión en Campo
                </h1>
                <button
                    onClick={simulateCriticalRef}
                    className="bg-gray-200 text-xs px-2 py-1 rounded hover:bg-gray-300"
                >
                    Inyectar Incidente Real en SQL
                </button>
            </div>

            {/* Red Screen Modal for Critical Incidents */}
            {showRedAlert && (
                <div className="fixed inset-0 z-[9999] bg-red-600 flex items-center justify-center animate-pulse">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl text-center border-4 border-red-900">
                        <AlertTriangle className="mx-auto text-red-600 mb-4 w-24 h-24" />
                        <h2 className="text-4xl font-black text-red-700 mb-2">¡ALERTA DE SEGURIDAD!</h2>
                        <div className="text-2xl font-bold mb-6">INCIDENTE {showRedAlert.gravedad} REPORTADO</div>

                        <div className="bg-red-50 p-6 rounded-lg mb-6 text-left">
                            <p><strong>Cuadrilla:</strong> {showRedAlert.id_cuadrilla}</p>
                            <p><strong>Descripción:</strong> {showRedAlert.descripcion}</p>
                            <p><strong>Hora:</strong> {new Date(showRedAlert.timestamp_inicio).toLocaleTimeString()}</p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setShowRedAlert(null)}
                                className="bg-red-700 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-red-800"
                            >
                                ENTENDIDO - INICIAR PROTOCOLO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Construction Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="text-blue-600 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Reporte Detallado</h3>
                        <p className="text-gray-500 mb-6">
                            El módulo de investigación de accidentes y reporte legal está actualmente en construcción.
                        </p>
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Real Stats from Data */}
                <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
                    <div className="text-gray-500 font-medium">Incidentes Abiertos</div>
                    <div className="text-3xl font-bold text-gray-800">
                        {incidents.filter(i => i.estado === 'ABIERTO').length}
                    </div>
                </div>
                {/* ... other stats mocked for now ... */}
                <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
                    <div className="text-gray-500 font-medium">Técnicos Bloqueados</div>
                    <div className="text-3xl font-bold text-gray-800">
                        {incidents.filter(i => i.gravedad === 'GRAVE' && i.estado === 'ABIERTO').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                    <div className="text-gray-500 font-medium">Auditorías Hoy</div>
                    <div className="text-3xl font-bold text-gray-800">
                        {incidents.length}
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between">
                    <span>Incidencias Recientes (SQL Server)</span>
                    <Search className="text-gray-400" size={20} />
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-500 border-b">
                                <th className="pb-2">Fecha</th>
                                <th className="pb-2">Nivel</th>
                                <th className="pb-2">Cuadrilla</th>
                                <th className="pb-2">Descripción</th>
                                <th className="pb-2">Impacto (Bloqueo)</th>
                                <th className="pb-2">Estado</th>
                                <th className="pb-2">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.map((inc) => (
                                <tr key={inc.id_incidente} className={`border-b ${inc.gravedad !== 'LEVE' ? 'hover:bg-red-50' : ''}`}>
                                    <td className="py-3 text-sm">{new Date(inc.timestamp_inicio).toLocaleDateString()}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${inc.gravedad === 'LEVE' ? 'bg-yellow-100 text-yellow-700' :
                                            inc.gravedad === 'GRAVE' ? 'bg-orange-100 text-orange-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {inc.gravedad}
                                        </span>
                                    </td>
                                    <td className="py-3 font-bold">{inc.id_cuadrilla}</td>
                                    <td className="py-3 text-sm text-gray-600">{inc.descripcion}</td>
                                    <td className="py-3">
                                        {inc.gravedad === 'GRAVE' || inc.gravedad === 'MORTAL' ? (
                                            <span className="inline-flex w-fit items-center gap-1 text-xs font-extrabold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                                                <ShieldAlert size={12} />
                                                BLOQUEO ACTIVO
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">--</span>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        <span className={`font-bold text-xs ${inc.estado === 'ABIERTO' ? 'text-red-600' : 'text-gray-600'
                                            }`}>{inc.estado}</span>
                                    </td>
                                    <td className="py-3">
                                        <button
                                            onClick={() => setShowDetailModal(true)}
                                            className="text-blue-600 underline text-xs"
                                        >
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
