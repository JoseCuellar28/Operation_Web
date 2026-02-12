import { useState, useEffect } from 'react';
import {
    ArrowLeft, Package,
    CheckCircle, XCircle, RotateCw, ZoomIn,
    AlertTriangle
} from 'lucide-react';
import api from '../../services/api';

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

export default function QualityAuditView({
    orderId,
    onBack,
    onAuditComplete
}: {
    orderId: string,
    onBack: () => void,
    onAuditComplete: () => void
}) {
    const [data, setData] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // State for Image Viewer
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);

    // State for Edits
    const [editedMaterials, setEditedMaterials] = useState<{ [key: string]: number }>({});
    const [comment, setComment] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState<'VALIDATE' | 'REJECT' | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Reuse the GET details endpoint from Phase 4
                const res = await api.get(`/api/v1/execution/details/${orderId}`);
                const json = res.data;
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

    const handleMaterialChange = (cod: string, val: string) => {
        const num = parseInt(val);
        if (!isNaN(num)) {
            setEditedMaterials(prev => ({ ...prev, [cod]: num }));
        }
    };

    const handleCommitAudit = async (status: 'VALIDADA_OK' | 'VALIDADA_CON_AJUSTE' | 'OBSERVADA') => {
        // 1. Prepare Changes List
        const changes = [];
        if (data && data.materials) {
            for (const m of data.materials) {
                if (editedMaterials[m.cod_material] !== undefined && editedMaterials[m.cod_material] !== m.cantidad) {
                    changes.push({
                        tipo: 'MATERIAL',
                        campo: 'cantidad',
                        material_cod: m.cod_material,
                        valor_ant: m.cantidad,
                        valor_nuevo: editedMaterials[m.cod_material]
                    });
                }
            }
        }

        // 2. Determine Final Status if Validating
        let finalStatus = status;
        if (status === 'VALIDADA_OK' && changes.length > 0) {
            finalStatus = 'VALIDADA_CON_AJUSTE';
        }

        try {
            await api.post('/api/v1/quality/audit', {
                id_ot: orderId,
                nuevo_estado: finalStatus,
                comentario: comment,
                cambios: changes
            });
            onAuditComplete(); // Go back to Inbox
        } catch (err) {
            alert('Error guardando auditoría');
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando expediente...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Error al cargar datos.</div>;

    const { order, materials, evidence } = data;

    return (
        <div className="h-full flex flex-col bg-gray-50 relative">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-4 shadow-sm z-10">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Auditoría: {order.codigo_suministro}
                        {order.flag_prioridad_calidad && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">PRIORIDAD</span>
                        )}
                    </h1>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Editable Form */}
                <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 bg-white">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Package size={20} className="text-purple-600" />
                        Validación de Materiales
                    </h2>

                    <div className="border rounded-lg overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Material</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-500">Cant. Reportada</th>
                                    <th className="px-4 py-3 text-center font-medium text-purple-600 bg-purple-50">Cant. Auditoría</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {materials.map((m, i) => {
                                    const currentVal = editedMaterials[m.cod_material] !== undefined ? editedMaterials[m.cod_material] : m.cantidad;
                                    const isModified = currentVal !== m.cantidad;

                                    return (
                                        <tr key={i} className={isModified ? 'bg-yellow-50' : ''}>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {m.cod_material}
                                                {m.es_excedente && (
                                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                                                        EXC
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">{m.cantidad}</td>
                                            <td className="px-4 py-3 bg-purple-50 text-center">
                                                <input
                                                    type="number"
                                                    className={`w-16 text-center border rounded py-1 focus:ring-2 focus:ring-purple-500 outline-none ${isModified ? 'border-yellow-400 font-bold' : 'border-gray-300'}`}
                                                    value={currentVal}
                                                    onChange={(e) => handleMaterialChange(m.cod_material, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios de Auditoría</label>
                        <textarea
                            className="w-full p-3 border rounded-lg h-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ingrese nota obligatoria si hay cambios..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right: Image Viewer */}
                <div className="w-1/2 p-6 bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <button onClick={() => setZoom(z => z + 0.2)} className="bg-white/20 p-2 rounded-full text-white hover:bg-white/40"><ZoomIn size={20} /></button>
                        <button onClick={() => setRotation(r => r + 90)} className="bg-white/20 p-2 rounded-full text-white hover:bg-white/40"><RotateCw size={20} /></button>
                    </div>

                    {activeImage ? (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                            <img
                                src={activeImage
                                    ? (activeImage.startsWith('http') ? activeImage : `${api.defaults.baseURL}${activeImage}`)
                                    : ''}
                                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.2s' }}
                                className="max-w-[90%] max-h-[80%] object-contain"
                            />
                        </div>
                    ) : (
                        <div className="text-gray-500">Sin Imagen</div>
                    )}

                    {/* Strip */}
                    <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center gap-2 overflow-x-auto pb-2">
                        {evidence.map((ev, i) => (
                            <button
                                key={i}
                                onClick={() => { setActiveImage(ev.url_archivo); setRotation(0); setZoom(1); }}
                                className={`w-16 h-16 rounded border-2 flex-shrink-0 overflow-hidden ${activeImage === ev.url_archivo ? 'border-blue-500' : 'border-gray-600 opacity-60'}`}
                            >
                                <img
                                    src={ev.url_archivo.startsWith('http') ? ev.url_archivo : `${api.defaults.baseURL}${ev.url_archivo}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-white border-t p-4 flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button
                    onClick={() => setShowConfirmModal('REJECT')}
                    className="flex items-center gap-2 px-6 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium"
                >
                    <XCircle size={18} />
                    OBSERVAR Y DEVOLVER
                </button>
                <button
                    onClick={() => setShowConfirmModal('VALIDATE')}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm"
                >
                    <CheckCircle size={18} />
                    VALIDAR Y CERRAR
                </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold mb-2">
                            {showConfirmModal === 'VALIDATE' ? '¿Confirmar Validación?' : '¿Observar Orden?'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            {showConfirmModal === 'VALIDATE'
                                ? 'Se actualizará el estado a CERRADA y se guardarán los cambios de inventario.'
                                : 'La orden pasará a estado OBSERVADA y se notificará al técnico.'}
                        </p>

                        {(showConfirmModal === 'REJECT' || Object.keys(editedMaterials).length > 0) && !comment && (
                            <div className="bg-amber-50 text-amber-800 text-xs p-2 rounded mb-4">
                                <AlertTriangle size={12} className="inline mr-1" />
                                Ingrese un comentario obligatorio.
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirmModal(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleCommitAudit(showConfirmModal === 'VALIDATE' ? 'VALIDADA_OK' : 'OBSERVADA')}
                                disabled={(showConfirmModal === 'REJECT' || Object.keys(editedMaterials).length > 0) && !comment}
                                className={`px-4 py-2 text-white rounded font-medium ${(showConfirmModal === 'REJECT' || Object.keys(editedMaterials).length > 0) && !comment
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : showConfirmModal === 'VALIDATE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
