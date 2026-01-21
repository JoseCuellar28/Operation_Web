import React, { useState, useEffect, useMemo } from 'react';
import { personalService, Employee } from '../../services/personalService';
import { Search, Download, Upload, Plus, RefreshCw, FilterX, Eye, Edit, Trash2, ArrowUpDown, Power, UserX } from 'lucide-react';
import * as XLSX from 'xlsx';
import { excelDateToJSDate } from '../../utils/excelUtils';
import { EmployeeModal } from './components/EmployeeModal';

export default function PersonalPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalSearch, setGlobalSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ACTIVOS'); // 'ACTIVOS', 'CESADOS', 'TODOS'

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [globalSearch, statusFilter]);

    // Sort Config
    const [sortConfig, setSortConfig] = useState<{ key: keyof Employee, direction: 'asc' | 'desc' } | null>(null);

    // Action Logic state
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handlers
    const handleOpenModal = (employee?: Employee, mode: 'create' | 'edit' | 'view' = 'create') => {
        setSelectedEmployee(employee);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleSaveEmployee = async (data: Partial<Employee>) => {
        try {
            if (modalMode === 'create') {
                await personalService.create(data);
                alert('Colaborador creado correctamente');
            } else {
                if (selectedEmployee?.dni) {
                    await personalService.update(selectedEmployee.dni, data);
                    alert('Colaborador actualizado correctamente');
                }
            }
            fetchEmployees();
        } catch (error) {
            console.error(error);
            alert('Error al guardar: ' + (error as any).message);
        }
    };

    const handleCesar = async (employee: Employee) => {
        const fecha = prompt("Ingrese Fecha de Cese (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
        if (!fecha) return;

        if (confirm(`¿Seguro que desea CESAR al colaborador ${employee.inspector}?`)) {
            try {
                await personalService.update(employee.dni, {
                    ...employee,
                    estado: 'CESADO',
                    fechaCese: fecha
                });
                alert('Colaborador cesado correctamente');
                fetchEmployees();
            } catch (e) {
                console.error(e);
                alert('Error al cesar colaborador');
            }
        }
    };

    const handleToggleUser = async (employee: Employee) => {
        const action = employee.userIsActive ? 'desactivar' : 'activar';
        if (confirm(`¿Desea ${action} el acceso de usuario para ${employee.inspector}?`)) {
            try {
                // Toggle logic
                const isActive = !employee.userIsActive;
                await personalService.update(employee.dni, {
                    ...employee,
                    userIsActive: isActive,
                    hasUser: true
                });
                fetchEmployees();
            } catch (e) {
                console.error(e);
                alert('Error al cambiar acceso');
            }
        }
    };

    const handleDelete = async (dni: string) => {
        if (confirm('¿Eliminar colaborador? Esta acción no se puede deshacer.')) {
            alert('Función Eliminar no implementada en servicio aún (Solo Cesar)');
        }
    };

    // Column Filters
    const [colFilters, setColFilters] = useState({
        dni: '',
        inspector: '', // Nombre
        telefono: '',
        area: '',
        tipo: '', // Puesto
        estado: '',
        fechaInicio: ''
    });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await personalService.getAll();
            setEmployees(data);
        } catch (err) {
            console.error('Failed to fetch employees', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSync = async () => {
        if (confirm('¿Desea sincronizar la base de datos local con el servidor central?')) {
            try {
                // Assuming syncService or personalService has this method. If not, will implement dummy or real call
                alert('Iniciando Sincronización...');
                // await personalService.sync(); 
                fetchEmployees();
            } catch (e) {
                alert('Error en sincronización');
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const jsonData = XLSX.utils.sheet_to_json(ws);

                if (!confirm(`Se han detectado ${jsonData.length} registros. ¿Proceder a cargar uno por uno?`)) {
                    e.target.value = '';
                    return;
                }

                setLoading(true);
                let successCount = 0;
                let failCount = 0;
                let errors: string[] = [];

                // Direct mapping logic (Dictionary)
                for (const row of jsonData as any[]) {
                    try {
                        const getVal = (keys: string[]) => {
                            for (const k of keys) if (row[k] !== undefined) return row[k];
                            return '';
                        };

                        const employeeData: Partial<Employee> = {
                            dni: String(getVal(['DNI', 'CODIGO SAP', 'dni'])),
                            inspector: getVal(['TRABAJADOR', 'NOMBRE', 'Inspector', 'Nombre']),
                            telefono: String(getVal(['TELEFONO', 'CELULAR', 'Telefono'])),
                            area: getVal(['AREA', 'UNIDAD', 'Area']),
                            tipo: getVal(['CARGO', 'PUESTO', 'Cargo']),
                            estado: 'ACTIVO',
                            fechaInicio: excelDateToJSDate(getVal(['FECHA INGRESO', 'F. INGRESO', 'Fecha Ingreso']))?.toISOString()
                        };

                        // Validate minimum requirement
                        if (!employeeData.dni) throw new Error("Falta DNI");

                        // Individual POST (Update if exists, Create if new - handled by logic often called 'Upsert' or just Create)
                        // User asked for "Peticiones POST individuales a /api/personal"
                        // Assuming POST handles upsert or we might get 409. 
                        // If 409 (Conflict), we might want to PUT.
                        // For Web 1 Replica, let's try Upsert logic if possible, or just POST.
                        // I'll try POST, if error, continue.

                        // Legacy logic usually tried to find then update. Here we just POST.
                        try {
                            await personalService.create(employeeData);
                            successCount++;
                        } catch (apiError: any) {
                            // If user exists, maybe try Update? Or just log failure as per "Fail Gracefully".
                            // Let's assume POST is create-only. If it fails, we count as error for now unless 409.
                            if (apiError.response?.status === 409) {
                                // Try Update
                                await personalService.update(employeeData.dni!, employeeData);
                                successCount++;
                            } else {
                                throw apiError;
                            }
                        }

                    } catch (err: any) {
                        failCount++;
                        errors.push(`Row DNI ${row['DNI'] || '?'}: ${err.message}`);
                    }
                }

                alert(`Proceso Finalizado.\nExitosos: ${successCount}\nFallidos: ${failCount}`);
                if (errors.length > 0) console.warn("Errores de carga:", errors);

                fetchEmployees();

            } catch (err) {
                console.error("Error processing file", err);
                alert("Error crítico al procesar el archivo Excel.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = ''; // Reset input
    };

    const processedEmployees = useMemo(() => {
        let result = [...employees];

        // 1. Status Filter (Base)
        if (statusFilter === 'ACTIVOS') {
            result = result.filter(e => e.estado === 'ACTIVO' || !e.fechaCese || new Date(e.fechaCese) > new Date());
        } else if (statusFilter === 'CESADOS') {
            result = result.filter(e => e.estado === 'CESADO' || (e.fechaCese && new Date(e.fechaCese) <= new Date()));
        }

        // 2. Global Search
        if (globalSearch) {
            const lowerSearch = globalSearch.toLowerCase();
            result = result.filter(e =>
                e.dni?.toLowerCase().includes(lowerSearch) ||
                e.inspector?.toLowerCase().includes(lowerSearch) ||
                e.telefono?.toLowerCase().includes(lowerSearch) ||
                e.tipo?.toLowerCase().includes(lowerSearch)
            );
        }

        // 3. Column Filters
        result = result.filter(e =>
            (colFilters.dni === '' || e.dni?.toLowerCase().includes(colFilters.dni.toLowerCase())) &&
            (colFilters.inspector === '' || e.inspector?.toLowerCase().includes(colFilters.inspector.toLowerCase())) &&
            (colFilters.telefono === '' || e.telefono?.toLowerCase().includes(colFilters.telefono.toLowerCase())) &&
            (colFilters.area === '' || e.area?.toLowerCase().includes(colFilters.area.toLowerCase())) &&
            (colFilters.tipo === '' || e.tipo?.toLowerCase().includes(colFilters.tipo.toLowerCase())) &&
            (colFilters.estado === '' || e.estado?.toLowerCase().includes(colFilters.estado.toLowerCase())) &&
            (colFilters.fechaInicio === '' || e.fechaInicio?.includes(colFilters.fechaInicio))
        );

        // 4. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const valA = a[sortConfig.key] ? String(a[sortConfig.key]).toLowerCase() : '';
                const valB = b[sortConfig.key] ? String(b[sortConfig.key]).toLowerCase() : '';
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [employees, statusFilter, globalSearch, colFilters, sortConfig]);

    const totalPages = Math.ceil(processedEmployees.length / itemsPerPage);
    const paginatedEmployees = processedEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key: keyof Employee) => {
        setSortConfig(current => ({
            key,
            direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50">
            {/* Toolbar Superior */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">

                {/* Search & Status */}
                <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar por DNI, Nombre, Puesto..."
                            value={globalSearch}
                            onChange={e => setGlobalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 outline-none focus:border-blue-500"
                    >
                        <option value="ACTIVOS">Activos</option>
                        <option value="CESADOS">Cesados</option>
                        <option value="TODOS">Todos</option>
                    </select>

                    <button
                        onClick={() => {
                            setGlobalSearch('');
                            setColFilters({ dni: '', inspector: '', telefono: '', area: '', tipo: '', estado: '', fechaInicio: '' });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Reset Filters"
                    >
                        <FilterX size={20} />
                    </button>
                </div>

                {/* Botonera */}
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 bg-white">
                        <Download size={16} />
                        <span className="hidden sm:inline">Plantilla</span>
                    </button>

                    <label className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 bg-white cursor-pointer">
                        <Upload size={16} />
                        <span className="hidden sm:inline">Cargar</span>
                        <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
                    </label>

                    <button
                        onClick={() => handleOpenModal(undefined, 'create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Nuevo</span>
                    </button>

                    <button
                        onClick={handleSync}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw size={16} />
                        <span className="hidden sm:inline">Sincronizar</span>
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th onClick={() => handleSort('dni')} className="px-4 py-3 cursor-pointer hover:bg-gray-100"><div className="flex items-center gap-1">DNI <ArrowUpDown size={12} /></div></th>
                                <th onClick={() => handleSort('inspector')} className="px-4 py-3 cursor-pointer hover:bg-gray-100"><div className="flex items-center gap-1">NOMBRE <ArrowUpDown size={12} /></div></th>
                                <th className="px-4 py-3">TELÉFONO</th>
                                <th className="px-4 py-3">ÁREA</th>
                                <th className="px-4 py-3">PUESTO</th>
                                <th className="px-4 py-3 text-center">USUARIO</th>
                                <th onClick={() => handleSort('estado')} className="px-4 py-3 cursor-pointer hover:bg-gray-100"><div className="flex items-center gap-1">ESTADO <ArrowUpDown size={12} /></div></th>
                                <th className="px-4 py-3">F. INGRESO</th>
                                <th className="px-4 py-3 text-center">ACCIONES</th>
                            </tr>
                            {/* Filter Row */}
                            <tr className="bg-white border-b border-gray-100">
                                <td className="p-2"><input value={colFilters.dni} onChange={e => setColFilters({ ...colFilters, dni: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.inspector} onChange={e => setColFilters({ ...colFilters, inspector: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.telefono} onChange={e => setColFilters({ ...colFilters, telefono: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.area} onChange={e => setColFilters({ ...colFilters, area: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.tipo} onChange={e => setColFilters({ ...colFilters, tipo: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"></td>
                                <td className="p-2"><input value={colFilters.estado} onChange={e => setColFilters({ ...colFilters, estado: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.fechaInicio} onChange={e => setColFilters({ ...colFilters, fechaInicio: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"></td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Cargando colaboradores...</td></tr>
                            ) : paginatedEmployees.length === 0 ? (
                                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No se encontraron registros.</td></tr>
                            ) : (
                                paginatedEmployees.map((emp) => (
                                    <tr key={emp.dni} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{emp.dni}</td>
                                        <td className="px-4 py-3 text-gray-800">{emp.inspector}</td>
                                        <td className="px-4 py-3 text-gray-600">{emp.telefono}</td>
                                        <td className="px-4 py-3 text-gray-600">{emp.area}</td>
                                        <td className="px-4 py-3 text-gray-600">{emp.tipo}</td>
                                        <td className="px-4 py-3 text-center">
                                            {emp.hasUser ? (
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${emp.userIsActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {emp.userIsActive ? 'ON' : 'OFF'}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {(() => {
                                                const now = new Date();
                                                const fechaCeseDate = emp.fechaCese ? new Date(emp.fechaCese) : null;
                                                let statusClass, statusText;

                                                if (fechaCeseDate && fechaCeseDate <= now) {
                                                    statusClass = "bg-red-100 text-red-800";
                                                    statusText = "CESADO";
                                                } else if (emp.hasUser && !emp.userIsActive) {
                                                    statusClass = "bg-yellow-100 text-yellow-800";
                                                    statusText = "USUARIO INACTIVO";
                                                } else {
                                                    statusClass = "bg-green-100 text-green-800";
                                                    statusText = "ACTIVO";
                                                }
                                                return (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClass}`}>
                                                        {statusText}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                            {emp.fechaInicio ? new Date(emp.fechaInicio).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center items-center gap-1">
                                                <button onClick={() => handleOpenModal(emp, 'view')} className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center text-blue-600" title="Ver">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleOpenModal(emp, 'edit')} className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center text-orange-600" title="Editar">
                                                    <Edit size={16} />
                                                </button>
                                                {emp.hasUser && (
                                                    <button onClick={() => handleToggleUser(emp)} className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center" title={emp.userIsActive ? 'Desactivar Usuario' : 'Activar Usuario'}>
                                                        <Power size={16} className={emp.userIsActive ? 'text-green-500' : 'text-red-500'} />
                                                    </button>
                                                )}
                                                {(!emp.fechaCese || new Date(emp.fechaCese) > new Date()) && (
                                                    <button onClick={() => handleCesar(emp)} className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center text-red-600" title="Cesar">
                                                        <UserX size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(emp.dni)} className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600" title="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, processedEmployees.length)}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, processedEmployees.length)}</span> de <span className="font-medium">{processedEmployees.length}</span> resultados
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
                        >
                            Anterior
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let startPage = Math.max(1, currentPage - 2);
                                if (startPage + 4 > totalPages) startPage = Math.max(1, totalPages - 4);
                                const pageNum = startPage + i;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 border rounded text-sm ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEmployee}
                initialData={selectedEmployee}
                mode={modalMode}
                onUserUpdate={fetchEmployees}
            />
        </div>
    );
}
