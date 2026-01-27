import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Project } from '../../../services/projectsService';
import { Squad } from '../../../services/squadService';
import { Employee } from '../../../services/personalService';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    readOnly?: boolean;
    onSave: (data: Partial<Project>) => Promise<void>;
    squads: Squad[];
    officers: Employee[];
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
    isOpen,
    onClose,
    project,
    readOnly = false,
    onSave,
    squads,
    officers
}) => {
    const [formData, setFormData] = useState<Partial<Project>>({});

    useEffect(() => {
        if (project) {
            setFormData({ ...project });
        } else {
            setFormData({
                estado: 'Activo',
                fechaInicio: new Date().toISOString().split('T')[0]
            });
        }
    }, [project, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (readOnly) return;
        await onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">
                        {readOnly ? 'Detalle del Proyecto' : (project ? 'Editar Proyecto' : 'Nuevo Proyecto')}
                    </h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                        <input
                            required
                            disabled={readOnly}
                            type="text"
                            value={formData.nombre || ''}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                            <input
                                required
                                disabled={readOnly}
                                type="text"
                                value={formData.cliente || ''}
                                onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">División</label>
                            <select
                                disabled={readOnly}
                                value={formData.division || ''}
                                onChange={e => setFormData({ ...formData, division: e.target.value })}
                                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            >
                                <option value="">Seleccionar</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Residencial">Residencial</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                            <input
                                type="date"
                                disabled={readOnly}
                                value={formData.fechaInicio ? formData.fechaInicio.split('T')[0] : ''}
                                onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })}
                                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                disabled={readOnly}
                                value={formData.estado || 'Activo'}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-500"
                            >
                                <option value="Activo">Activo</option>
                                <option value="En Curso">En Curso</option>
                                <option value="Finalizado">Finalizado</option>
                                <option value="Suspendido">Suspendido</option>
                            </select>
                        </div>
                    </div>

                    {/* Legacy Assignment Section */}
                    <div className="pt-4 border-t mt-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Asignación de Recursos (Legacy)</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Asignar Cuadrilla</label>
                                <select
                                    disabled={readOnly}
                                    value={formData.id_cuadrilla || ''}
                                    onChange={e => setFormData({ ...formData, id_cuadrilla: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm bg-gray-50 focus:bg-white transition-colors outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                    <option value="">-- Sin Asignar --</option>
                                    {squads.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre} ({s.zona})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Asignar Efectivo Policial</label>
                                <select
                                    disabled={readOnly}
                                    value={formData.id_efectivo || ''}
                                    onChange={e => setFormData({ ...formData, id_efectivo: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm bg-gray-50 focus:bg-white transition-colors outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                >
                                    <option value="">-- Sin Asignar --</option>
                                    {officers.map(o => (
                                        <option key={o.dni} value={o.dni}>{o.inspector} (DNI: {o.dni})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                        >
                            {readOnly ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!readOnly && (
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Guardar Proyecto
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
