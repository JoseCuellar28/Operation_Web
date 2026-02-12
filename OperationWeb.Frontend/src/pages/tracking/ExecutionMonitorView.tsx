import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, MapPin, Search, ChevronRight } from 'lucide-react';
import api from '../../services/api';

interface ExecutionOrder {
    id_ot: string;
    codigo_suministro: string;
    estado: string;
    hora_inicio_real: string;
    hora_fin_real: string | null;
    cliente: string;
    direccion_fisica: string;
    tipo_trabajo: string;
    cuadrilla_codigo: string;
    duracion_minutos: number;
}

export default function ExecutionMonitorView({ onViewChange }: { onViewChange: (view: string, id?: string) => void }) {
    const [orders, setOrders] = useState<ExecutionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchExecutionData = async () => {
        try {
            const response = await api.get('/api/v1/execution/monitor');
            const data = response.data;
            setOrders(data);
        } catch (error) {
            console.error('Error fetching execution monitor:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExecutionData();
        // Poll every 30 seconds to update dashboard
        const interval = setInterval(fetchExecutionData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: string, duration: number) => {
        // Logic for amber/red alerts based on duration could go here
        // For now, simpler map
        switch (status) {
            case 'EJECUCION':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                        <Clock size={12} className="mr-1" />
                        En Ejecución
                    </span>
                );
            case 'CERRADA_TECNICO':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <CheckCircle2 size={12} className="mr-1" />
                        Cerrada (Técnico)
                    </span>
                );
            case 'FALLIDA':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle size={12} className="mr-1" />
                        Fallida
                    </span>
                );
            default:
                return <span className="text-gray-500">{status}</span>;
        }
    };

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const filteredOrders = orders.filter(o =>
        o.codigo_suministro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.cuadrilla_codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monitor de Ejecución</h1>
                    <p className="text-sm text-gray-500">Supervisión en tiempo real de cuadrillas en campo</p>
                </div>
                <div className="w-64 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar OT o Cuadrilla..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex-1">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Clock size={48} className="mb-4 text-gray-300" />
                        <p>No hay órdenes en ejecución activa hoy.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden / Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuadrilla</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => {
                                const isOverdue = order.duracion_minutos > 120; // Example alert threshold (2 hours)

                                return (
                                    <tr
                                        key={order.id_ot}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => onViewChange('detalle-auditoria', order.id_ot)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{order.codigo_suministro}</div>
                                            <div className="text-xs text-gray-500">{order.cliente}</div>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                <MapPin size={10} />
                                                {order.direccion_fisica}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {order.cuadrilla_codigo || 'Sin Asignar'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {order.hora_inicio_real ? new Date(order.hora_inicio_real).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-bold ${isOverdue ? 'text-amber-600' : 'text-gray-900'}`}>
                                                {formatDuration(order.duracion_minutos)}
                                            </div>
                                            {isOverdue && <span className="text-[10px] text-amber-600 font-medium">Posible Retraso</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.estado, order.duracion_minutos)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
