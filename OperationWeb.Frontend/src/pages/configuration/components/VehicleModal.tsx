import { useState, useEffect } from 'react';
import { Save, Truck, Info, X } from 'lucide-react';

interface VehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: any) => void;
}

export default function VehicleModal({ isOpen, onClose, onSave }: VehicleModalProps) {
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        tipo_activo: 'CAMIONETA',
        max_volumen: 'ALTO',
        estado: 'OPERATIVO'
    });

    useEffect(() => {
        if (formData.tipo_activo === 'MOTO') {
            setFormData(prev => ({ ...prev, max_volumen: 'BAJO' }));
        }
    }, [formData.tipo_activo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
        // Reset form
        setFormData({
            placa: '',
            marca: '',
            tipo_activo: 'CAMIONETA',
            max_volumen: 'ALTO',
            estado: 'OPERATIVO'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Truck className="text-blue-600" size={20} />
                        Nuevo Vehículo
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                                    placeholder="ABC-123"
                                    value={formData.placa}
                                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marca / Modelo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Toyota Hilux"
                                    value={formData.marca}
                                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Activo</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.tipo_activo}
                                    onChange={(e) => setFormData({ ...formData, tipo_activo: e.target.value })}
                                >
                                    <option value="CAMIONETA">Camioneta</option>
                                    <option value="MINIVAN">Minivan</option>
                                    <option value="MOTO">Moto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                >
                                    <option value="OPERATIVO">Operativo</option>
                                    <option value="TALLER">Taller / Mantenimiento</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad de Carga</label>
                            <div className="flex items-center gap-4">
                                <select
                                    required
                                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${formData.tipo_activo === 'MOTO' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                        }`}
                                    value={formData.max_volumen}
                                    onChange={(e) => setFormData({ ...formData, max_volumen: e.target.value })}
                                    disabled={formData.tipo_activo === 'MOTO'}
                                >
                                    <option value="ALTO">Alto Volumen</option>
                                    <option value="BAJO">Bajo Volumen</option>
                                </select>
                                {formData.tipo_activo === 'MOTO' && (
                                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                                        <Info size={14} />
                                        <span>Moto = Bajo Vol.</span>
                                    </div>
                                )}
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
