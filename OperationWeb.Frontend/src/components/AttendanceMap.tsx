import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { AttendanceRecord } from '../connections/supabase';

const createCustomIcon = (status: string) => {
  const color = status === 'presente' ? 'green' : status === 'tardanza' ? 'orange' : 'red';
  return new Icon({
    iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='12' fill='${color}' stroke='white' stroke-width='3'/%3E%3C/svg%3E`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

interface MapUpdaterProps {
  records: AttendanceRecord[];
}

function MapUpdater({ records }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (records.length > 0) {
      const validRecords = records.filter(r => r.location_lat && r.location_lng);
      if (validRecords.length > 0) {
        const bounds = new LatLngBounds(
          validRecords.map(r => [r.location_lat!, r.location_lng!])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [records, map]);

  return null;
}

interface AttendanceMapProps {
  records: AttendanceRecord[];
  isDrawerOpen?: boolean;
}

export default function AttendanceMap({ records, isDrawerOpen = false }: AttendanceMapProps) {
  const validRecords = records.filter(r => r.location_lat && r.location_lng);

  const center: [number, number] = validRecords.length > 0
    ? [validRecords[0].location_lat!, validRecords[0].location_lng!]
    : [-11.9391, -77.0628];

  return (
    <div className={`h-full w-full transition-opacity duration-300 ${isDrawerOpen ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        zoomControl={!isDrawerOpen}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater records={validRecords} />
        {validRecords.map((record) => (
          <Marker
            key={record.id}
            position={[record.location_lat!, record.location_lng!]}
            icon={createCustomIcon(record.system_status)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{record.employee?.name}</p>
                <p className="text-gray-600">
                  {new Date(record.check_in_time).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">{record.location_address}</p>
                <p className={`text-xs mt-1 font-medium ${record.system_status === 'presente' ? 'text-green-600' :
                    record.system_status === 'tardanza' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {record.system_status.toUpperCase()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
