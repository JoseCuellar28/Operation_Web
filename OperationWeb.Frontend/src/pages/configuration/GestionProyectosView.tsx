import { useState, useEffect } from 'react';
import { Plus, Search, Briefcase } from 'lucide-react';
import Table from '../../components/shared/Table';
import Form from '../../components/shared/Form';
import projectsService from '../../services/projectsService';
import { Project } from '../../types/project';

// Simple Alert Component (Internal)
const Alert = ({ message, type }: { message: string, type: 'error' | 'success' }) => (
    <div className={`p-4 mb-4 rounded-md ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
        {message}
    </div>
);

const GestionProyectosView = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await projectsService.getAll();
            setProjects(data);
        } catch (err) {
            setError('Error al cargar proyectos');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Project },
        { header: 'Proyecto', accessor: 'nombre' as keyof Project },
        { header: 'Cliente', accessor: 'cliente' as keyof Project },
        { header: 'División', accessor: 'division' as keyof Project },
        { header: 'Presupuesto', accessor: (p: Project) => p.presupuesto ? `S/ ${p.presupuesto.toLocaleString()}` : '-' },
        {
            header: 'Estado',
            accessor: (p: Project) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {p.estado}
                </span>
            )
        }
    ];

    if (loading) return <div className="p-8 text-center">Cargando proyectos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestión de Proyectos</h1>
                    <p className="text-slate-600">Administración de portafolio y contratos</p>
                </div>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    disabled
                    title="Funcionalidad de creación en construcción"
                >
                    <Plus size={20} />
                    Nuevo Proyecto
                </button>
            </div>

            {error && <Alert message={error} type="error" />}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o cliente..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <Briefcase className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No hay proyectos</h3>
                        <p className="text-slate-500">No se encontraron proyectos activos en la base de datos.</p>
                    </div>
                ) : (
                    <Table
                        data={filteredProjects}
                        columns={columns}
                        keyField="id"
                    />
                )}
            </div>
        </div>
    );
};

export default GestionProyectosView;
