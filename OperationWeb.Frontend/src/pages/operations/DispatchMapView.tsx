import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents } from 'react-leaflet';
import { Filter, Truck, AlertCircle, Clock, MapPin as MapPinIcon, X, Pencil } from 'lucide-react';
import L from 'leaflet';
import { supabase } from '../../connections/supabase';
import 'leaflet/dist/leaflet.css';

interface WorkOrder {
  id: string;
  code: string;
  client: string;
  address: string;
  district: string;
  status: string;
  latitude: number;
  longitude: number;
  priority: string;
  estimated_hours?: number;
}

interface Crew {
  id: string;
  code: string;
  current_capacity: number;
  max_capacity: number;
  assigned_orders: string[];
  status: string;
  latitude: number;
  longitude: number;
}

interface Assignment {
  crew_id: string;
  order_id: string;
  order: WorkOrder;
}

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const truckIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const centerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapDrawHandler({
  isDrawing,
  onDrawStart,
  onDrawMove,
  onDrawEnd
}: {
  isDrawing: boolean;
  onDrawStart: (lat: number, lng: number) => void;
  onDrawMove: (lat: number, lng: number) => void;
  onDrawEnd: () => void;
}) {
  const map = useMapEvents({
    mousedown: (e) => {
      if (isDrawing) {
        onDrawStart(e.latlng.lat, e.latlng.lng);
      }
    },
    mousemove: (e) => {
      if (isDrawing) {
        onDrawMove(e.latlng.lat, e.latlng.lng);
      }
    },
    mouseup: () => {
      if (isDrawing) {
        onDrawEnd();
      }
    },
  });

  useEffect(() => {
    if (isDrawing) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    }
  }, [isDrawing, map]);

  return null;
}

export default function DispatchMapView() {
  const [pendingOrders, setPendingOrders] = useState<WorkOrder[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [draggedOrder, setDraggedOrder] = useState<WorkOrder | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const defaultCenter: [number, number] = [-12.0464, -77.0428];

  useEffect(() => {
    fetchPendingOrders();
    fetchCrews();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      console.log('Fetching pending orders...');
      const response = await fetch(`/api/v1/ots/pendientes`);
      console.log('Orders Response status:', response.status);

      if (!response.ok) throw new Error('Error fetching orders');
      const data = await response.json();
      console.log('Orders Data received:', data);

      setPendingOrders(data);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const fetchCrews = async () => {
    try {
      // Get local date string YYYY-MM-DD
      const local = new Date();
      local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
      const dateStr = local.toISOString().split('T')[0];

      const response = await fetch(`/api/v1/cuadrillas/disponibles?date=${dateStr}`);
      if (!response.ok) throw new Error('Error fetching crews');
      const data = await response.json();

      setCrews(data);
    } catch (error) {
      console.error('Error fetching crews:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, order: WorkOrder) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, crewId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, crewId: string) => {
    e.preventDefault();

    if (!draggedOrder) return;

    const crew = crews.find(c => c.id === crewId);
    if (!crew) return;

    // Call API to assign
    try {
      const response = await fetch(`/api/v1/ots/asignar-lote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewId: crewId,
          orderIds: [draggedOrder.id]
        })
      });

      if (!response.ok) throw new Error('Failed to assign');

      // Optimistic Update
      const orderHours = draggedOrder.estimated_hours || 2;
      const newCapacity = crew.current_capacity + orderHours;

      setCrews(prevCrews =>
        prevCrews.map(c =>
          c.id === crewId
            ? {
              ...c,
              current_capacity: newCapacity,
              assigned_orders: [...c.assigned_orders, draggedOrder.id]
            }
            : c
        )
      );

      setAssignments(prev => [
        ...prev,
        {
          crew_id: crewId,
          order_id: draggedOrder.id,
          order: draggedOrder
        }
      ]);

      setPendingOrders(prev => prev.filter(o => o.id !== draggedOrder.id));
      setDraggedOrder(null);

    } catch (error) {
      console.error('Error assigning order:', error);
      alert('Error en asignación');
    }
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkAssignment = async (crewId: string) => {
    const crew = crews.find(c => c.id === crewId);
    if (!crew) return;

    const ordersToAssign = pendingOrders.filter(order =>
      selectedOrders.includes(order.id)
    );

    try {
      // Call API Batch Assign
      const response = await fetch(`/api/v1/ots/asignar-lote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewId: crewId,
          orderIds: selectedOrders
        })
      });

      if (!response.ok) throw new Error('Failed to assign batch');

      const totalHours = ordersToAssign.reduce((sum, order) =>
        sum + (order.estimated_hours || 2), 0
      );
      const newCapacity = crew.current_capacity + totalHours;

      setCrews(prevCrews =>
        prevCrews.map(c =>
          c.id === crewId
            ? {
              ...c,
              current_capacity: newCapacity,
              assigned_orders: [...c.assigned_orders, ...selectedOrders]
            }
            : c
        )
      );

      const newAssignments = ordersToAssign.map(order => ({
        crew_id: crewId,
        order_id: order.id,
        order
      }));

      setAssignments(prev => [...prev, ...newAssignments]);
      setPendingOrders(prev => prev.filter(o => !selectedOrders.includes(o.id)));
      clearSelection();
    } catch (error) {
      console.error('Error assigning orders:', error);
      alert('Error al asignar las órdenes. Por favor intenta de nuevo.');
    }
  };

  const handleDrawStart = (lat: number, lng: number) => {
    setIsDragging(true);
    setPolygonPoints([[lat, lng]]);
  };

  const handleDrawMove = (lat: number, lng: number) => {
    if (isDragging) {
      setPolygonPoints(prev => {
        const lastPoint = prev[prev.length - 1];
        if (!lastPoint) return [[lat, lng]];

        const distance = Math.sqrt(
          Math.pow(lat - lastPoint[0], 2) + Math.pow(lng - lastPoint[1], 2)
        );

        if (distance > 0.001) {
          return [...prev, [lat, lng]];
        }
        return prev;
      });
    }
  };

  const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
    const x = point[0];
    const y = point[1];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  const handleDrawEnd = () => {
    if (isDragging && polygonPoints.length > 2) {
      const ordersInPolygon = pendingOrders.filter(order => {
        return isPointInPolygon([order.latitude, order.longitude], polygonPoints);
      });

      setSelectedOrders(ordersInPolygon.map(o => o.id));
    }
    setIsDragging(false);
    setIsDrawing(false);
  };

  const clearSelection = () => {
    setSelectedOrders([]);
    setPolygonPoints([]);
    setIsDrawing(false);
    setIsDragging(false);
  };

  const getFilteredOrders = () => {
    return pendingOrders.filter(order => {
      if (filterPriority !== 'all' && order.priority !== filterPriority) return false;
      if (filterZone !== 'all') {
        if (filterZone === 'norte' && !['San Martin de Porres', 'Los Olivos', 'Independencia'].includes(order.district)) return false;
        if (filterZone === 'sur' && !['San Juan de Miraflores', 'Villa El Salvador', 'Villa Maria del Triunfo'].includes(order.district)) return false;
      }
      return true;
    });
  };

  const getCrewLoadPercentage = (crew: Crew) => {
    return (crew.current_capacity / crew.max_capacity) * 100;
  };

  const getCrewRouteCoordinates = (crewId: string): [number, number][] => {
    const crewAssignments = assignments.filter(a => a.crew_id === crewId);
    const crew = crews.find(c => c.id === crewId);

    if (!crew || crewAssignments.length === 0) return [];

    const coordinates: [number, number][] = [[crew.latitude, crew.longitude]];
    crewAssignments.forEach(assignment => {
      coordinates.push([assignment.order.latitude, assignment.order.longitude]);
    });

    return coordinates;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backlog de OTs</h3>

          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterPriority(filterPriority === 'urgente' ? 'all' : 'urgente')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterPriority === 'urgente'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Urgente
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterZone(filterZone === 'norte' ? 'all' : 'norte')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterZone === 'norte'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Norte
              </button>
              <button
                onClick={() => setFilterZone(filterZone === 'sur' ? 'all' : 'sur')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterZone === 'sur'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Sur
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsDrawing(!isDrawing)}
            className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 mb-2 ${isDrawing
              ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300 animate-pulse'
              : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
          >
            <Pencil className="h-4 w-4" />
            {isDrawing
              ? (isDragging ? 'Dibujando...' : 'Click y arrastra en el mapa')
              : 'Dibujar Selección Libre'}
          </button>

          {isDrawing && !isDragging && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 mb-4">
              <p className="text-xs text-yellow-800 font-medium">
                Haz click y arrastra para dibujar libremente
              </p>
            </div>
          )}

          {isDragging && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-2 mb-4">
              <p className="text-xs text-green-800 font-medium">
                Dibujando... {polygonPoints.length} puntos
              </p>
            </div>
          )}

          {selectedOrders.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-blue-700 font-medium">
                  ✓ {selectedOrders.length} OT(s) seleccionadas
                </p>
                <button
                  onClick={clearSelection}
                  className="text-blue-600 hover:text-blue-800"
                  title="Limpiar selección"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <select
                className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded bg-white mb-2"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAssignment(e.target.value);
                  }
                }}
                defaultValue=""
              >
                <option value="">Asignar a cuadrilla...</option>
                {crews.map(crew => (
                  <option key={crew.id} value={crew.id}>
                    {crew.name} ({crew.current_capacity}/{crew.max_capacity}h)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              draggable
              onDragStart={(e) => handleDragStart(e, order)}
              onClick={() => handleOrderSelect(order.id)}
              className={`p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-all ${selectedOrders.includes(order.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
                }`}
            >
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.code}</p>
                  <p className="text-xs text-gray-600 truncate">{order.client}</p>
                  <p className="text-xs text-gray-500 truncate">{order.district}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{order.estimated_hours || 2}h</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No hay OTs pendientes</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{
            height: '100%',
            width: '100%',
            cursor: isDrawing ? 'crosshair' : 'grab'
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapDrawHandler
            isDrawing={isDrawing}
            onDrawStart={handleDrawStart}
            onDrawMove={handleDrawMove}
            onDrawEnd={handleDrawEnd}
          />

          {polygonPoints.length > 0 && (
            <Polygon
              positions={polygonPoints}
              pathOptions={{
                color: isDragging ? '#10b981' : '#3b82f6',
                fillColor: isDragging ? '#10b981' : '#3b82f6',
                fillOpacity: isDragging ? 0.15 : 0.2,
                weight: isDragging ? 3 : 2,
                dashArray: isDragging ? '10, 5' : undefined
              }}
            />
          )}

          {pendingOrders.map(order => (
            <Marker
              key={order.id}
              position={[order.latitude, order.longitude]}
              icon={selectedOrders.includes(order.id) ? greenIcon : redIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">{order.code}</p>
                  <p className="text-sm">{order.client}</p>
                  <p className="text-xs text-gray-600">{order.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {order.estimated_hours || 2} horas
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {crews.map(crew => (
            <Marker
              key={`truck-${crew.id}`}
              position={[crew.latitude, crew.longitude]}
              icon={truckIcon}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {crew.code}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Carga: {crew.current_capacity}/{crew.max_capacity}h
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {crews.map(crew => {
            const routeCoordinates = getCrewRouteCoordinates(crew.id);
            if (routeCoordinates.length < 2) return null;

            return (
              <Polyline
                key={`route-${crew.id}`}
                positions={routeCoordinates}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '10, 10'
                }}
              />
            );
          })}
        </MapContainer>

      </div>

      <div className="w-1/5 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cuadrillas</h3>
          <p className="text-xs text-gray-500 mt-1">Arrastra OTs aquí para asignar</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {crews.map(crew => {
            const loadPercentage = getCrewLoadPercentage(crew);
            const isOverloaded = loadPercentage > 100;
            const crewAssignments = assignments.filter(a => a.crew_id === crew.id);

            return (
              <div
                key={crew.id}
                onDragOver={(e) => handleDragOver(e, crew.id)}
                onDrop={(e) => handleDrop(e, crew.id)}
                className={`border-2 border-dashed rounded-lg p-3 transition-all ${isOverloaded
                  ? 'border-red-400 bg-red-50'
                  : loadPercentage > 75
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-sm text-gray-900">{crew.code}</span>
                  </div>
                  <span className={`text-xs font-medium ${isOverloaded ? 'text-red-600' : 'text-gray-600'
                    }`}>
                    {crew.current_capacity}/{crew.max_capacity}h
                  </span>
                </div>

                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-300 ${isOverloaded
                      ? 'bg-red-500'
                      : loadPercentage > 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      }`}
                    style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                  />
                  {isOverloaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">SOBRECARGA</span>
                    </div>
                  )}
                </div>

                {crewAssignments.length > 0 && (
                  <div className="space-y-1">
                    {crewAssignments.map((assignment, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-white border border-gray-200 rounded px-2 py-1"
                      >
                        <p className="font-medium text-gray-900 truncate">
                          {assignment.order.code}
                        </p>
                        <p className="text-gray-500 truncate">{assignment.order.district}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {crews.length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No hay cuadrillas disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
