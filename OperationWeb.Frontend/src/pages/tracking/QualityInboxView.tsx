import { useState, useEffect } from 'react';
import { Search, Filter, AlertOctagon, CheckCircle2, FileVideo, Package } from 'lucide-react';
import api from '../../services/api';

interface QualityOrder {
    id_ot: string;
    codigo_suministro: string;
    cliente: string;
    estado: string;
    hora_fin_real: string;
    flag_prioridad_calidad: boolean;
    tipo_trabajo: string;
    direccion_fisica: string;
    total_evidencias: number;
    total_excedentes: number;
}

export default function QualityInboxView({ onViewChange }: { onViewChange: (view: string, id: string) => void }) {
    const [orders, setOrders] = useState<QualityOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async () => {
        try {
            const res = await api.get('/api/v1/quality/inbox');
            const data = res.data;
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = orders.filter(o =>
        o.codigo_suministro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Control de Calidad</h1>
                    <p className="text-sm text-gray-500">Bandeja de auditoría de registros cerrados</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar OT..."
                            className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
                {loading ? (
                    <div className="text-center py-10">Cargando bandeja...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No hay órdenes pendientes de revisión</div>
                ) : (
                    filtered.map(ot => (
                        <div
                            key={ot.id_ot}
                            onClick={() => onViewChange('auditoria-detalle', ot.id_ot)}
                            className={`
                                bg-white p-4 rounded-lg shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all
                                flex items-center justify-between
                                ${ot.flag_prioridad_calidad ? 'border-l-red-500' : 'border-l-gray-300'}
                            `}
                        >
                            {/* OT Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">{ot.codigo_suministro}</span>
                                    {ot.flag_prioridad_calidad && (
                                        <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                            <AlertOctagon size={10} /> REVISIÓN PRIORITARIA
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">| {ot.tipo_trabajo}</span>
                                </div>
                                <div className="text-sm text-gray-600">{ot.cliente}</div>
                                <div className="text-xs text-gray-400 mt-1">{ot.direccion_fisica}</div>
                            </div>

                            {/* Indicators */}
                            <div className="flex items-center gap-6 mr-6">
                                <div className="text-center">
                                    <span className="block text-xs text-gray-400 mb-1">Evidencias</span>
                                    <div className="flex items-center justify-center gap-1 text-gray-700 font-medium">
                                        <FileVideo size={16} className="text-blue-500" />
                                        {ot.total_evidencias}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs text-gray-400 mb-1">Excedentes</span>
                                    <div className="flex items-center justify-center gap-1 text-gray-700 font-medium">
                                        <Package size={16} className={ot.total_excedentes > 0 ? 'text-amber-500' : 'text-gray-300'} />
                                        {ot.total_excedentes}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs text-gray-400 mb-1">Cierre</span>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                        {new Date(ot.hora_fin_real).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                {ot.estado === 'OBSERVADA' ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                        OBSERVADA
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                        PARA REVISIÓN
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
