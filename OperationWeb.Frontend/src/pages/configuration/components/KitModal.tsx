import { useState, useEffect } from 'react';
import { Save, Contact, Trash2, X } from 'lucide-react';

interface KitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (kit: any) => void;
    initialData?: any;
    readOnly?: boolean;
}

interface KitItem {
    id: number;
    materialId: string;
    cantidad: number;
    destinoCustodia: 'DNI' | 'PLACA';
}

export default function KitModal({ isOpen, onClose, onSave, initialData, readOnly }: KitModalProps) {
    const [formData, setFormData] = useState({
        nombre_kit: '',
        tipo_servicio: 'INSTALACION',
    });
    const [items, setItems] = useState<KitItem[]>([]);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                nombre_kit: initialData.nombre_kit,
                tipo_servicio: initialData.tipo_servicio
            });
            // Ensure unique IDs for items
            setItems(initialData.composicion_kit.map((i: any, idx: number) => ({
                ...i,
                id: Date.now() + idx
            })));
        } else if (isOpen && !initialData) {
            // Reset for new
            setFormData({ nombre_kit: '', tipo_servicio: 'INSTALACION' });
            setItems([]);
        }
    }, [isOpen, initialData]);

    // Mock materials
    const mockMaterials = [
        { id: 'mat-1', name: 'Cable UTP Cat6' },
        { id: 'mat-2', name: 'Conector RJ45' },
        { id: 'mat-3', name: 'Decodificador TV' },
    ];

    const addItem = () => {
        setItems([...items, { id: Date.now(), materialId: '', cantidad: 1, destinoCustodia: 'DNI' }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: number, field: keyof KitItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (readOnly) return;
        onSave({ ...formData, composicion_kit: items, id_kit: initialData?.id_kit });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 h-[85vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Contact className="text-blue-600" size={20} />
                        {readOnly ? 'Detalles del Perfil' : (initialData ? 'Editar Perfil de Kit' : 'Nuevo Perfil de Kit')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <form id="kit-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Header */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Kit</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={readOnly}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
                                        placeholder="Ej. Kit HFC"
                                        value={formData.nombre_kit}
                                        onChange={(e) => setFormData({ ...formData, nombre_kit: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                                    <select
                                        required
                                        disabled={readOnly}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
                                        value={formData.tipo_servicio}
                                        onChange={(e) => setFormData({ ...formData, tipo_servicio: e.target.value })}
                                    >
                                        <option value="INSTALACION">Instalación</option>
                                        <option value="MANTENIMIENTO">Mantenimiento</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-700">Materiales Incluidos</h3>
                                {!readOnly && (
                                    <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg font-medium">+ Agregar Item</button>
                                )}
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-left">
                                        <tr>
                                            <th className="px-4 py-2">Material</th>
                                            <th className="px-4 py-2 w-24">Cant.</th>
                                            <th className="px-4 py-2 w-48">Custodia</th>
                                            {!readOnly && <th className="px-4 py-2 w-10"></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2">
                                                    <select
                                                        className="w-full border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={item.materialId}
                                                        required
                                                        disabled={readOnly}
                                                        onChange={(e) => updateItem(item.id, 'materialId', e.target.value)}
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        {mockMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={item.cantidad}
                                                        required
                                                        disabled={readOnly}
                                                        onChange={(e) => updateItem(item.id, 'cantidad', parseInt(e.target.value))}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        className="w-full border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                                                        value={item.destinoCustodia}
                                                        disabled={readOnly}
                                                        onChange={(e) => updateItem(item.id, 'destinoCustodia', e.target.value)}
                                                    >
                                                        <option value="DNI">DNI (Técnico)</option>
                                                        <option value="PLACA">PLACA (Vehículo)</option>
                                                    </select>
                                                </td>
                                                {!readOnly && (
                                                    <td className="px-4 py-2">
                                                        <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        {readOnly ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!readOnly && (
                        <button form="kit-form" type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                            <Save size={18} /> Guardar Perfil
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
