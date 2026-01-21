import { useState } from 'react';
import { Save, Wrench, X, Package } from 'lucide-react';

interface MaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (material: any) => void;
}

export default function MaterialModal({ isOpen, onClose, onSave }: MaterialModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'ACTIVO',
        unidad_medida: '',
        costo_unitario: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
        // Reset
        setFormData({
            nombre: '',
            tipo: 'ACTIVO',
            unidad_medida: '',
            costo_unitario: '',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Wrench className="text-blue-600" size={20} />
                        Nuevo Material
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Material</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej. Cable UTP Cat6"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipificación</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${formData.tipo === 'ACTIVO'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="tipo"
                                        value="ACTIVO"
                                        checked={formData.tipo === 'ACTIVO'}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-medium">Activo</span>
                                </label>
                                <label className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${formData.tipo === 'CONSUMIBLE'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="tipo"
                                        value="CONSUMIBLE"
                                        checked={formData.tipo === 'CONSUMIBLE'}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-medium">Consumible</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.unidad_medida}
                                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="UND">Unidad (UND)</option>
                                    <option value="MTR">Metros (MTR)</option>
                                    <option value="KG">Kilogramos (KG)</option>
                                    <option value="CJA">Caja (CJA)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario (S/.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    value={formData.costo_unitario}
                                    onChange={(e) => setFormData({ ...formData, costo_unitario: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                            >
                                <Save size={18} />
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
