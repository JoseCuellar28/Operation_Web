import { useState, useEffect } from 'react';
import { Wrench, Plus, Upload, Search, Filter, MoreHorizontal } from 'lucide-react';
import MaterialModal from './components/MaterialModal';
import BulkMaterialWizard from './components/BulkMaterialWizard';

export default function GestionMaterialesView() {
    const [materials, setMaterials] = useState<any[]>([]); // Init empty
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMaterials = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/materiales');
            if (res.ok) {
                const data = await res.json();
                setMaterials(data);
            }
        } catch (err) {
            console.error("Failed to fetch materials", err);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleSaveMaterial = async (mat: any) => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/materiales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mat)
            });
            if (res.ok) fetchMaterials();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBatch = async (newMats: any[]) => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/materiales/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMats)
            });
            if (res.ok) fetchMaterials();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = materials.filter(m =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wrench className="text-blue-600" />
                        Gestión de Materiales
                    </h1>
                    <p className="text-gray-500">Total: {materials.length} materiales</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                    >
                        <Upload size={18} />
                        Importar
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Nuevo Material
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar material..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unidad</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Costo (S/.)</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{m.nombre}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${m.tipo === 'ACTIVO' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                        }`}>
                                        {m.tipo}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{m.unidad_medida}</td>
                                <td className="px-6 py-4 text-gray-900 font-medium">S/. {m.costo_unitario.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <MaterialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveMaterial} />
            <BulkMaterialWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onSaveBatch={handleSaveBatch} />
        </div>
    );
}
