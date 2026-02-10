import { useEffect, useState } from 'react';
import { Users, CheckCircle2, Clock, XCircle, MapPin, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceRecord, Employee } from '../../connections/supabase';
import AttendanceMap from '../../components/AttendanceMap';
import ResolutionDrawer from '../../components/ResolutionDrawer';

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function KPICard({ title, value, icon: Icon, color, bgColor }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );
}

export default function AttendanceView() {
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [syncFilter, setSyncFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'seguimiento'>('monitor');
  const [showAbsents, setShowAbsents] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Return local date in YYYY-MM-DD format
    const local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().split('T')[0];
  });

  const loadAttendance = async () => {
    setLoading(true);
    try {
      // 1. Fetch Attendance from SQL API
      const recordsRes = await fetch(`/api/v1/attendance?date=${selectedDate}`);

      if (!recordsRes.ok) throw new Error('Failed to fetch attendance');
      const recordsData: AttendanceRecord[] = await recordsRes.json();

      // 2. Fetch Employees from SQL API
      const employeesRes = await fetch('/api/v1/employees');

      if (!employeesRes.ok) throw new Error('Failed to fetch employees');
      const allEmployees: Employee[] = await employeesRes.json();

      // 3. Identify absent employees
      const presentEmployeeIds = new Set(recordsData.map(r => r.employee_id));
      const absentEmployees: AttendanceRecord[] = allEmployees
        .filter(emp => !presentEmployeeIds.has(emp.id))
        .map(emp => ({
          id: `absent-${emp.id}`, // Unique ID for absent records
          employee_id: emp.id,
          employee: emp,
          check_in_time: '',
          check_out_time: '',
          location_lat: null,
          location_lng: null,
          location_address: null,
          system_status: 'falta',
          whatsapp_sync: false,
          sync_date: null,
          alert_status: undefined,
          gps_justification: null,
          resolved_at: null,
          notes: null,
          date: selectedDate,
          health_status: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

      const combinedRecords = [...(recordsData || []), ...absentEmployees];
      setAllRecords(combinedRecords);
      setFilteredRecords(combinedRecords);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  useEffect(() => {
    let filtered = [...allRecords];

    // Filter by Tab specific logic
    if (activeTab === 'seguimiento') {
      filtered = filtered.filter(r =>
        (r.alert_status === 'pending') ||
        (r.whatsapp_sync === false && r.system_status !== 'falta')
      );
    } else {
      // Monitor Tab: Default to hiding absences unless explicitly requested
      if (!showAbsents && statusFilter === 'all' && !searchTerm) {
        filtered = filtered.filter(r => r.system_status !== 'falta');
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.employee?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.system_status === statusFilter);
    }

    if (syncFilter !== 'all') {
      const isSynced = syncFilter === 'synced';
      filtered = filtered.filter(r => r.whatsapp_sync === isSynced);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, syncFilter, allRecords, activeTab, showAbsents]);

  const handleRowClick = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedRecord(null), 300);
  };

  const handleSyncToggle = async (recordId: string, currentSync: boolean) => {
    if (recordId.startsWith('absent-')) return;

    setSyncing(recordId);
    try {
      const res = await fetch(`/api/v1/attendance/${recordId}/sync`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_sync: !currentSync })
      });

      if (!res.ok) throw new Error('Sync failed');
      await loadAttendance();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(null);
    }
  };

  const handleAcceptAlert = async (recordId: string) => {
    setIsProcessing(true);
    try {
      // Determine action based on alert status
      const record = allRecords.find(r => r.id === recordId);
      const action = record?.alert_status === 'pending' ? 'approve_exception' : 'accept';

      const res = await fetch(`/api/v1/attendance/${recordId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!res.ok) throw new Error('Failed to accept');
      await loadAttendance();
      handleCloseDrawer();
    } catch (error) {
      console.error('Error accepting alert:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAlert = async (recordId: string) => {
    setIsProcessing(true);
    try {
      const record = allRecords.find(r => r.id === recordId);
      const action = record?.alert_status === 'pending' ? 'reject_exception' : 'reject';

      const res = await fetch(`/api/v1/attendance/${recordId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!res.ok) throw new Error('Failed to reject');
      await loadAttendance();
      handleCloseDrawer();
    } catch (error) {
      console.error('Error rejecting alert:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPlantilla = allRecords.length;
  const asistieron = allRecords.filter(r => r.system_status === 'presente').length;
  const tardanzas = allRecords.filter(r => r.system_status === 'tardanza').length;
  const faltas = allRecords.filter(r => r.system_status === 'falta').length;

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const recordsWithLocation = filteredRecords.filter(r => r.location_lat && r.location_lng);

  const getStatusBadge = (record: AttendanceRecord) => {
    if (record.system_status === 'APROBADA_EXC' || record.alert_status === 'exception_approved') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">Excepción Aprobada</span>;
    }
    if (record.system_status === 'RECHAZADA' || record.alert_status === 'exception_rejected') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 line-through">Excepción Rechazada</span>;
    }

    if (record.alert_status === 'pending') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">ALERTA GPS</span>;
    }

    switch (record.system_status) {
      case 'presente':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Presente</span>;
      case 'tardanza':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Tardanza</span>;
      case 'falta':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Falta</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{record.system_status}</span>;
    }
  };

  const getHealthBadge = (health: string) => {
    if (!health) return <span className="text-xs text-gray-400">-</span>;
    if (health === 'saludable') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Saludable</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{health}</span>;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'monitor'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          Monitor de Asistencia
        </button>
        <button
          onClick={() => setActiveTab('seguimiento')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'seguimiento'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          Seguimiento de Incidencias
          {(allRecords.filter(r => r.alert_status === 'pending').length > 0) && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">
              {allRecords.filter(r => r.alert_status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'monitor' ? 'Monitor en Tiempo Real' : 'Control de Incidencias'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">
              Dashboard:
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={loadAttendance}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>

      {
        activeTab === 'monitor' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard
              title="Total Plantilla"
              value={totalPlantilla}
              icon={Users}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <KPICard
              title="Asistieron"
              value={asistieron}
              icon={CheckCircle2}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <KPICard
              title="Tardanzas"
              value={tardanzas}
              icon={Clock}
              color="text-yellow-600"
              bgColor="bg-yellow-50"
            />
            <KPICard
              title="Faltas"
              value={faltas}
              icon={XCircle}
              color="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPICard
              title="Alertas GPS Pendientes"
              value={allRecords.filter(r => r.alert_status === 'pending').length}
              icon={MapPin}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
            <KPICard
              title="Sincronización Pendiente"
              value={allRecords.filter(r => !r.whatsapp_sync && r.system_status !== 'falta').length}
              icon={RefreshCw}
              color="text-red-600"
              bgColor="bg-red-50"
            />
            <KPICard
              title="Registros Hoy"
              value={recordsWithLocation.length}
              icon={CheckCircle2}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
          </div>
        )
      }

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Registros de Asistencia</h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Filtro de Estado</option>
                <option value="presente">Presente</option>
                <option value="tardanza">Tardanza</option>
                <option value="falta">Falta (Ausentes)</option>
              </select>

              <select
                value={syncFilter}
                onChange={(e) => setSyncFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Sincronización</option>
                <option value="synced">Sincronizado</option>
                <option value="pending">Pendiente</option>
              </select>

              {activeTab === 'monitor' && (
                <div className="flex items-center gap-2 px-3 border border-gray-300 rounded-lg bg-gray-50">
                  <input
                    type="checkbox"
                    id="showAbsents"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={showAbsents}
                    onChange={(e) => setShowAbsents(e.target.checked)}
                  />
                  <label htmlFor="showAbsents" className="text-xs text-gray-600 cursor-pointer select-none">Mostrar Ausentes</label>
                </div>
              )}

              <div className="text-xs text-gray-500 flex items-center justify-end font-medium">
                {filteredRecords.length} resultado(s)
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Cargando...</div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Marca</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Salud</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Sistema</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cruce WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.map((record) => {
                    const isBlocked = record.employee?.estado_operativo === 'BLOQUEADO_SALUD';

                    return (
                      <tr
                        key={record.id}
                        onClick={() => handleRowClick(record)}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isBlocked ? 'bg-red-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={record.employee?.photo_url || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200'}
                                alt={record.employee?.name}
                                className={`w-10 h-10 rounded-full object-cover ${isBlocked ? 'border-2 border-red-600' : ''}`}
                              />
                              {isBlocked && (
                                <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 border border-white" title="BLOQUEADO_SALUD: STOP WORK">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                {record.employee?.name}
                                {isBlocked && <span className="text-[10px] font-bold text-red-600 border border-red-200 bg-red-100 px-1 rounded">STOP</span>}
                              </div>
                              <div className="text-xs text-gray-500">{record.employee?.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600">
                            {record.date}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {record.check_in_time ? (
                            <div className="text-sm text-gray-900">
                              {new Date(record.check_in_time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {record.location_address ? (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="truncate max-w-[150px]">{record.location_address}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getHealthBadge(record.health_status)}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(record)}
                        </td>
                        <td className="px-4 py-3">
                          {record.system_status !== 'falta' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSyncToggle(record.id, record.whatsapp_sync);
                              }}
                              disabled={syncing === record.id}
                              className="flex items-center gap-2 group"
                            >
                              {record.whatsapp_sync ? (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-700 font-medium group-hover:text-green-800">Sincronizado</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-red-700 font-medium group-hover:text-red-800">Pendiente</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm font-medium ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={20} />
              Mapa en Vivo
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {recordsWithLocation.length} ubicaciones marcadas
            </p>
          </div>
          <div className="flex-1 relative">
            {recordsWithLocation.length > 0 ? (
              <AttendanceMap records={recordsWithLocation} isDrawerOpen={isDrawerOpen} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center p-6">
                  <MapPin size={48} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No hay ubicaciones para mostrar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ResolutionDrawer
        record={selectedRecord}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAccept={handleAcceptAlert}
        onReject={handleRejectAlert}
        isProcessing={isProcessing}
      />
    </div>
  );
}
