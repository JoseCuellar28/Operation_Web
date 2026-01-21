import { useState, useEffect } from 'react';
import { ArrowLeft, Package, User, MapPin, Calendar, FileCheck, AlertCircle, ZoomIn, Download } from 'lucide-react';

interface Material {
    cod_material: string;
    cantidad: number;
    tipo_kardex: string;
    es_excedente: boolean;
    serie_retirada: string | null;
}

interface Evidence {
    tipo_evidencia: string;
    url_archivo: string;
    timestamp_gps: string;
}

interface OrderDetail {
    order: any;
    materials: Material[];
    evidence: Evidence[];
}

export default function OrderDetailView({
    orderId,
    onBack
}: {
    orderId: string,
    onBack: () => void
}) {
    const [data, setData] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/v1/execution/details/${orderId}`);
                if (!res.ok) throw new Error('Failed to load details');
                const json = await res.json();
                setData(json);
                if (json.evidence?.length > 0) {
                    setActiveImage(json.evidence[0].url_archivo);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [orderId]);

    if (loading) return <div className="p-10 text-center">Cargando expediente...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Error al cargar datos.</div>;

    const { order, materials, evidence } = data;

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Expediente: {order.codigo_suministro}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><User size={14} /> {order.cliente}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {order.direccion_fisica}</span>
                    </div>
                </div>
                <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.estado === 'EJECUCION' ? 'bg-blue-100 text-blue-800' :
                        order.estado === 'CERRADA_TECNICO' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                        }`}>
                        {order.estado}
                    </span>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Data & Kardex */}
                <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 bg-white">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Package size={20} className="text-blue-600" />
                        Kardex de Materiales
                    </h2>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Material</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-500">Cant.</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Serie Retirada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {materials.map((m, i) => (
                                    <tr key={i} className={m.es_excedente ? 'bg-yellow-50' : ''}>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {m.cod_material}
                                            {m.es_excedente && (
                                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                                                    EXCEDENTE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">{m.cantidad}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${m.tipo_kardex === 'INSTALADO' ? 'bg-green-50 text-green-700' :
                                                m.tipo_kardex === 'RETIRADO' ? 'bg-orange-50 text-orange-700' : 'bg-gray-100'
                                                }`}>
                                                {m.tipo_kardex}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                            {m.serie_retirada || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {materials.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                            No hay materiales registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-bold text-blue-900 mb-2">Resumen de Tiempos</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">Inicio Real</span>
                                <span className="font-mono">{order.hora_inicio_real ? new Date(order.hora_inicio_real).toLocaleString() : '-'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Fin Real</span>
                                <span className="font-mono">{order.hora_fin_real ? new Date(order.hora_fin_real).toLocaleString() : '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Analysis Card (Liquidation Context) */}
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
                            Análisis de Rentabilidad
                            <span className={`text-xs px-2 py-0.5 rounded border ${order.margin < 0 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                                {order.margin < 0 ? 'PÉRDIDA' : 'RENTABLE'}
                            </span>
                        </h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Ingreso (Venta)</span>
                                <span className="font-mono text-green-700 font-bold">+${order.price?.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-gray-200 my-1"></div>
                            <div className="flex justify-between items-center text-gray-500 text-xs">
                                <span>Materiales</span>
                                <span className="font-mono">-${order.cost_mat?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 text-xs">
                                <span>Mano de Obra</span>
                                <span className="font-mono">-${order.cost_mo?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 text-xs">
                                <span>Flota Asignada</span>
                                <span className="font-mono">-${order.cost_fleet?.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-gray-300 my-1"></div>
                            <div className="flex justify-between items-center font-bold">
                                <span>Margen Neto</span>
                                <span className={`font-mono text-lg ${order.margin < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    ${order.margin?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Evidence Gallery */}
                <div className="w-1/2 p-6 bg-gray-100 overflow-y-auto flex flex-col">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileCheck size={20} className="text-blue-600" />
                        Evidencias Digitales
                    </h2>

                    {evidence.length > 0 ? (
                        <>
                            {/* Main Viewer */}
                            <div className="flex-1 bg-black rounded-lg flex items-center justify-center relative mb-4 min-h-[400px]">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt="Evidencia"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <div className="text-white">Seleccione una imagen</div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70">
                                        <ZoomIn size={18} />
                                    </button>
                                    <button className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70">
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Carousel Strip */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {evidence.map((ev, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(ev.url_archivo)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === ev.url_archivo ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={ev.url_archivo}
                                            className="w-full h-full object-cover"
                                            alt={ev.tipo_evidencia}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                {evidence.find(e => e.url_archivo === activeImage)?.tipo_evidencia} • {evidence.find(e => e.url_archivo === activeImage)?.timestamp_gps}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                            <AlertCircle size={48} className="mb-2" />
                            <p>No hay evidencias cargadas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
