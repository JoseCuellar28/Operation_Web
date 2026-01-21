import { Users, Truck, AlertCircle, X } from 'lucide-react';
import { Employee, Vehicle, Zone, WorkProfile, MaterialKit, DocumentKit } from '../connections/supabase';

interface CrewCardProps {
  crewCode: string;
  leader: Employee | null;
  assistant: Employee | null;
  vehicle: Vehicle | null;
  selectedZone: string;
  selectedWorkProfile: string;
  selectedMaterialKit: string;
  selectedDocumentKit: string;
  zones: Zone[];
  workProfiles: WorkProfile[];
  materialKits: MaterialKit[];
  documentKits: DocumentKit[];
  onLeaderDrop: (e: React.DragEvent) => void;
  onAssistantDrop: (e: React.DragEvent) => void;
  onVehicleDrop: (e: React.DragEvent) => void;
  onZoneChange: (zoneId: string) => void;
  onWorkProfileChange: (profileId: string) => void;
  onMaterialKitChange: (kitId: string) => void;
  onDocumentKitChange: (kitId: string) => void;
  onRemove: () => void;
  hasConflict?: boolean;
  missingLeader?: { id: string; name: string };
  missingAssistant?: { id: string; name: string };
}

export default function CrewCard({
  crewCode,
  leader,
  assistant,
  vehicle,
  selectedZone,
  selectedWorkProfile,
  selectedMaterialKit,
  selectedDocumentKit,
  zones,
  workProfiles,
  materialKits,
  documentKits,
  onLeaderDrop,
  onAssistantDrop,
  onVehicleDrop,
  onZoneChange,
  onWorkProfileChange,
  onMaterialKitChange,
  onDocumentKitChange,
  onRemove,
  hasConflict,
  missingLeader,
  missingAssistant
}: CrewCardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isValid = leader && vehicle && selectedZone && selectedWorkProfile && selectedMaterialKit && selectedDocumentKit;

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 transition-all ${hasConflict ? 'border-red-500 border-4' : !leader ? 'border-red-300' : 'border-gray-200'} hover:shadow-lg`}>
      <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${hasConflict ? 'bg-gradient-to-r from-red-50 to-white' : 'bg-gradient-to-r from-blue-50 to-white'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasConflict ? 'bg-red-600' : 'bg-blue-600'}`}>
            {hasConflict ? <AlertCircle className="text-white" size={20} /> : <Users className="text-white" size={20} />}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{crewCode}</h3>
            <p className={`text-xs ${hasConflict ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              {hasConflict ? 'CONFLICTO - Asignar reemplazo' : 'Cuadrilla de Campo'}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar cuadrilla"
        >
          <X size={18} className="text-red-500" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Zona de Operación *</label>
          <select
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar zona...</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Capital Humano
            {!leader && (
              <span className="ml-2 text-red-500 text-xs flex items-center gap-1 inline-flex">
                <AlertCircle size={12} />
                Líder requerido
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onDrop={onLeaderDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-lg p-4 min-h-[100px] flex flex-col items-center justify-center transition-colors ${leader ? 'border-green-300 bg-green-50' : missingLeader ? 'border-red-500 bg-red-100 hover:border-red-600' : 'border-red-300 bg-red-50 hover:border-red-400'
                }`}
            >
              {leader ? (
                <>
                  <img
                    src={leader.photo_url || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={leader.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-500 mb-2"
                  />
                  <p className="text-xs font-semibold text-gray-900 text-center">{leader.name}</p>
                  <p className="text-xs text-gray-600">LÍDER</p>
                </>
              ) : missingLeader ? (
                <>
                  <Users size={24} className="text-red-600 mb-2" />
                  <p className="text-xs text-red-700 font-bold text-center">{missingLeader.name}</p>
                  <p className="text-xs text-red-600 font-semibold">(AUSENTE)</p>
                  <p className="text-xs text-red-500 mt-1">Arrastrar reemplazo</p>
                </>
              ) : (
                <>
                  <Users size={24} className="text-red-400 mb-2" />
                  <p className="text-xs text-red-600 font-medium">Arrastrar Líder</p>
                  <p className="text-xs text-red-500">Obligatorio</p>
                </>
              )}
            </div>

            <div
              onDrop={onAssistantDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-lg p-4 min-h-[100px] flex flex-col items-center justify-center transition-colors ${assistant ? 'border-green-300 bg-green-50' : missingAssistant ? 'border-red-500 bg-red-100 hover:border-red-600' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
            >
              {assistant ? (
                <>
                  <img
                    src={assistant.photo_url || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={assistant.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-500 mb-2"
                  />
                  <p className="text-xs font-semibold text-gray-900 text-center">{assistant.name}</p>
                  <p className="text-xs text-gray-600">AUXILIAR</p>
                </>
              ) : missingAssistant ? (
                <>
                  <Users size={24} className="text-red-600 mb-2" />
                  <p className="text-xs text-red-700 font-bold text-center">{missingAssistant.name}</p>
                  <p className="text-xs text-red-600 font-semibold">(AUSENTE)</p>
                  <p className="text-xs text-red-500 mt-1">Arrastrar reemplazo</p>
                </>
              ) : (
                <>
                  <Users size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-600 font-medium">Arrastrar Auxiliar</p>
                  <p className="text-xs text-gray-500">Opcional</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Activo Móvil *</label>
          <div
            onDrop={onVehicleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-4 min-h-[80px] flex items-center justify-center transition-colors ${vehicle ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50 hover:border-blue-400'
              }`}
          >
            {vehicle ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{vehicle.plate}</p>
                  <p className="text-xs text-gray-600">{vehicle.model}</p>
                </div>
              </div>
            ) : (
              <>
                <Truck size={24} className="text-blue-400 mr-2" />
                <p className="text-xs text-blue-600 font-medium">Arrastrar Vehículo</p>
              </>
            )}
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase">Configuración de Misión</h4>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Perfil de Trabajo *</label>
            <select
              value={selectedWorkProfile}
              onChange={(e) => onWorkProfileChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar perfil...</option>
              {workProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kit Materiales *</label>
            <select
              value={selectedMaterialKit}
              onChange={(e) => onMaterialKitChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar kit...</option>
              {materialKits.map(kit => (
                <option key={kit.id} value={kit.id}>
                  {kit.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kit Documental *</label>
            <select
              value={selectedDocumentKit}
              onChange={(e) => onDocumentKitChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar kit...</option>
              {documentKits.map(kit => (
                <option key={kit.id} value={kit.id}>
                  {kit.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
          <AlertCircle size={14} />
          {isValid ? 'Cuadrilla lista para publicar' : 'Complete los campos requeridos'}
        </div>
      </div>
    </div>
  );
}
