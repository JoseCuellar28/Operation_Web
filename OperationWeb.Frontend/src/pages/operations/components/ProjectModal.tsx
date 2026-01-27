import React, { useState, useEffect } from 'react';
import { Project } from '../../../services/projectsService';
import { X, Save, Briefcase, Calendar, FolderKanban, Activity } from 'lucide-react';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Project>) => Promise<void>;
    initialData?: Project;
    mode: 'create' | 'edit' | 'view';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
    const [formData, setFormData] = useState<Partial<Project>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData && (mode === 'edit' || mode === 'view')) {
                setFormData({ ...initialData });
            } else {
                setFormData({
                    estado: 'Activo',
                    fechaInicio: new Date().toISOString().split('T')[0],
                    division: '',
                    nombre: '',
                    cliente: ''
                });
            }
        }
    }, [isOpen, initialData, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isReadOnly = mode === 'view';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {mode === 'create' && <><FolderKanban className="w-5 h-5 text-blue-600" /> Nuevo Proyecto</>}
                        {mode === 'edit' && <><FolderKanban className="w-5 h-5 text-blue-600" /> Editar Proyecto</>}
                        {mode === 'view' && <><Briefcase className="w-5 h-5 text-gray-500" /> Detalle del Proyecto</>}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                            <input
                                required
                                type="text"
                                disabled={isReadOnly}
                                value={formData.nombre || ''}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none disabled:bg-gray-50"
                                placeholder="Ej. Implementación SGO"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        disabled={isReadOnly}
                                        value={formData.cliente || ''}
                                        onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 border pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none disabled:bg-gray-50"
                                        placeholder="Nombre del Cliente"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">División</label>
                                <select
                                    disabled={isReadOnly}
                                    value={formData.division || ''}
                                    onChange={e => setFormData({ ...formData, division: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none disabled:bg-gray-50 bg-white"
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="Industrial">Industrial</option>
                                    <option value="Residencial">Residencial</option>
                                    <option value="Mantenimiento">Mantenimiento</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        disabled={isReadOnly}
                                        value={formData.fechaInicio ? formData.fechaInicio.split('T')[0] : ''}
                                        onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 border pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none disabled:bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (Vigencia)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        disabled={isReadOnly}
                                        value={formData.fechaFin ? formData.fechaFin.split('T')[0] : ''}
                                        onChange={e => setFormData({ ...formData, fechaFin: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 border pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none disabled:bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    disabled={isReadOnly}
                                    value={formData.estado || 'Activo'}
                                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 border pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none disabled:bg-gray-50 bg-white"
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="En Curso">En Curso</option>
                                    <option value="Finalizado">Finalizado</option>
                                    <option value="Suspendido">Suspendido</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                        >
                            {isReadOnly ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!isReadOnly && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : <Save className="w-4 h-4" />}
                                Guardar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
