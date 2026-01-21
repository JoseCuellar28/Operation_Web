
import { useState, useEffect } from 'react';
import { Truck, AlertTriangle, CheckCircle2, Wrench, XCircle, Search, Activity, History, PlusCircle, Save, X } from 'lucide-react';

interface Vehicle {
    placa: string;
    marca: string;
    tipo_activo: string;
    estado: string; // OPERATIVO, TALLER
    ultimo_km_registrado: number;
    proximo_mant_km: number;
    excedente_km: number;
    ultima_inspeccion?: string;
    ultimo_conductor?: string;
}

interface Inspection {
    id_registro: number;
    fecha_registro: string;
    tipo_evento: string;
    kilometraje: number;
    conductor: string;
    checklist_data: string; // JSON
    observaciones?: string;
}

export default function FleetMonitorView() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Drawer State
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [history, setHistory] = useState<Inspection[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Modal Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tipo_evento: 'CHECKIN',
        kilometraje: 0,
        conductor: '',
        observaciones: '',
        checklist: {
            frenos: true,
            luces: true,
            neumaticos: true,
            aceite: true
        }
    });

    useEffect(() => {
        fetchFleet();
    }, []);

    const fetchFleet = async () => {
        try {
            const res = await fetch('/api/v1/fleet/monitor');
            if (res.ok) setVehicles(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchHistory = async (placa: string) => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/v1/fleet/${placa}/history`);
            if (res.ok) setHistory(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoadingHistory(false); }
    };

    const handleOpenDrawer = (v: Vehicle) => {
        setSelectedVehicle(v);
        fetchHistory(v.placa);
        // Reset form init values
        setFormData(prev => ({
            ...prev,
            kilometraje: v.ultimo_km_registrado || 0,
            conductor: v.ultimo_conductor || ''
        }));
    };

    const handleSubmitInspection = async () => {
        if (!selectedVehicle) return;

        try {
            const payload = {
                placa: selectedVehicle.placa,
                tipo_evento: formData.tipo_evento,
                kilometraje: Number(formData.kilometraje),
                conductor: formData.conductor,
                observaciones: formData.observaciones,
                checklist_data: formData.checklist
            };

            const res = await fetch('/api/v1/fleet/inspection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Inspección Registrada');
                setShowForm(false);
                fetchHistory(selectedVehicle.placa); // Refresh History
                fetchFleet(); // Refresh Main Monitor

                // Update local selected vehicle KM
                setSelectedVehicle(prev => prev ? ({ ...prev, ultimo_km_registrado: payload.kilometraje }) : null);
            } else {
                alert('Error al registrar');
            }
        } catch (e) {
            console.error(e);
            alert('Error de conexión');
        }
    };

    const filtered = vehicles.filter(v =>
        v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marca.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-gray-50 relative">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Truck className="text-blue-600" />
                            Monitor de Flota
                        </h1>
                        <p className="text-xs text-gray-500">Trazabilidad de activos y alertas de mantenimiento</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar placa..."
                            className="pl-9 pr-4 py-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white border rounded-lg p-3 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Truck size={20} /></div>
                        <div>
                            <div className="text-2xl font-bold">{vehicles.length}</div>
                            <div className="text-xs text-gray-500">Total Flota</div>
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg p-3 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle2 size={20} /></div>
                        <div>
                            <div className="text-2xl font-bold">{vehicles.filter(v => v.estado === 'OPERATIVO').length}</div>
                            <div className="text-xs text-gray-500">Operativos</div>
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg p-3 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><AlertTriangle size={20} /></div>
                        <div>
                            <div className="text-2xl font-bold">{vehicles.filter(v => v.excedente_km >= 0).length}</div>
                            <div className="text-xs text-gray-500">Mantenimiento Pendiente</div>
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg p-3 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-red-50 rounded-lg text-red-600"><Wrench size={20} /></div>
                        <div>
                            <div className="text-2xl font-bold">{vehicles.filter(v => v.estado === 'TALLER').length}</div>
                            <div className="text-xs text-gray-500">En Taller</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(vehicle => {
                        const isMaintenanceDue = vehicle.excedente_km >= 0;
                        const isTaller = vehicle.estado === 'TALLER';

                        return (
                            <div
                                key={vehicle.placa}
                                className={`
                                    bg-white rounded-lg shadow-sm border-l-4 p-4 cursor-pointer hover:shadow-md transition-all group
                                    ${isTaller ? 'border-red-500' : isMaintenanceDue ? 'border-yellow-500' : 'border-green-500'}
                                `}
                                onClick={() => handleOpenDrawer(vehicle)}
                            >
                                {/* Header Card */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{vehicle.placa}</h3>
                                        <div className="text-xs text-gray-500 uppercase font-medium">{vehicle.marca} • {vehicle.tipo_activo}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${isTaller ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {vehicle.estado}
                                    </span>
                                </div>

                                {/* KM Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Odómetro</span>
                                        <span className="font-mono font-bold text-gray-700">{(vehicle.ultimo_km_registrado || 0).toLocaleString()} km</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${isMaintenanceDue ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(((vehicle.ultimo_km_registrado || 0) / (vehicle.proximo_mant_km || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                        <span>Último Servicio</span>
                                        <span>Meta: {(vehicle.proximo_mant_km || 0).toLocaleString()} km</span>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {isMaintenanceDue && (
                                    <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-2 rounded text-xs font-bold mb-3">
                                        <AlertTriangle size={14} />
                                        MANTENIMIENTO REQUERIDO (+{vehicle.excedente_km || 0})
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-4 text-xs text-gray-400 border-t pt-3">
                                    <div className="flex items-center gap-1">
                                        <Activity size={12} />
                                        {vehicle.ultima_inspeccion ? new Date(vehicle.ultima_inspeccion).toLocaleDateString() : 'Sin registros'}
                                    </div>
                                    <span className="text-blue-600 font-medium group-hover:underline">Ver Detalle &rarr;</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DRAWER: Hoja de Vida */}
            {selectedVehicle && (
                <div className="absolute inset-y-0 right-0 w-[450px] bg-white shadow-2xl border-l z-20 flex flex-col transform transition-transform duration-300">
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Hoja de Vida</h2>
                            <p className="text-sm text-gray-500 font-mono">{selectedVehicle.placa}</p>
                        </div>
                        <button onClick={() => setSelectedVehicle(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <XCircle size={24} className="text-gray-400 hover:text-gray-600" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-5 scrollbar-thin">
                        {/* Status Section */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <Activity size={16} className="text-blue-500" /> Estado Actual
                                </h3>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                                >
                                    <PlusCircle size={14} /> Nueva Inspección
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="block text-xs text-gray-500 mb-1">Kilometraje Actual</span>
                                    <span className="font-mono font-bold text-xl text-gray-800">{(selectedVehicle.ultimo_km_registrado || 0).toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <span className="block text-xs text-gray-500 mb-1">Próx. Mantenimiento</span>
                                    <span className={`font-mono font-bold text-xl ${selectedVehicle.excedente_km >= 0 ? 'text-red-500' : 'text-gray-800'}`}>
                                        {(selectedVehicle.proximo_mant_km || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* History Timeline */}
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2 border-b pb-2">
                                <History size={16} /> Historial de Eventos
                            </h3>
                            {loadingHistory ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed">
                                    No hay registros históricos.
                                    <br />
                                    <span className="text-xs">Registre la primera inspección arriba.</span>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                                    {history.map((h) => {
                                        const checklist = JSON.parse(h.checklist_data || '{}');
                                        const isIssue = checklist.frenos === false || checklist.direccion === false;

                                        return (
                                            <div key={h.id_registro} className="ml-6 relative">
                                                <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white ring-1 ring-gray-100 ${isIssue ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                <div className="bg-white border hover:border-blue-300 transition-colors rounded-lg p-3 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-sm text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{h.tipo_evento}</span>
                                                        <span className="text-xs text-gray-400 font-mono">{new Date(h.fecha_registro).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 mb-2 flex items-center gap-4">
                                                        <span>👤 {h.conductor || 'Sin conductor'}</span>
                                                        <span className="font-mono border-l pl-4">🛣️ {(h.kilometraje || 0).toLocaleString()} km</span>
                                                    </div>

                                                    {isIssue && (
                                                        <div className="bg-red-50 text-red-700 p-2 rounded text-xs mb-2 border border-red-100">
                                                            ⚠️ <strong>Fallo Crítico:</strong> Revise Checklist
                                                        </div>
                                                    )}

                                                    {h.observaciones && (
                                                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">"{h.observaciones}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Nueva Inspección */}
            {showForm && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <PlusCircle size={20} /> Registrar Evento
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">TIPO DE EVENTO</label>
                                <select
                                    className="w-full border rounded p-2 text-sm bg-gray-50"
                                    value={formData.tipo_evento}
                                    onChange={e => setFormData({ ...formData, tipo_evento: e.target.value })}
                                >
                                    <option value="CHECKIN">ENTRADA (CHECK-IN)</option>
                                    <option value="CHECKOUT">SALIDA (CHECK-OUT)</option>
                                    <option value="MANTENIMIENTO">MANTENIMIENTO PREVENTIVO</option>
                                    <option value="REPARACION">REPARACIÓN (TALLER)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">ODÓMETRO (KM)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2 text-sm"
                                        value={formData.kilometraje}
                                        onChange={e => setFormData({ ...formData, kilometraje: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">CONDUCTOR</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded p-2 text-sm"
                                        placeholder="Nombre..."
                                        value={formData.conductor}
                                        onChange={e => setFormData({ ...formData, conductor: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded border">
                                <label className="block text-xs font-bold text-gray-500 mb-2 border-b pb-1">CHECKLIST RÁPIDO</label>
                                <div className="space-y-2">
                                    {Object.entries(formData.checklist).map(([key, val]) => (
                                        <div key={key} className="flex justify-between items-center text-sm">
                                            <span className="capitalize text-gray-700">{key}</span>
                                            <button
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    checklist: { ...prev.checklist, [key]: !val } // Toggle
                                                }))}
                                                className={`px-3 py-1 rounded text-xs font-bold w-16 transition-colors ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                {val ? 'OK' : 'FAIL'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">OBSERVACIONES</label>
                                <textarea
                                    className="w-full border rounded p-2 text-sm h-20 resize-none"
                                    placeholder="Detalles adicionales..."
                                    value={formData.observaciones}
                                    onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleSubmitInspection}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
                            >
                                <Save size={18} /> {formData.checklist.frenos ? 'Guardar Registro' : 'Guardar y Alertar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
