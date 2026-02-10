import React, { useState, useEffect, useMemo } from 'react';
import { personalService, Employee } from '../../services/personalService';
import { Search, Download, Upload, Plus, RefreshCw, FilterX, Eye, Edit, Trash2, ArrowUpDown, Power, UserX } from 'lucide-react';
import * as XLSX from 'xlsx';
import { excelDateToJSDate } from '../../utils/excelUtils';
import { EmployeeModal } from './components/EmployeeModal';
import { CessationModal } from './components/CessationModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ImportConfirmModal } from '../../components/ImportConfirmModal';

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


    // Cessation Modal State
    const [isCessationModalOpen, setIsCessationModalOpen] = useState(false);
    const [employeeToCease, setEmployeeToCease] = useState<Employee | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

    // Import Confirmation Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [pendingImportData, setPendingImportData] = useState<any[] | null>(null);
    const [importRecordCount, setImportRecordCount] = useState(0);
    const [isImporting, setIsImporting] = useState(false);

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

    const handleCesar = (employee: Employee) => {
        setEmployeeToCease(employee);
        setIsCessationModalOpen(true);
    };

    const handleConfirmCessation = async (date: string, reason: string) => {
        if (!employeeToCease) return;

        try {
            await personalService.terminate(employeeToCease.dni, date, reason);
            alert('Colaborador cesado correctamente');
            fetchEmployees();
            setIsCessationModalOpen(false);
            setEmployeeToCease(null);
        } catch (e) {
            console.error(e);
            alert('Error al cesar colaborador: ' + (e as any).message);
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

    const handleDelete = (employee: Employee) => {
        if (!employee.dni) {
            console.error('Cant delete employee without DNI', employee);
            return;
        }
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!employeeToDelete?.dni) {
            console.error('No employee DNI for deletion', employeeToDelete);
            alert('Error: DNI no encontrado para este colaborador');
            return;
        }

        try {
            console.log(`[DEBUG] Attempting to delete DNI: ${employeeToDelete.dni}`);
            await personalService.delete(employeeToDelete.dni);
            alert('Colaborador eliminado correctamente');
            fetchEmployees();
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        } catch (e) {
            console.error('Delete action failed:', e);
            alert('Error al eliminar colaborador');
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
        fechaInicio: '',
        usuario: ''
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

    const calculateAntiquity = (startDate: string | undefined) => {
        if (!startDate) return '-';
        const start = new Date(startDate);
        const end = new Date();
        if (isNaN(start.getTime()) || start > end) return '-';

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const parts = [];
        if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
        if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
        if (days > 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);

        return parts.length > 0 ? parts.join(', ') : 'Menos de 1 día';
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSync = async () => {
        if (confirm('¿Desea sincronizar la base de datos local con el servidor central?')) {
            try {
                setLoading(true);
                await personalService.sync();
                alert('Sincronización finalizada correctamente');
                fetchEmployees();
            } catch (e) {
                console.error(e);
                alert('Error en sincronización');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDownloadTemplate = () => {
        const headers = [['DNI', 'TRABAJADOR', 'TELEFONO', 'AREA', 'CARGO', 'FECHA INGRESO']];
        const ws = XLSX.utils.aoa_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
        XLSX.writeFile(wb, 'Plantilla_Colaboradores.xlsx');
    };

    // Handler para confirmar importación desde el modal
    const handleConfirmImport = async () => {
        if (!pendingImportData) return;

        try {
            setIsImporting(true);
            setIsImportModalOpen(false); // Cerrar modal

            const jsonData = pendingImportData;

            // Helper para obtener valores con múltiples posibles nombres de columna
            const getVal = (row: any, keys: string[]) => {
                for (const k of keys) {
                    if (row[k] !== undefined && row[k] !== null && row[k] !== '') {
                        return row[k];
                    }
                }
                return null;
            };

            // Helper para convertir fechas de Excel a ISO string
            const parseExcelDate = (val: any): string | null => {
                if (!val) return null;
                const date = excelDateToJSDate(val);
                return date ? date.toISOString() : null;
            };

            // Mapear TODOS los 27 campos del Excel
            const employees = jsonData.map((row: any) => ({
                // Identificación
                dni: String(getVal(row, ['DNI', 'CODIGO SAP', 'Documento']) || '').trim(),
                codigoSAP: String(getVal(row, ['CODIGO SAP', 'Código SAP', 'CodigoSAP']) || '').trim(),

                // Datos personales
                trabajador: String(getVal(row, ['TRABAJADOR', 'NOMBRE', 'Nombre Completo', 'Inspector']) || '').trim(),
                fechaNacimiento: parseExcelDate(getVal(row, ['FECHA NACIMIENTO', 'F. Nacimiento', 'FechaNacimiento'])),
                sexo: String(getVal(row, ['SEXO', 'Género']) || '').trim(),
                edad: getVal(row, ['EDAD', 'Edad']) ? Number(getVal(row, ['EDAD', 'Edad'])) : null,

                // Organización
                situacion: String(getVal(row, ['SITUACION', 'Situación']) || '').trim(),
                categoria: String(getVal(row, ['CATEGORIA / GRUPO OCUPACIONAL', 'CATEGORIA', 'Categoría']) || '').trim(),
                cargo: String(getVal(row, ['CARGO', 'PUESTO', 'Tipo']) || '').trim(),
                division: String(getVal(row, ['DIVISION', 'División']) || '').trim(),
                lineaNegocio: String(getVal(row, ['LINEA DE NEGOCIO', 'Línea Negocio', 'LineaNegocio']) || '').trim(),
                areaProyecto: String(getVal(row, ['AREA-PROYECTO', 'AREA/PROYECTO', 'Area', 'Proyecto']) || '').trim(),
                seccionServicio: String(getVal(row, ['SECCION-SERVICIO', 'SECCION/SERVICIO', 'Sección', 'Servicio']) || '').trim(),
                detalleCebe: String(getVal(row, ['DETALLE CEBE', 'Detalle']) || '').trim(),
                codigoCebe: String(getVal(row, ['CODIGO CEBE', 'CódigoCebe']) || '').trim(),

                // Estado laboral
                fechaIngreso: parseExcelDate(getVal(row, ['FECHA INGRESO', 'F. Ingreso', 'FechaIngreso'])),
                fechaCese: parseExcelDate(getVal(row, ['FECHA DE CESE', 'F. Cese', 'FechaCese'])),
                motivoCese: String(getVal(row, ['MOTIVO DE CESE', 'Motivo Cese', 'MotivoCese']) || '').trim(),
                permanencia: getVal(row, ['PERMANENCIA', 'Permanencia']) ? Number(getVal(row, ['PERMANENCIA', 'Permanencia'])) : null,

                // Contacto
                correoCorporativo: String(getVal(row, ['CORREO CORPORATIVO', 'Email', 'Correo']) || '').trim(),
                correoPersonal: String(getVal(row, ['CORREO PERSONAL', 'Email Personal']) || '').trim(),
                telefono: String(getVal(row, ['TELEFONO', 'CELULAR', 'Teléfono']) || '').trim(),

                // Otros
                sedeTrabajo: String(getVal(row, ['SEDE DE TRABAJO', 'Sede', 'Distrito']) || '').trim(),
                jefeInmediato: String(getVal(row, ['JEFE INMEDIATO', 'Jefe']) || '').trim(),
                comentario: String(getVal(row, ['COMENTARIO', 'Observaciones']) || '').trim()
            })).filter((emp: any) => emp.dni); // Filtrar filas sin DNI

            console.log(`✅ Registros válidos con DNI: ${employees.length}`);

            if (employees.length === 0) {
                alert('❌ No se encontraron registros válidos con DNI.\n\nVerifica que el Excel tenga datos en la columna DNI.');
                return;
            }

            console.log(`🚀 Iniciando importación de ${employees.length} registros...`);
            console.log(`📋 Primer registro:`, employees[0]);

            // Llamar al endpoint de importación masiva
            console.log('📡 Enviando datos al servidor...');
            const response = await fetch('/api/personal/bulk-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    employees: employees,
                    usuario: 'Admin' // TODO: Obtener del contexto de usuario
                })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();

            // Mostrar resultados detallados
            alert(
                `✅ Importación Completada\n\n` +
                `✅ Creados: ${result.created}\n` +
                `🔄 Actualizados: ${result.updated}\n` +
                `⏭️ Sin cambios: ${result.unchanged}\n` +
                `❌ Fallidos: ${result.failed}\n\n` +
                `${result.message}`
            );

            if (result.errors && result.errors.length > 0) {
                console.warn('Errores de importación:', result.errors);
            }

            // Recargar la lista
            fetchEmployees();

        } catch (err) {
            console.error("Error processing import", err);
            alert("Error crítico al procesar la importación.");
        } finally {
            setIsImporting(false);
            setPendingImportData(null);
        }
    };

    const handleCancelImport = () => {
        setIsImportModalOpen(false);
        setPendingImportData(null);
        setLoading(false);
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

                // El Excel tiene metadata en las primeras 4 filas
                // Fila 5 tiene los headers reales: DNI, CODIGO SAP, TRABAJADOR, etc.
                // IMPORTANTE: La columna A está vacía, los datos empiezan en columna B
                // Necesitamos empezar desde la fila 5 Y desde la columna B (índice 1)
                const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
                range.s.r = 4; // Empezar desde fila 5 (0-indexed)
                range.s.c = 1; // Empezar desde columna B (0-indexed), saltando columna A vacía
                const jsonData = XLSX.utils.sheet_to_json(ws, { range: XLSX.utils.encode_range(range) });

                console.log(`📊 Registros parseados: ${jsonData.length}`);

                // Mostrar modal personalizado en lugar de confirm nativo
                setImportRecordCount(jsonData.length);
                setPendingImportData(jsonData);
                setIsImportModalOpen(true);
                e.target.value = ''; // Limpiar input para permitir re-selección

                // El procesamiento continuará cuando el usuario confirme en handleConfirmImport()
                return; // Salir aquí, la importación se ejecutará desde el modal

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
        // 0. Filter invalid records (DNI is required)
        let result = employees.filter(e => e.dni && e.dni.trim() !== '');

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
            (colFilters.fechaInicio === '' || e.fechaInicio?.includes(colFilters.fechaInicio)) &&
            (colFilters.usuario === '' ||
                (colFilters.usuario === 'ON' && e.hasUser && e.userIsActive) ||
                (colFilters.usuario === 'OFF' && e.hasUser && !e.userIsActive) ||
                (colFilters.usuario === 'NONE' && !e.hasUser)
            )
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
                            setColFilters({ dni: '', inspector: '', telefono: '', area: '', tipo: '', estado: '', fechaInicio: '', usuario: '' });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Reset Filters"
                    >
                        <FilterX size={20} />
                    </button>
                </div>

                {/* Botonera */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadTemplate}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 bg-white"
                    >
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Total</p>
                    <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Activos</p>
                    <p className="text-3xl font-bold text-green-600">
                        {employees.filter(e => e.estado === 'ACTIVO' || !e.fechaCese || new Date(e.fechaCese) > new Date()).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Con Usuario</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {employees.filter(e => e.hasUser && e.userIsActive).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Inactivos</p>
                    <p className="text-3xl font-bold text-red-600">
                        {employees.filter(e => e.estado === 'CESADO' || (e.fechaCese && new Date(e.fechaCese) <= new Date())).length}
                    </p>
                </div>
            </div>

            {/* Data Grid */}
            {isImporting && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <p className="text-blue-700 font-medium">⏳ Importando datos... Por favor espere.</p>
                    </div>
                </div>
            )}
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
                                <th className="px-4 py-3">ANTIGÜEDAD</th>
                                <th className="px-4 py-3 text-center">ACCIONES</th>
                            </tr>
                            {/* Filter Row */}
                            <tr className="bg-white border-b border-gray-100">
                                <td className="p-2"><input value={colFilters.dni} onChange={e => setColFilters({ ...colFilters, dni: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.inspector} onChange={e => setColFilters({ ...colFilters, inspector: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.telefono} onChange={e => setColFilters({ ...colFilters, telefono: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.area} onChange={e => setColFilters({ ...colFilters, area: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.tipo} onChange={e => setColFilters({ ...colFilters, tipo: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2">
                                    <select
                                        value={colFilters.usuario}
                                        onChange={e => setColFilters({ ...colFilters, usuario: e.target.value })}
                                        className="w-full px-1 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500"
                                    >
                                        <option value="">TODOS</option>
                                        <option value="ON">ON</option>
                                        <option value="OFF">OFF</option>
                                        <option value="NONE">SIN USUARIO</option>
                                    </select>
                                </td>
                                <td className="p-2"><input value={colFilters.estado} onChange={e => setColFilters({ ...colFilters, estado: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"><input value={colFilters.fechaInicio} onChange={e => setColFilters({ ...colFilters, fechaInicio: e.target.value })} placeholder="Filtrar..." className="w-full px-2 py-1 text-xs border rounded bg-gray-50 focus:bg-white outline-none focus:border-blue-500" /></td>
                                <td className="p-2"></td>
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
                                        <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                                            {calculateAntiquity(emp.fechaInicio)}
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
                                                <button onClick={() => handleDelete(emp)} className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600" title="Eliminar">
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
                key={`${modalMode}-${selectedEmployee?.dni || 'new'}-${isModalOpen}`}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEmployee}
                initialData={selectedEmployee}
                mode={modalMode}
                onUserUpdate={fetchEmployees}
            />

            <CessationModal
                isOpen={isCessationModalOpen}
                onClose={() => setIsCessationModalOpen(false)}
                onConfirm={handleConfirmCessation}
                employeeName={employeeToCease?.inspector || ''}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                employeeName={employeeToDelete?.inspector || ''}
                dni={employeeToDelete?.dni || ''}
            />

            <ImportConfirmModal
                isOpen={isImportModalOpen}
                recordCount={importRecordCount}
                onConfirm={handleConfirmImport}
                onCancel={handleCancelImport}
            />
        </div>
    );
}
