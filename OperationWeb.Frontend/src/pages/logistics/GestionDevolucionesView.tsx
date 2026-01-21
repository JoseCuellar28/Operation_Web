
import { useState, useEffect } from 'react';
import { Truck, RotateCcw, Search, Package, AlertTriangle, ArrowRight, CheckCircle, Save } from 'lucide-react';

interface StockItem {
    id_material: string;
    nombre: string;
    cantidad: number;
    id_responsable: string; // Plate or DNI
    tipo_custodio: string;
}

interface ReturnItem extends StockItem {
    returnQty: number;
    status: 'BUENO' | 'MALO'; // Condition
}

interface CrewResult {
    id_cuadrilla: string;
    placa_vehiculo: string;
    lider_dni: string;
}

export default function GestionDevolucionesView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [crew, setCrew] = useState<CrewResult | null>(null);
    const [stock, setStock] = useState<StockItem[]>([]);
    const [returnCart, setReturnCart] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

    // 1. Search Crew by Plate or Code (Mock for now, or reuse endpoint)
    // To make it real, we need an endpoint to search crew by term.
    // For now we will allow typing a crew UUID or just assume the user finds it via a list.
    // BETTER: We can reuse `GET /api/v1/cuadrillas` filtering on client side or build `GET /api/v1/cuadrillas/search?q=...`
    // Let's implement a simple fetch of ALL active crews and filter client side for MVP.
    const searchCrew = async () => {
        if (!searchTerm) return;
        setLoading(true);
        try {
            // Reusing existing endpoint for Active Crews
            const res = await fetch('http://localhost:3000/api/v1/cuadrillas');
            const rawData = await res.json();

            // FIX: Map Server Structure (Nested) to Frontend Structure (Flat)
            const data: CrewResult[] = rawData.map((c: any) => ({
                id_cuadrilla: c.id,
                placa_vehiculo: c.vehicle?.plate || 'SIN-PLACA',
                lider_dni: c.leader?.id || 'UNKNOWN', // Using ID as DNI proxy or we might need to fetch DNI
                codigo: c.code
            }));

            // Filter
            const found = data.find((c: any) =>
                c.placa_vehiculo.includes(searchTerm.toUpperCase()) ||
                (c.codigo && c.codigo.includes(searchTerm.toUpperCase())) // Check code if exists
            );

            if (found) {
                setCrew(found);
                fetchStock(found.id_cuadrilla);
                setReturnCart([]);
                setResult(null);
            } else {
                alert('Cuadrilla no encontrada (Asegúrese que esté programada para hoy)');
                setCrew(null);
                setStock([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch Crew Stock
    const fetchStock = async (crewId: string) => {
        try {
            const res = await fetch(`http://localhost:3000/api/v1/logistics/crew-stock/${crewId}`);
            const data = await res.json();
            setStock(data);
        } catch (err) {
            console.error(err);
        }
    };

    // 3. Add to Cart
    const addToReturn = (item: StockItem) => {
        if (returnCart.find(r => r.id_material === item.id_material)) return;
        setReturnCart([...returnCart, { ...item, returnQty: 1, status: 'BUENO' }]);
    };

    const updateCartItem = (id: string, field: keyof ReturnItem, value: any) => {
        setReturnCart(prev => prev.map(item => {
            if (item.id_material !== id) return item;

            if (field === 'returnQty') {
                // Validate max 
                const max = stock.find(s => s.id_material === id)?.cantidad || 0;
                return { ...item, returnQty: Math.min(Math.max(1, value), max) };
            }

            return { ...item, [field]: value };
        }));
    };

    const removeCartItem = (id: string) => {
        setReturnCart(prev => prev.filter(i => i.id_material !== id));
    };

    // 4. Submit Return
    const handleProcessReturn = async () => {
        if (!crew) return;
        setProcessing(true);
        try {
            const payload = {
                id_cuadrilla: crew.id_cuadrilla,
                items: returnCart.map(i => ({
                    id_material: i.id_material,
                    cantidad: i.returnQty,
                    estado: i.status
                }))
            };

            const res = await fetch('http://localhost:3000/api/v1/logistics/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setResult({ success: true, msg: 'Devolución procesada exitosamente.' });
                setReturnCart([]);
                // Refresh stock
                fetchStock(crew.id_cuadrilla);
            } else {
                setResult({ success: false, msg: 'Error al procesar devolución.' });
            }

        } catch (err) {
            setResult({ success: false, msg: 'Error de conexión.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <RotateCcw className="text-orange-600" />
                        Logística Inversa (Devoluciones)
                    </h1>
                    <p className="text-sm text-gray-500">Reingreso de materiales y equipos (Sobrantes o Chatarra)</p>
                </div>
            </header>

            <div className="flex-1 overflow-hidden p-6 flex gap-6">

                {/* LEFT: Search & Stock */}
                <div className="w-1/2 flex flex-col gap-6">
                    {/* Search Box */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Buscar Cuadrilla / Vehículo</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ej: ABC-123 o C104"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchCrew()}
                            />
                            <button
                                onClick={searchCrew}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Stock List */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Package size={18} />
                                Stock en Custodia
                            </h3>
                            {crew && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium border border-blue-200">
                                    {crew.placa_vehiculo}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {!crew ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Truck size={48} className="mb-2 opacity-50" />
                                    <p>Busque una cuadrilla para ver su stock</p>
                                </div>
                            ) : stock.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 italic">
                                    Sin stock registrado en custodia.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {stock.map(item => {
                                        const inCart = returnCart.find(r => r.id_material === item.id_material);
                                        return (
                                            <div key={item.id_material} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{item.nombre}</p>
                                                        <p className="text-xs text-gray-500">Disp: {item.cantidad}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => addToReturn(item)}
                                                    disabled={!!inCart}
                                                    className={`px-3 py-1 text-xs font-semibold rounded border transition-all ${inCart
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                                                        }`}
                                                >
                                                    {inCart ? 'Agregado' : 'Devolver'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Return Cart */}
                <div className="w-1/2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-orange-50 flex justify-between items-center">
                        <h3 className="font-bold text-orange-800 flex items-center gap-2">
                            <RotateCcw size={18} />
                            Materiales a Reingresar
                        </h3>
                        <span className="text-xs text-orange-700 font-medium">
                            {returnCart.length} Ítems seleccionados
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {returnCart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                    <ArrowRight size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm">Seleccione items del stock para devolverlos</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {returnCart.map(item => (
                                    <div key={item.id_material} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white relative group">
                                        <button
                                            onClick={() => removeCartItem(item.id_material)}
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                                        >
                                            &times;
                                        </button>

                                        <div className="mb-3">
                                            <p className="font-medium text-gray-900">{item.nombre}</p>
                                        </div>

                                        <div className="flex items-end gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Cantidad a devolver</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={stock.find(s => s.id_material === item.id_material)?.cantidad}
                                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-semibold"
                                                    value={item.returnQty}
                                                    onChange={e => updateCartItem(item.id_material, 'returnQty', parseInt(e.target.value))}
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-500 mb-1">Estado Físico</label>
                                                <select
                                                    className={`w-full border rounded px-2 py-1.5 text-sm font-semibold ${item.status === 'BUENO' ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'
                                                        }`}
                                                    value={item.status}
                                                    onChange={e => updateCartItem(item.id_material, 'status', e.target.value)}
                                                >
                                                    <option value="BUENO">OPERATIVO (Bueno)</option>
                                                    <option value="MALO">DAÑADO (Chatarra)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        {result && (
                            <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {result.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                {result.msg}
                            </div>
                        )}

                        <button
                            onClick={handleProcessReturn}
                            disabled={returnCart.length === 0 || processing}
                            className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <span>Procesando...</span>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Confirmar Reingreso al Almacén
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
