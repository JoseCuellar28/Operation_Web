import { useState, useEffect } from 'react';
import { RefreshCw, AlertOctagon, DollarSign, Archive, Search, Download, Eye, ArrowLeft, FileText, Calendar, Layers, ShieldCheck, Banknote, CheckCircle2 } from 'lucide-react';

interface LiquidationItem {
    id_ot: string;
    codigo_suministro: string;
    cliente: string;
    fecha_programada: string;
    tipo_trabajo: string;
    flag_extemporanea: boolean;
    cost_mat: number;
    cost_mo: number;
    cost_fleet: number;
    cost_total: number;
    price: number;
    margin: number;
    marginPercent: number;
}

interface Batch {
    id_lote: number;
    codigo_lote: string;
    cliente: string;
    mes_valorizacion: string;
    estado: string;
    fecha_generacion: string;
    total_ots: number;
    numero_hes?: string;
    fecha_aprobacion_hes?: string;
    fecha_pago_probable?: string;
}

export default function LiquidationDashboardView({ onViewChange }: { onViewChange: (view: string, id: string) => void }) {
    const [items, setItems] = useState<LiquidationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [batches, setBatches] = useState<Batch[]>([]);

    // Batch Detail State
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [batchDetails, setBatchDetails] = useState<LiquidationItem[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // HES Form State
    const [hesNumber, setHesNumber] = useState('');
    const [hesDate, setHesDate] = useState('');

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchCandidates();
            setSelectedBatch(null);
        } else {
            fetchBatches();
        }
    }, [activeTab]);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/liquidation/candidates');
            if (res.ok) setItems(await res.json());
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/liquidation/batches');
            if (res.ok) setBatches(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchBatchDetails = async (batch: Batch) => {
        setLoadingDetails(true);
        setSelectedBatch(batch);
        // Reset Form
        setHesNumber(batch.numero_hes || '');
        setHesDate(batch.fecha_aprobacion_hes ? new Date(batch.fecha_aprobacion_hes).toISOString().split('T')[0] : '');

        try {
            const res = await fetch(`/api/v1/liquidation/batches/${batch.id_lote}/details`);
            if (res.ok) setBatchDetails(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoadingDetails(false); }
    };

    const handleRegisterHes = async () => {
        if (!selectedBatch || !hesNumber || !hesDate) return alert('Complete los campos de HES');

        try {
            const res = await fetch(`/api/v1/liquidation/batches/${selectedBatch.id_lote}/register-hes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numero_hes: hesNumber,
                    fecha_aprobacion_hes: hesDate
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert('Conformidad Registrada Correctamente');
                // Update Local State
                const updatedBatch = {
                    ...selectedBatch,
                    estado: 'CONFORMIDAD_TOTAL',
                    numero_hes: hesNumber,
                    fecha_aprobacion_hes: hesDate,
                    fecha_pago_probable: data.paymentDate
                };
                setSelectedBatch(updatedBatch);
                // Update List
                setBatches(prev => prev.map(b => b.id_lote === updatedBatch.id_lote ? updatedBatch : b));
            } else {
                alert('Error al registrar HES');
            }
        } catch (e) { console.error(e); alert('Error de conexión'); }
    };

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map(i => i.id_ot)));
        }
    };

    const handleGenerateBatch = async () => {
        try {
            const res = await fetch('/api/v1/liquidation/generate-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedOtIds: Array.from(selectedIds),
                    clientName: 'Cliente General',
                    month: '2025-10'
                })
            });
            if (res.ok) {
                const json = await res.json();
                alert(`Lote Generado Exitosamente: ${json.batchCode}`);
                setShowModal(false);
                fetchCandidates();
                setSelectedIds(new Set());
            } else {
                throw new Error('Error creating batch');
            }
        } catch (err) {
            alert('Error generando lote');
        }
    };

    // Calculate Totals for Footer
    const selectedItems = items.filter(i => selectedIds.has(i.id_ot));
    const totalRevenue = selectedItems.reduce((sum, i) => sum + i.price, 0);
    const totalCost = selectedItems.reduce((sum, i) => sum + i.cost_total, 0);
    const totalGross = selectedItems.reduce((sum, i) => sum + i.margin, 0);
    const totalLossCount = selectedItems.filter(i => i.margin < 0).length;

    const filtered = items.filter(i =>
        i.codigo_suministro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="text-green-600" />
                            Liquidación y Valorización
                        </h1>
                        <p className="text-xs text-gray-500">Gestión financiera y generación de lotes de cobro</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Pendientes de Liquidar
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Historial de Lotes Generados
                    </button>
                </div>

                {/* Action Bar (Only for Pending) */}
                {activeTab === 'pending' && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar suministro..."
                                className="pl-9 pr-4 py-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={fetchCandidates} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Refrescar">
                                <RefreshCw size={20} />
                            </button>
                            <button
                                disabled={selectedIds.size === 0}
                                onClick={() => setShowModal(true)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all shadow-sm
                                    ${selectedIds.size > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}
                                `}
                            >
                                <Archive size={18} />
                                GENERAR LOTE ({selectedIds.size})
                            </button>
                        </div>
                    </div>
                )}

                {/* Header for Batch Detail */}
                {activeTab === 'history' && selectedBatch && (
                    <div className="mt-4 flex flex-col gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {/* Header Navigation */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedBatch(null)} className="p-2 hover:bg-white rounded-full text-gray-600 transition-colors shadow-sm bg-white border">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Layers className="text-blue-600" size={24} />
                                        {selectedBatch.codigo_lote}
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {selectedBatch.mes_valorizacion}</span>
                                        <span className="flex items-center gap-1"><FileText size={14} /> {selectedBatch.total_ots} OTs</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${selectedBatch.estado === 'CONFORMIDAD_TOTAL' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {selectedBatch.estado}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
                                <Download size={16} />
                                Descargar Excel
                            </button>
                        </div>

                        {/* HES Registration Card */}
                        <div className="bg-white p-6 rounded-lg border shadow-sm flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                                    <ShieldCheck className={selectedBatch.estado === 'CONFORMIDAD_TOTAL' ? 'text-green-600' : 'text-gray-400'} />
                                    Conformidad y Facturación
                                </h3>

                                {selectedBatch.estado === 'CONFORMIDAD_TOTAL' ? (
                                    <div className="grid grid-cols-3 gap-8 mt-4">
                                        <div className="bg-green-50 p-3 rounded border border-green-100">
                                            <span className="block text-xs text-green-700 uppercase font-bold tracking-wider mb-1">Status</span>
                                            <div className="font-bold text-green-900 flex items-center gap-2">
                                                ✅ CONFORMIDAD TOTAL
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">N° HES Aprobada</span>
                                            <div className="font-mono text-lg font-bold text-gray-900">{selectedBatch.numero_hes}</div>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Fecha Probable Pago</span>
                                            <div className="font-bold text-blue-600 text-lg flex items-center gap-2">
                                                <Banknote size={18} />
                                                {new Date(selectedBatch.fecha_pago_probable!).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-end gap-4 mt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">N° HES / Orden de Servicio</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. HES-2025-001"
                                                className="border p-2 rounded w-48 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                                value={hesNumber}
                                                onChange={e => setHesNumber(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Aprobación</label>
                                            <input
                                                type="date"
                                                className="border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                                value={hesDate}
                                                onChange={e => setHesDate(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={handleRegisterHes}
                                            className="px-4 py-2 bg-black text-white rounded font-bold hover:bg-gray-800 transition-colors shadow flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} />
                                            Registrar Conformidad
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Financial Lock Indicator */}
                            {selectedBatch.estado === 'CONFORMIDAD_TOTAL' && (
                                <div className="ml-8 border-l pl-8 py-2">
                                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200">
                                        🔒 Bloqueo Financiero Activo
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 max-w-[150px] leading-tight">
                                        Las OTs han sido bloqueadas a perpetuidad. No se permiten ediciones.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">

                {/* 1. PENDING VIEW */}
                {activeTab === 'pending' && (
                    <div className="bg-white rounded-lg shadow border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-4 py-3 w-10 text-center">
                                        <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === items.length && items.length > 0} />
                                    </th>
                                    <th className="px-4 py-3 text-left">Suministro / Cliente</th>
                                    <th className="px-4 py-3 text-left">Fecha Prog.</th>

                                    {/* Cost Breakdown Columns */}
                                    <th className="px-2 py-3 text-right text-gray-400 font-normal text-[10px]" title="Costo Materiales">Mat.</th>
                                    <th className="px-2 py-3 text-right text-gray-400 font-normal text-[10px]" title="Mano de Obra">M.O.</th>
                                    <th className="px-2 py-3 text-right text-gray-400 font-normal text-[10px]" title="Flota">Flota</th>

                                    <th className="px-4 py-3 text-right text-gray-600 border-l">Costo Total</th>
                                    <th className="px-4 py-3 text-right text-green-700">Venta ($)</th>
                                    <th className="px-4 py-3 text-right">Margen ($)</th>
                                    <th className="px-4 py-3 text-right">%</th>
                                    <th className="px-4 py-3 text-center">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan={11} className="p-10 text-center">Cargando datos financieros...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={11} className="p-10 text-center text-gray-500">No hay órdenes validadas pendientes.</td></tr>
                                ) : (
                                    filtered.map(item => {
                                        const isLoss = item.margin < 0;
                                        const isExtemp = item.flag_extemporanea;
                                        return (
                                            <tr
                                                key={item.id_ot}
                                                className={`
                                                    hover:bg-gray-50 transition-colors
                                                    ${isLoss ? 'bg-red-50 hover:bg-red-100' : ''}
                                                    ${selectedIds.has(item.id_ot) ? 'bg-blue-50' : ''}
                                                `}
                                            >
                                                <td className="px-4 py-3 text-center" onClick={(e) => { e.stopPropagation(); toggleSelection(item.id_ot); }}>
                                                    <input type="checkbox" checked={selectedIds.has(item.id_ot)} readOnly className="cursor-pointer size-4" />
                                                </td>
                                                <td className="px-4 py-3 font-medium cursor-pointer" onClick={() => onViewChange('detalle-auditoria', item.id_ot)}>
                                                    <div className="flex items-center gap-2 group">
                                                        <span className="group-hover:text-blue-600 underline decoration-dotted underline-offset-2">
                                                            {item.codigo_suministro}
                                                        </span>
                                                        {isExtemp && (
                                                            <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded border border-yellow-200" title="Orden antigua (>30 días)">
                                                                EXTEMP
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{item.cliente}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {new Date(item.fecha_programada).toLocaleDateString()}
                                                </td>

                                                {/* Cost Details */}
                                                <td className="px-2 py-3 text-right text-xs text-gray-400 font-mono">
                                                    {item.cost_mat?.toFixed(0)}
                                                </td>
                                                <td className="px-2 py-3 text-right text-xs text-gray-400 font-mono">
                                                    {item.cost_mo?.toFixed(0)}
                                                </td>
                                                <td className="px-2 py-3 text-right text-xs text-gray-400 font-mono">
                                                    {item.cost_fleet?.toFixed(0)}
                                                </td>

                                                <td className="px-4 py-3 text-right font-mono text-gray-600 font-semibold border-l bg-gray-50/50">
                                                    {item.cost_total?.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-green-700 bg-green-50/50">
                                                    {item.price.toFixed(2)}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-mono font-bold ${isLoss ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {item.margin.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${isLoss ? 'bg-red-200 text-red-900' : 'bg-green-100 text-green-800'}`}>
                                                        {item.marginPercent.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => onViewChange('detalle-auditoria', item.id_ot)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center justify-center mx-auto"
                                                        title="Ver Detalle Operativo"
                                                    >
                                                        <Search size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. HISTORY VIEW (BATCH LIST) */}
                {activeTab === 'history' && !selectedBatch && (
                    <div className="bg-white rounded-lg shadow border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Código Lote</th>
                                    <th className="px-6 py-3 text-left">Cliente</th>
                                    <th className="px-6 py-3 text-left">Mes</th>
                                    <th className="px-6 py-3 text-left">Fecha Gen.</th>
                                    <th className="px-6 py-3 text-center">Total OTs</th>
                                    <th className="px-6 py-3 text-center">Estado</th>
                                    <th className="px-6 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {batches.length === 0 ? (
                                    <tr><td colSpan={7} className="p-10 text-center text-gray-500">No se encontraron lotes generados.</td></tr>
                                ) : (
                                    batches.map(batch => (
                                        <tr key={batch.id_lote} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{batch.codigo_lote}</td>
                                            <td className="px-6 py-4 text-gray-600">{batch.cliente}</td>
                                            <td className="px-6 py-4 text-gray-600">{batch.mes_valorizacion}</td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(batch.fecha_generacion).toLocaleDateString()} {new Date(batch.fecha_generacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-900">{batch.total_ots}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${batch.estado === 'CONFORMIDAD_TOTAL' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {batch.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center flex justify-center gap-2">
                                                <button
                                                    onClick={() => fetchBatchDetails(batch)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium border border-transparent hover:border-blue-100"
                                                >
                                                    <Eye size={16} /> Ver Detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3. BATCH DETAIL VIEW - TABLE */}
                {activeTab === 'history' && selectedBatch && (
                    <div className="bg-white rounded-lg shadow border overflow-hidden mt-4">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Suministro / Cliente</th>
                                    <th className="px-4 py-3 text-left">Fecha Prog.</th>
                                    <th className="px-2 py-3 text-right text-gray-400 font-normal text-[10px]">Mat.</th>
                                    <th className="px-2 py-3 text-right text-gray-400 font-normal text-[10px]">M.O.</th>
                                    <th className="px-2 py-3 text-right text-gray-400 font-normal text-[10px]">Flota</th>
                                    <th className="px-4 py-3 text-right text-gray-600 border-l">Costo Total</th>
                                    <th className="px-4 py-3 text-right text-green-700">Venta ($)</th>
                                    <th className="px-4 py-3 text-right">Margen ($)</th>
                                    <th className="px-4 py-3 text-right">%</th>
                                    <th className="px-4 py-3 text-center">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loadingDetails ? (
                                    <tr><td colSpan={10} className="p-10 text-center">Cargando detalles del lote...</td></tr>
                                ) : batchDetails.length === 0 ? (
                                    <tr><td colSpan={10} className="p-10 text-center text-gray-500">Este lote no tiene OTs asignadas.</td></tr>
                                ) : (
                                    batchDetails.map(item => {
                                        const isLoss = item.margin < 0;
                                        return (
                                            <tr key={item.id_ot} className={`hover:bg-gray-50 transition-colors ${isLoss ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                                                <td className="px-4 py-3 font-medium cursor-pointer" onClick={() => onViewChange('detalle-auditoria', item.id_ot)}>
                                                    <div className="flex items-center gap-2 group">
                                                        <span className="group-hover:text-blue-600 underline decoration-dotted underline-offset-2">{item.codigo_suministro}</span>
                                                        {item.flag_extemporanea && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 rounded">EXTEMP</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{item.cliente}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{new Date(item.fecha_programada).toLocaleDateString()}</td>
                                                <td className="px-2 py-3 text-right text-xs text-gray-400 font-mono">{item.cost_mat?.toFixed(0)}</td>
                                                <td className="px-2 py-3 text-right text-xs text-gray-400 font-mono">{item.cost_mo?.toFixed(0)}</td>
                                                <td className="px-2 py-3 text-right text-xs text-gray-400 font-mono">{item.cost_fleet?.toFixed(0)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-600 font-semibold border-l bg-gray-50/50">{item.cost_total?.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-green-700 bg-green-50/50">{item.price.toFixed(2)}</td>
                                                <td className={`px-4 py-3 text-right font-mono font-bold ${isLoss ? 'text-red-600' : 'text-gray-900'}`}>{item.margin.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right"><span className={`px-2 py-0.5 rounded text-xs font-bold ${isLoss ? 'bg-red-200 text-red-900' : 'bg-green-100 text-green-800'}`}>{item.marginPercent.toFixed(1)}%</span></td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => onViewChange('detalle-auditoria', item.id_ot)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"><Eye size={16} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Sticky Footer (Only for Pending) */}
            {activeTab === 'pending' && (
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg z-10">
                    <div className="flex gap-8">
                        <div>
                            <span className="block text-xs text-gray-400 uppercase tracking-wider">Seleccionadas</span>
                            <span className="text-2xl font-bold">{selectedIds.size}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 uppercase tracking-wider">Total Venta</span>
                            <span className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 uppercase tracking-wider">Costo Real</span>
                            <span className="text-2xl font-bold text-red-300">-${totalCost.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 uppercase tracking-wider">Margen Neto</span>
                            <span className="text-2xl font-bold text-white">${totalGross.toFixed(2)}</span>
                        </div>
                    </div>

                    {totalLossCount > 0 && (
                        <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded animate-pulse">
                            <AlertOctagon />
                            <span className="font-bold">¡ADVERTENCIA! Has seleccionado {totalLossCount} órdenes con PÉRDIDA.</span>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Confirmar Generación de Lote</h3>
                        <p className="text-gray-600 mb-6">
                            Se generará un lote con <strong>{selectedIds.size} órdenes</strong>.
                            Esto bloqueará las OTs y tomará una "foto" de los precios actuales.
                            <br /><br />
                            <span className="text-red-500 font-bold block bg-red-50 p-2 rounded border border-red-200 text-center">
                                Esta acción es irreversible.
                            </span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGenerateBatch}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                            >
                                Confirmar y Bloquear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
