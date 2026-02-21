import { X, CheckCircle, XCircle, MapPin, User, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { AttendanceRecord } from '../connections/supabase';

interface ResolutionDrawerProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (recordId: string) => void;
  onReject: (recordId: string) => void;
  isProcessing: boolean;
}

const alertIcon = new Icon({
  iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='12' fill='orange' stroke='white' stroke-width='3'/%3E%3C/svg%3E`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const defaultIcon = new Icon({
  iconUrl: `https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png`,
  shadowUrl: `https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function ResolutionDrawer({
  record,
  isOpen,
  onClose,
  onAccept,
  onReject,
  isProcessing
}: ResolutionDrawerProps) {
  if (!isOpen || !record) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleDrawerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    if (record.alert_status === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse border border-orange-200">
          ALERTA GPS
        </span>
      );
    }
    switch (record.system_status) {
      case 'presente':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Presente</span>;
      case 'tardanza':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Tardanza</span>;
      case 'falta':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Falta</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{record.system_status}</span>;
    }
  };

  const isPendingAlert = record.alert_status === 'pending' || record.system_status === 'tardanza';
  const justification = record.gps_justification || record.notes || '';
  const shortJustification = justification.length > 0 && justification.length < 20;

  return (
    <div className="fixed inset-0 z-[100]" style={{ isolation: 'isolate' }}>
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      <div
        className="absolute right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden animate-slide-in-right"
        onClick={handleDrawerClick}
        style={{ zIndex: 1 }}
      >
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 flex items-center justify-between ${isPendingAlert ? 'bg-gradient-to-r from-orange-50 to-white' : 'bg-gray-50'
          }`}>
          <div className="flex items-center gap-4">
            <img
              src={record.employee?.photo_url || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200'}
              alt={record.employee?.name}
              className={`w-16 h-16 rounded-full object-cover border-2 ${isPendingAlert ? 'border-orange-300' : 'border-white shadow-sm'
                }`}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{record.employee?.name}</h2>
              <p className="text-sm text-gray-600">{record.employee?.role}</p>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(record)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-gray-200"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6 bg-white" style={{ position: 'relative', zIndex: 0 }}>

          {/* Status Details */}
          {isPendingAlert && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="text-orange-900 font-semibold mb-1 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-600" />
                Acción Requerida
              </h4>
              <p className="text-sm text-orange-800">
                La ubicación del registro difiere significativamente de la ubicación esperada. Por favor revise el mapa y la justificación.
              </p>
            </div>
          )}

          {/* Justification Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <User className="text-blue-600" size={18} />
              Detalles del Registro
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Hora de Marca</span>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Clock size={14} className="text-gray-400" />
                  {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Fecha</span>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Calendar size={14} className="text-gray-400" />
                  {new Date(record.date).toLocaleDateString('es-PE')}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 block mb-1">Justificación / Notas</span>
              <p className="text-sm text-gray-700 italic">
                "{justification || 'Sin notas adicionales'}"
              </p>
              {shortJustification && (
                <p className="text-xs text-amber-700 mt-2">
                  Advertencia: justificación menor a 20 caracteres.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <Clock className="text-purple-600" size={18} />
              Audit Trail
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block mb-1">alert_status</span>
                <span className="font-medium text-gray-900">{record.alert_status || 'N/A'}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block mb-1">resolved_at</span>
                <span className="font-medium text-gray-900">{record.resolved_at || 'N/A'}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block mb-1">resolved_by</span>
                <span className="font-medium text-gray-900">{record.resolved_by || 'N/A'}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block mb-1">resolution_notes</span>
                <span className="font-medium text-gray-900">{record.resolution_notes || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-green-600" />
                Ubicación Registrada
              </h3>
              <span className="text-xs text-gray-500 font-mono">
                {record.location_lat?.toFixed(5)}, {record.location_lng?.toFixed(5)}
              </span>
            </div>

            <div className="relative h-[300px] bg-gray-100">
              {record.location_lat && record.location_lng ? (
                <MapContainer
                  center={[record.location_lat, record.location_lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[record.location_lat, record.location_lng]}
                    icon={isPendingAlert ? alertIcon : defaultIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{record.location_address || 'Ubicación'}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MapPin size={48} className="mb-2 opacity-50" />
                  <p className="text-sm">Sin datos de ubicación</p>
                </div>
              )}
            </div>
            {record.location_address && (
              <div className="p-3 bg-white border-t border-gray-200">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <MapPin size={14} className="mt-1 flex-shrink-0" />
                  {record.location_address}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Selfie de Control</h3>
            <p className="text-xs text-gray-500">
              Evidencia visual mostrada desde `employee.photo_url` (si existe). La imagen se ve en cabecera del panel.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {isPendingAlert ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => onReject(record.id)}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Rechazar
                </button>
                <button
                  onClick={() => onAccept(record.id)}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  <CheckCircle size={18} />
                  Validar Asistencia
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Validar confirmará la asistencia. Rechazar marcará falta.
              </p>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar Detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
