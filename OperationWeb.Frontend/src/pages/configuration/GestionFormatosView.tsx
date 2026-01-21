import { useState, useEffect } from 'react';
import { FileText, Plus, Search, CheckCircle, XCircle, Upload, Edit, Trash2, Eye } from 'lucide-react';
import FormatoModal from './components/FormatoModal';
import BulkFormatWizard from './components/BulkFormatWizard';

export default function GestionFormatosView() {
    const [formats, setFormats] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // New state for editing/viewing
    const [editingFormat, setEditingFormat] = useState<any>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const fetchFormats = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/formatos');
            if (res.ok) {
                const data = await res.json();
                setFormats(data);
            }
        } catch (err) {
            console.error("Failed to fetch formats", err);
        }
    };

    useEffect(() => {
        fetchFormats();
    }, []);

    const handleSaveFormat = async (fmt: any) => {
        try {
            // Check if input has ID -> Update (PUT), else Create (POST Batch wrap)
            // Note: Our previous create logic was inside a Batch POST for single items too.
            // Let's refine:

            if (fmt.id_formato) {
                // Update
                const res = await fetch(`http://localhost:3000/api/v1/formatos/${fmt.id_formato}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fmt)
                });
                if (res.ok) {
                    fetchFormats();
                    setEditingFormat(null);
                }
            } else {
                // Create (using batch endpoint for convenience as before)
                const res = await fetch('http://localhost:3000/api/v1/formatos/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([fmt])
                });
                if (res.ok) fetchFormats();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteFormat = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este formato?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/v1/formatos/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchFormats();
            else alert('No se puede eliminar. Verifica que no esté en uso.');
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBatch = async (newFormats: any[]) => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/formatos/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFormats)
            });
            if (res.ok) fetchFormats();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = formats.filter(f => f.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="text-blue-600" />
                        Gestión de Formatos
                    </h1>
                    <p className="text-gray-500">Total: {formats.length} formatos definidos</p>
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
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                    >
                        <Plus size={18} />
                        Nuevo Formato
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar formato..."
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
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre Formato</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Control Series</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rango</th>
                            <th className="px-6 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((f) => (
                            <tr key={f.id_formato} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{f.nombre}</td>
                                <td className="px-6 py-4">
                                    {f.control_series ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle size={14} /> Activo</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-400 text-sm"><XCircle size={14} /> No</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    {f.control_series ? `${f.rango_inicio} - ${f.rango_fin}` : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => {
                                            setEditingFormat(f);
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
                                            setEditingFormat(f);
                                            setIsReadOnly(false);
                                            setIsModalOpen(true);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                        title="Editar"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFormat(f.id_formato)}
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


            <FormatoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingFormat(null);
                    setIsReadOnly(false);
                }}
                onSave={handleSaveFormat}
                initialData={editingFormat}
                readOnly={isReadOnly}
            />
            <BulkFormatWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onSaveBatch={handleSaveBatch} />
        </div>
    );
}
