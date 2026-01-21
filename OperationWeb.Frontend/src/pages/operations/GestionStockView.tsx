import { useState, useEffect } from 'react';
import { Truck, Package, User, AlertTriangle, ArrowRight, CheckCircle, Search } from 'lucide-react';

interface PendingCrew {
    id_cuadrilla: number;
    codigo: string;
    placa_vehiculo: string;
    lider_nombre: string;
    lider_dni: string;
    nombre_kit: string;
    composicion_kit: {
        id_material: string;
        nombre: string;
        cantidad: number;
        tipo_custodio: 'TECNICO' | 'VEHICULO';
    }[];
}

// Mapeo de imágenes para demo realista
const getMaterialImage = (name: string) => {
    const n = name.toUpperCase();
    if (n.includes('TALADRO')) return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=150&q=80'; // Power Drill
    if (n.includes('ESCALERA')) return 'https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?auto=format&fit=crop&w=150&q=80'; // Ladder
    if (n.includes('MODEM') || n.includes('ONT') || n.includes('HUAWEI')) return 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=150&q=80'; // Router/Device
    if (n.includes('DECO')) return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=150&q=80'; // TV Box
    if (n.includes('CABLE')) return 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?auto=format&fit=crop&w=150&q=80'; // Cables
    if (n.includes('CONECTOR') || n.includes('SPLITTER') || n.includes('DIVISOR') || n.includes('GRAPA')) return 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=150&q=80'; // Small Parts
    if (n.includes('CINTA')) return 'https://images.unsplash.com/photo-1616401784845-180884810e61?auto=format&fit=crop&w=150&q=80'; // Tape
    if (n.includes('CASCO')) return 'https://images.unsplash.com/photo-1596464716127-f9a081942444?auto=format&fit=crop&w=150&q=80'; // Helmet

    return 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=150&q=80'; // Generic Tech
};

export default function GestionStockView() {
    const [pendingCrews, setPendingCrews] = useState<PendingCrew[]>([]);
    const [selectedCrew, setSelectedCrew] = useState<PendingCrew | null>(null);
    const [loading, setLoading] = useState(true);
    const [dispatching, setDispatching] = useState(false);
    const [vehicleCapacity, setVehicleCapacity] = useState({ total: 100, used: 0 });

    useEffect(() => {
        fetchPending();
    }, []);

    useEffect(() => {
        if (selectedCrew) {
            const getVolumePerUnit = (name: string, type: string) => {
                const n = name.toUpperCase();
                if (n.includes('ESCALERA')) return 200;
                if (n.includes('TALADRO') || n.includes('KIT')) return 20;
                if (n.includes('MODEM') || n.includes('DECO') || n.includes('ONT')) return 10;
                if (n.includes('CABLE')) return 0.2;
                if (n.includes('CONECTOR') || n.includes('GRAPA') || n.includes('CINTA') || n.includes('PRECINTOS')) return 0.05;
                if (type === 'VEHICULO') return 5;
                return 1;
            };

            const totalVolume = selectedCrew.composicion_kit.reduce((acc, item) => {
                return acc + (item.cantidad * getVolumePerUnit(item.nombre, item.tipo_custodio));
            }, 0);

            const MAX_CAPACITY = 1000;
            const usedPercentage = (totalVolume / MAX_CAPACITY) * 100;
            setVehicleCapacity({ total: MAX_CAPACITY, used: usedPercentage });
        }
    }, [selectedCrew]);

    const fetchPending = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/logistics/dispatches/pending');
            if (res.ok) {
                const data = await res.json();
                setPendingCrews(data);
                if (data.length > 0 && !selectedCrew) setSelectedCrew(data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [incidentText, setIncidentText] = useState('');

    // State for Current Stock (360 View)
    const [currentStock, setCurrentStock] = useState<any[]>([]);

    useEffect(() => {
        if (selectedCrew) {
            fetchCurrentStock(selectedCrew.id_cuadrilla);
        } else {
            setCurrentStock([]);
        }
    }, [selectedCrew]);

    const fetchCurrentStock = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:3000/api/v1/logistics/crew-stock/${id}`);
            if (res.ok) setCurrentStock(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    // Helper to get current stock of an item
    const getExistingQty = (id_material: string) => {
        const item = currentStock.find(x => x.id_material === id_material);
        return item ? item.cantidad : 0;
    };

    // Handle Quantity Edit
    const updateQuantity = (index: number, delta: number) => {
        if (!selectedCrew) return;
        const newCrew = { ...selectedCrew };
        const newItems = [...newCrew.composicion_kit];
        newItems[index].cantidad = Math.max(0, newItems[index].cantidad + delta);
        newCrew.composicion_kit = newItems;
        setSelectedCrew(newCrew);
    };

    const handleReportIncident = async () => {
        if (!selectedCrew || !incidentText) return;
        try {
            await fetch('http://localhost:3000/api/v1/logistics/incident', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_cuadrilla: selectedCrew.id_cuadrilla,
                    tipo: 'INCIDENCIA_DESPACHO',
                    comentario: incidentText,
                    usuario: 'Almacenero'
                })
            });
            alert('Incidencia reportada');
            setShowIncidentModal(false);
            setIncidentText('');
        } catch (e) {
            console.error(e);
            alert('Error reportando incidencia');
        }
    };

    const handleDispatch = async () => {
        if (!selectedCrew) return;
        setDispatching(true);
        try {
            const payload = {
                id_cuadrilla: selectedCrew.id_cuadrilla,
                placa: selectedCrew.placa_vehiculo,
                lider_dni: selectedCrew.lider_dni,
                items: selectedCrew.composicion_kit.map(k => ({
                    id_material: k.id_material,
                    cantidad: k.cantidad,
                    tipo_custodio: k.tipo_custodio
                })),
                usuario_responsable: 'Admin Logístico'
            };

            const res = await fetch('http://localhost:3000/api/v1/logistics/dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (res.ok) {
                alert('Despacho Exitoso');
                setPendingCrews(prev => prev.filter(c => c.id_cuadrilla !== selectedCrew.id_cuadrilla));
                setSelectedCrew(null);
            } else {
                alert('Error en despacho: ' + (json.error || 'Unknown'));
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        } finally {
            setDispatching(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando Mesa de Despacho...</div>;

    if (showIncidentModal) return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                <h3 className="font-bold text-lg mb-4">Reportar Incidencia</h3>
                <textarea
                    className="w-full border rounded p-2 mb-4 h-32"
                    placeholder="Describa el problema..."
                    value={incidentText}
                    onChange={e => setIncidentText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowIncidentModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                    <button onClick={handleReportIncident} className="px-4 py-2 bg-red-600 text-white rounded">Reportar</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex bg-gray-100 overflow-hidden">
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-blue-600" /> Cola de Despacho
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full ml-auto">{pendingCrews.length}</span>
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {pendingCrews.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            <CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
                            Todas las cuadrillas han sido despachadas.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {pendingCrews.map(crew => (
                                <div
                                    key={crew.id_cuadrilla}
                                    onClick={() => setSelectedCrew(crew)}
                                    className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedCrew?.id_cuadrilla === crew.id_cuadrilla ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-900">{crew.codigo}</span>
                                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Pendiente</span>
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-2 mb-1"><User size={14} /> {crew.lider_nombre}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2"><Truck size={14} /> {crew.placa_vehiculo}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedCrew ? (
                    <>
                        <div className="bg-white p-6 border-b border-gray-200 shadow-sm z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Despacho para {selectedCrew.codigo}</h1>
                                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                                        <Truck size={16} /> Placa: <span className="font-mono text-gray-900">{selectedCrew.placa_vehiculo}</span>
                                        <span className="text-gray-300">|</span>
                                        <Package size={16} /> Kit: <span className="font-medium text-blue-700">{selectedCrew.nombre_kit || 'Estándar'}</span>
                                    </p>
                                </div>
                                <div className="w-64">
                                    <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                                        <span>Ocupación Vehículo</span>
                                        <span className={vehicleCapacity.used > 100 ? 'text-red-700 font-bold' : vehicleCapacity.used > 80 ? 'text-orange-600' : 'text-green-600'}>
                                            {Math.round(vehicleCapacity.used)}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-500 ${vehicleCapacity.used > 100 ? 'bg-red-600' : vehicleCapacity.used > 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, vehicleCapacity.used)}%` }} />
                                    </div>
                                    {vehicleCapacity.used > 100 && (
                                        <p className="text-xs text-red-700 mt-2 flex items-start gap-1 font-bold animate-pulse">
                                            <AlertTriangle size={14} className="shrink-0 mt-0.5" /> <span>Sobrecarga Crítica</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Tools Section */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User size={16} className="text-indigo-600" /> Herramientas (Custodia Técnico)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedCrew.composicion_kit.filter(k => k.tipo_custodio === 'TECNICO').map((item, i) => {
                                        // Find index directly in master list? No, filter makes new array.
                                        // We need index in 'composicion_kit' to update.
                                        const globalIndex = selectedCrew.composicion_kit.indexOf(item);
                                        const existingQty = getExistingQty(item.id_material);

                                        return (
                                            <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow relative">
                                                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                                    <img src={getMaterialImage(item.nombre)} alt={item.nombre} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 text-sm leading-tight mb-1">{item.nombre}</div>

                                                    {/* 360 View: Existing Stock */}
                                                    {existingQty > 0 && (
                                                        <div className="text-xs text-orange-600 font-bold mb-2 bg-orange-50 inline-block px-1 rounded border border-orange-100">
                                                            Ya tiene: {existingQty}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateQuantity(globalIndex, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600 font-bold">-</button>
                                                        <div className="text-sm font-bold w-8 text-center">{item.cantidad}</div>
                                                        <button onClick={() => updateQuantity(globalIndex, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600 font-bold">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {selectedCrew.composicion_kit.filter(k => k.tipo_custodio === 'TECNICO').length === 0 && (
                                        <div className="text-gray-400 text-sm italic col-span-full">Sin herramientas asignadas</div>
                                    )}
                                </div>
                            </div>

                            {/* Materials Section */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Truck size={16} className="text-blue-600" /> Materiales (Custodia Vehículo)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedCrew.composicion_kit.filter(k => k.tipo_custodio === 'VEHICULO').map((item, i) => {
                                        const globalIndex = selectedCrew.composicion_kit.indexOf(item);
                                        const existingQty = getExistingQty(item.id_material);

                                        return (
                                            <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                                                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                                    <img src={getMaterialImage(item.nombre)} alt={item.nombre} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 text-sm leading-tight mb-1">{item.nombre}</div>

                                                    {existingQty > 0 && (
                                                        <div className="text-xs text-orange-600 font-bold mb-2 bg-orange-50 inline-block px-1 rounded border border-orange-100">
                                                            Ya tiene: {existingQty}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateQuantity(globalIndex, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600 font-bold">-</button>
                                                        <div className="text-sm font-bold w-8 text-center">{item.cantidad}</div>
                                                        <button onClick={() => updateQuantity(globalIndex, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600 font-bold">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={() => setShowIncidentModal(true)} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                Reportar Incidencia
                            </button>
                            <button
                                onClick={handleDispatch}
                                disabled={dispatching || selectedCrew.composicion_kit.length === 0 || vehicleCapacity.used > 100}
                                className={`px-8 py-3 font-bold rounded-lg transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${vehicleCapacity.used > 100 ? 'bg-red-800 text-white shadow-red-200' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
                            >
                                {dispatching ? 'Despachando...' : (vehicleCapacity.used > 100 ? 'Bloqueado: Sobrecarga' : 'Confirmar Despacho')}
                                {!dispatching && vehicleCapacity.used <= 100 && <ArrowRight size={20} />}
                                {vehicleCapacity.used > 100 && <AlertTriangle size={20} className="text-red-200" />}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <Package size={64} className="mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold text-gray-600">Mesa de Despacho Logístico</h2>
                        <p className="max-w-md text-center mt-2">Seleccione una cuadrilla de la cola para iniciar el proceso de preparación y despacho de materiales.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
