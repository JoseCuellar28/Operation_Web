import React, { useState, useEffect } from 'react';
import { projectsService, Project } from '../../services/projectsService';
import { squadService, Squad } from '../../services/squadService';
import { personalService, Employee } from '../../services/personalService';
import { Plus, Briefcase, Calendar, Shield, Truck, Edit, X, Save, Search, FolderKanban, Activity } from 'lucide-react';

export const ProjectsView: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [squads, setSquads] = useState<Squad[]>([]);
    const [officers, setOfficers] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [divisionFilter, setDivisionFilter] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Project>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pData, sData, oData] = await Promise.all([
                projectsService.getAll(),
                squadService.getAll(),
                personalService.getAll()
            ]);
            setProjects(pData);
            setSquads(sData);
            // Filter only Inspectors/Police for assignment
            setOfficers(oData.filter(e => e.tipo === 'INSPECTOR' || e.tipo === 'SUPERVISOR'));
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (project?: Project) => {
        if (project) {
            setEditingProject(project);
            setFormData({ ...project });
        } else {
            setEditingProject(null);
            setFormData({ estado: 'Activo', fechaInicio: new Date().toISOString().split('T')[0] });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await projectsService.update(editingProject.id, formData);
            } else {
                await projectsService.create(formData);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert('Error al guardar el proyecto');
            console.error(err);
        }
    };

    // Derived State: Unique Divisions
    const uniqueDivisions = Array.from(new Set(projects.map(p => p.division).filter(Boolean))) as string[];

    // Filtering Logic
    const filteredProjects = projects.filter(p => {
        // 1. Search
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.cliente && p.cliente.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Division Filter
        const matchesDivision = divisionFilter ? p.division === divisionFilter : true;

        // 3. Status Filter
        let matchesStatus = true;
        if (statusFilter === 'active') {
            matchesStatus = p.estado === 'Activo' || p.estado === 'ACTIVO' || p.estado === 'En Curso';
        } else if (statusFilter === 'inactive') {
            matchesStatus = p.estado === 'Finalizado' || p.estado === 'FINALIZADO' || p.estado === 'Suspendido' || p.estado === 'Inactivo';
        }

        return matchesSearch && matchesDivision && matchesStatus;
    });

    const activeCount = projects.filter(p => p.estado === 'Activo' || p.estado === 'ACTIVO' || p.estado === 'En Curso').length;

    return (
        <div className="p-6 space-y-6">
            {/* KPI Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <FolderKanban className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Proyectos</p>
                        <h3 className="text-2xl font-bold text-gray-900">{projects.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Proyectos Activos</p>
                        <h3 className="text-2xl font-bold text-gray-900">{activeCount}</h3>
                    </div>
                </div>
            </div>

            {/* Sticky Header & Controls */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-md py-4 px-6 -mx-6 mb-6 flex flex-col gap-4 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestión de Proyectos</h1>
                        <p className="text-sm text-gray-500">Portafolio de obras y asignación de recursos.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                if (confirm('¿Seguro que desea sincronizar Áreas de Personal a Proyectos?')) {
                                    try {
                                        setLoading(true);
                                        await projectsService.sync();
                                        alert('Sincronización Completada Correctamente');
                                        fetchData();
                                    } catch (e) {
                                        alert('Error al sincronizar');
                                        console.error(e);
                                        setLoading(false);
                                    }
                                }
                            }}
                            className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4 py-2 disabled:opacity-50 transition-colors shadow-sm"
                            disabled={loading}
                        >
                            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync-alt mr-2 text-blue-600"></i>}
                            Sincronizar
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Proyecto
                        </button>
                    </div>
                </div>

                {/* Advanced Search & Filter Controls */}
                <div className="flex flex-col md:flex-row gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                    </div>

                    {/* Division Filter */}
                    <div className="w-full md:w-48">
                        <select
                            className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            value={divisionFilter}
                            onChange={(e) => setDivisionFilter(e.target.value)}
                        >
                            <option value="">Todas las Divisiones</option>
                            {uniqueDivisions.map(div => (
                                <option key={div} value={div}>{div}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                        <select
                            className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="active">Activos / En Curso</option>
                            <option value="inactive">Inactivos / Finalizados</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-gray-500 col-span-full text-center py-10">Cargando proyectos...</p>
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No se encontraron proyectos bajo este criterio.</p>
                        <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDivisionFilter(''); }} className="text-blue-600 text-sm mt-2 hover:underline">Limpiar Filtros</button>
                    </div>
                ) : filteredProjects.map(project => (
                    <div key={project.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col group">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                  ${project.estado === 'ACTIVO' || project.estado === 'Activo' ? 'bg-green-50 text-green-700 border-green-200' :
                                        project.estado === 'En Curso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            project.estado === 'FINALIZADO' || project.estado === 'Finalizado' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                'bg-red-50 text-red-700 border-red-200'}
                `}>
                                    {project.estado}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(project)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{project.nombre}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                                <Briefcase className="w-4 h-4" /> {project.cliente || 'Sin Cliente Asignado'}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><Truck className="w-4 h-4" /> Cuadrilla:</span>
                                    <span className="font-medium text-gray-900 truncate max-w-[120px]" title={project.id_cuadrilla || 'Sin asignar'}>
                                        {project.id_cuadrilla || 'Sin asignar'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><Shield className="w-4 h-4" /> Efectivo:</span>
                                    <span className="font-medium text-gray-900 truncate max-w-[120px]" title={project.id_efectivo || 'Sin asignar'}>
                                        {project.id_efectivo || 'Sin asignar'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Vigencia:</span>
                                    <span className="text-gray-900 text-xs">
                                        {project.fechaInicio ? new Date(project.fechaInicio).toLocaleDateString() : '??'} - {project.fechaFin ? new Date(project.fechaFin).toLocaleDateString() : '??'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 border-t rounded-b-xl text-xs text-gray-500 flex justify-between items-center">
                            <span>División: {project.division || 'General'}</span>
                            <button className="text-blue-600 hover:underline font-medium">Ver Detalle &rarr;</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nombre || ''}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.cliente || ''}
                                        onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">División</label>
                                    <select
                                        value={formData.division || ''}
                                        onChange={e => setFormData({ ...formData, division: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
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
                                        value={formData.fechaInicio ? formData.fechaInicio.split('T')[0] : ''}
                                        onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        value={formData.estado || 'Activo'}
                                        onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
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
                                            value={formData.id_cuadrilla || ''}
                                            onChange={e => setFormData({ ...formData, id_cuadrilla: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm bg-gray-50 focus:bg-white transition-colors outline-none"
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
                                            value={formData.id_efectivo || ''}
                                            onChange={e => setFormData({ ...formData, id_efectivo: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm bg-gray-50 focus:bg-white transition-colors outline-none"
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
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Guardar Proyecto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
