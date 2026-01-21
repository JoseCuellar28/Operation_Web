import { useState, useEffect } from 'react';
import { Contact, Plus, Search, Box, Upload, Edit, Trash2, Eye } from 'lucide-react';
import KitModal from './components/KitModal';
import BulkKitWizard from './components/BulkKitWizard';

export default function ArmadoKitsView() {
    const [kits, setKits] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [editingKit, setEditingKit] = useState<any>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const fetchKits = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/kits');
            if (res.ok) {
                const data = await res.json();
                // Data already parsed in backend
                setKits(data.map((k: any) => ({
                    ...k,
                    itemCount: k.composicion_kit?.length || 0
                })));
            }
        } catch (err) {
            console.error("Failed to fetch kits", err);
        }
    };

    useEffect(() => {
        fetchKits();
    }, []);

    const handleSaveKit = async (kit: any) => {
        try {
            const url = kit.id_kit ? `http://localhost:3000/api/v1/kits/${kit.id_kit}` : 'http://localhost:3000/api/v1/kits';
            const method = kit.id_kit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(kit)
            });
            if (res.ok) {
                fetchKits();
                setEditingKit(null); // Clear editing state
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteKit = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:3000/api/v1/kits/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchKits();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBatch = async (newKits: any[]) => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/kits/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newKits)
            });
            if (res.ok) fetchKits();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = kits.filter(k => k.nombre_kit.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Contact className="text-blue-600" />
                        Gestión de Materiales
                    </h1>
                    <p className="text-gray-500">Total: {kits.length} perfiles definidos</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                    >
                        <Upload size={18} />
                        Importar Kits
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                    >
                        <Plus size={18} />
                        Nuevo Perfil
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar perfil..."
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
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre del Kit</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo Servicio</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                            <th className="px-6 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((k) => (
                            <tr key={k.id_kit} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                    <Box size={16} className="text-gray-400" />
                                    {k.nombre_kit}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                                        {k.tipo_servicio}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{k.itemCount} materiales</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => {
                                            setEditingKit(k);
                                            setIsReadOnly(true);
                                            setIsModalOpen(true);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 mr-2"
                                        title="Ver Detalles"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingKit(k);
                                            setIsReadOnly(false);
                                            setIsModalOpen(true);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                        title="Editar"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('¿Está seguro de eliminar este perfil?')) {
                                                handleDeleteKit(k.id_kit);
                                            }
                                        }}
                                        className="text-red-400 hover:text-red-600"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            <KitModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingKit(null);
                }}
                onSave={handleSaveKit}
                initialData={editingKit}
            />
            <BulkKitWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onSaveBatch={handleSaveBatch} />
        </div>
    );
}
