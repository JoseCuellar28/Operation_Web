import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Trash2, RefreshCw, Map, ChevronLeft, ChevronRight } from 'lucide-react';
// import { supabase } from '../connections/supabase'; // Removed

interface WorkOrder {
  id: string;
  code: string;
  client: string;
  supply_id: string | null;
  work_type: string;
  address: string;
  district: string;
  zone: string | null;
  status: 'pendiente' | 'asignado' | 'en_ejecucion' | 'cerrado';
  origin: string;
  priority: string;
  scheduled_date: string | null;
  assigned_crew_id: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  crews?: {
    code: string;
  };
}

type StatusFilter = 'todos' | 'pendiente' | 'asignado' | 'en_ejecucion' | 'cerrado';
type OriginFilter = 'todos' | 'calidda' | 'luz_del_sur' | 'interno';

export default function MasterBoardView() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workOrders, searchText, statusFilter, originFilter, dateFrom, dateTo]);

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/v1/work-orders`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWorkOrders(data || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...workOrders];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(order =>
        order.code?.toLowerCase().includes(search) ||
        order.supply_id?.toLowerCase().includes(search) ||
        order.address?.toLowerCase().includes(search) ||
        order.id?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (originFilter !== 'todos') {
      filtered = filtered.filter(order => order.origin === originFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(order => {
        if (!order.created_at) return false;
        return new Date(order.created_at) >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter(order => {
        if (!order.created_at) return false;
        return new Date(order.created_at) <= new Date(dateTo);
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageOrders = getCurrentPageOrders();
      setSelectedIds(currentPageOrders.map(order => order.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} órdenes? Esta acción no se puede deshacer.`)) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/v1/work-orders/batch`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (!res.ok) throw new Error('Error al eliminar órdenes');

      const data = await res.json();
      alert(data.message);
      setSelectedIds([]);
      fetchWorkOrders(); // Refresh table
    } catch (error) {
      console.error(error);
      alert('Error al eliminar las órdenes seleccionadas.');
    }
  };

  const handleChangeStatus = async () => {
    // Simple prompt for now, could be a modal
    const newStatus = prompt('Ingrese el nuevo estado para las órdenes seleccionadas (pendiente, asignado, en_ejecucion, cerrado):');
    if (!newStatus) return;

    const validStatuses = ['pendiente', 'asignado', 'en_ejecucion', 'cerrado'];
    if (!validStatuses.includes(newStatus.toLowerCase())) {
      alert('Estado no válido. Use: pendiente, asignado, en_ejecucion, cerrado');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/v1/work-orders/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: newStatus.toLowerCase() })
      });

      if (!res.ok) throw new Error('Error al actualizar estado');

      const data = await res.json();
      alert(data.message);
      setSelectedIds([]);
      fetchWorkOrders();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el estado de las órdenes.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pendiente: 'bg-gray-100 text-gray-800',
      asignado: 'bg-blue-100 text-blue-800',
      en_ejecucion: 'bg-yellow-100 text-yellow-800',
      cerrado: 'bg-green-100 text-green-800'
    };

    const labels = {
      pendiente: 'Pendiente',
      asignado: 'Asignado',
      en_ejecucion: 'En Ejecución',
      cerrado: 'Cerrado'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.pendiente}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentPageOrders = getCurrentPageOrders();
  const allCurrentPageSelected = currentPageOrders.length > 0 && currentPageOrders.every(order => selectedIds.includes(order.id));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-semibold text-gray-800">Tablero Maestro de OT</h2>
        <p className="text-sm text-gray-500 mt-1">Gestión centralizada de órdenes de trabajo</p>
      </div>

      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por suministro, dirección o ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="asignado">Asignado</option>
              <option value="en_ejecucion">En Ejecución</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          <div>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value as OriginFilter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="todos">Todos los Orígenes</option>
              <option value="calidda">Calidda</option>
              <option value="luz_del_sur">Luz del Sur</option>
              <option value="interno">Interno</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Desde"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Hasta"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {currentPageOrders.length} de {filteredOrders.length} órdenes
            {selectedIds.length > 0 && ` (${selectedIds.length} seleccionadas)`}
          </div>
          <button
            onClick={fetchWorkOrders}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Cargando órdenes...</div>
          </div>
        ) : currentPageOrders.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron órdenes</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID OT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente / Suministro
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distrito
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuadrilla
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPageOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`#order-${order.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {order.code || order.id.slice(0, 8)}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{order.client}</div>
                        {order.supply_id && (
                          <div className="text-xs text-gray-500">{order.supply_id}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">{order.address}</span>
                          {order.latitude && order.longitude && (
                            <button
                              onClick={() => window.open(`https://www.google.com/maps?q=${order.latitude},${order.longitude}`, '_blank')}
                              className="text-blue-600 hover:text-blue-800"
                              title="Ver en mapa"
                            >
                              <MapPin className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.district}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.crews?.code || (
                          <span className="text-gray-400 italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {order.origin === 'calidda' ? 'Calidda' :
                            order.origin === 'luz_del_sur' ? 'Luz del Sur' :
                              'Interno'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky bottom-0 bg-blue-600 border-t border-blue-700 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-white font-medium">
                {selectedIds.length} {selectedIds.length === 1 ? 'orden seleccionada' : 'órdenes seleccionadas'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Seleccionados
                </button>
                <button
                  onClick={handleChangeStatus}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Cambiar Estado
                </button>
                <button
                  onClick={() => alert('Funcionalidad de mapa en desarrollo')}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                >
                  <Map className="h-4 w-4" />
                  Enviar al Mapa de Planificación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
