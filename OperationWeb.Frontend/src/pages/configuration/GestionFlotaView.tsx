import { useState, useEffect } from 'react';
import { Truck, Plus, Upload, Search, Filter, MoreHorizontal } from 'lucide-react';
import VehicleModal from './components/VehicleModal';
import BulkImportWizard from './components/BulkImportWizard';

export default function GestionFlotaView() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVehicles = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/vehiculos');
            if (res.ok) {
                const data = await res.json();
                setVehicles(data);
            }
        } catch (err) {
            console.error("Failed to fetch vehicles", err);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSaveVehicle = async (vehicle: any) => {
        // Note: Backend handles duplication check on INSERT but for UI feedback we might check `vehicles` state locally too or handle 500 error
        try {
            // Create array for batch or single? Server has /batch for vehicles. Let's assume we use batch for single too or create single endpoint.
            // Wait, server.ts only has POST /batch implemented for vehicles? 
            // Let's implement single fetch call or wrap in array for batch.
            // Actually, I'll wrap it in array for now to reuse batch endpoint or just use batch.
            const res = await fetch('http://localhost:3000/api/v1/vehiculos/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([vehicle])
            });
            if (res.ok) fetchVehicles();
            else alert('Error al guardar. Posible duplicado.');
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBatch = async (newVehicles: any[]) => {
        try {
            const res = await fetch('http://localhost:3000/api/v1/vehiculos/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVehicles)
            });
            if (res.ok) fetchVehicles();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.placa.includes(searchTerm.toUpperCase()) ||
        v.marca.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="text-blue-600" />
                        Gestión de Flota
                    </h1>
                    <p className="text-gray-500">Total: {vehicles.length} vehículos gestionados</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                    >
                        <Upload size={18} />
                        Importar Flota
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Agregar Vehículo
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por placa o marca..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
                    <Filter size={18} />
                    Filtros
                </button>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Placa</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo Activo</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacidad</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredVehicles.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No se encontraron vehículos.
                                </td>
                            </tr>
                        ) : (
                            filteredVehicles.map((v) => (
                                <tr key={v.placa} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{v.placa}</td>
                                    <td className="px-6 py-4 text-gray-700">{v.marca}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${v.tipo_activo === 'CAMIONETA' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            v.tipo_activo === 'MOTO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-purple-50 text-purple-700 border-purple-200'
                                            }`}>
                                            {v.tipo_activo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{v.max_volumen}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 text-sm font-medium ${v.estado === 'OPERATIVO' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${v.estado === 'OPERATIVO' ? 'bg-green-600' : 'bg-red-600'
                                                }`} />
                                            {v.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-600 p-1">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <VehicleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveVehicle}
            />

            <BulkImportWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSaveBatch={handleSaveBatch}
            />
        </div>
    );
}
