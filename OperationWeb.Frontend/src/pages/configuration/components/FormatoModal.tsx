import { useState, useEffect } from 'react';
import { Save, FileText, Settings2, X, Eye, Lock } from 'lucide-react';

interface FormatoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formato: any) => void;
    initialData?: any;
    readOnly?: boolean;
}

export default function FormatoModal({ isOpen, onClose, onSave, initialData, readOnly }: FormatoModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        control_series: false,
        rango_inicio: '',
        rango_fin: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    nombre: initialData.nombre || '',
                    control_series: initialData.control_series || false,
                    rango_inicio: initialData.rango_inicio || '',
                    rango_fin: initialData.rango_fin || ''
                });
            } else {
                setFormData({ nombre: '', control_series: false, rango_inicio: '', rango_fin: '' });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (readOnly) return;
        onSave({ ...formData, id_formato: initialData?.id_formato });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-blue-600" size={20} />
                        {readOnly ? 'Detalles del Formato' : (initialData ? 'Editar Formato' : 'Nuevo Formato')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                required
                                disabled={readOnly}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Ej. Acta de Instalación"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Settings2 size={16} /> Control de Series
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        disabled={readOnly}
                                        className="sr-only peer"
                                        checked={formData.control_series}
                                        onChange={(e) => setFormData({ ...formData, control_series: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>

                            {formData.control_series && (
                                <div className="grid grid-cols-2 gap-4 mt-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Inicio</label>
                                        <input
                                            type="number"
                                            required={formData.control_series}
                                            disabled={readOnly}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
                                            placeholder="001"
                                            value={formData.rango_inicio}
                                            onChange={(e) => setFormData({ ...formData, rango_inicio: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Fin</label>
                                        <input
                                            type="number"
                                            required={formData.control_series}
                                            disabled={readOnly}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
                                            placeholder="050"
                                            value={formData.rango_fin}
                                            onChange={(e) => setFormData({ ...formData, rango_fin: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                {readOnly ? 'Cerrar' : 'Cancelar'}
                            </button>
                            {!readOnly && (
                                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <Save size={18} /> Guardar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
