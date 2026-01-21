import { useEffect, useState } from 'react';
import { Plus, Send, Copy, Trash2, CheckCircle } from 'lucide-react';
import { Employee, Vehicle, Zone, WorkProfile, MaterialKit, DocumentKit } from '../../connections/supabase';
import ResourcePool from '../../components/ResourcePool';
import CrewCard from '../../components/CrewCard';

interface CrewDraft {
  id: string;
  code: string;
  leader: Employee | null;
  assistant: Employee | null;
  vehicle: Vehicle | null;
  zoneId: string;
  workProfileId: string;
  materialKitId: string;
  documentKitId: string;
  hasConflict?: boolean;
  missingLeader?: { id: string; name: string };
  missingAssistant?: { id: string; name: string };
  isPublished?: boolean; // New flag to distinguish drafts from published
}

export default function PlanningView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [workProfiles, setWorkProfiles] = useState<WorkProfile[]>([]);
  const [materialKits, setMaterialKits] = useState<MaterialKit[]>([]);
  const [documentKits, setDocumentKits] = useState<DocumentKit[]>([]);
  const [crewDrafts, setCrewDrafts] = useState<CrewDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);
  const [draggedVehicle, setDraggedVehicle] = useState<Vehicle | null>(null);
  const [crewCounter, setCrewCounter] = useState(101);

  // API Base URL
  const API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        employeesRes,
        vehiclesRes,
        zonesRes,
        profilesRes,
        kitsRes,
        formatsRes, // Renamed for clarity in logic
        todayCrewsRes
      ] = await Promise.all([
        fetch(`${API_URL}/colaboradores/asistencia-hoy`),
        fetch(`${API_URL}/vehiculos/operativos`),
        fetch(`${API_URL}/zones`),
        fetch(`${API_URL}/work-profiles`),
        fetch(`${API_URL}/kits`),      // Material Kits
        fetch(`${API_URL}/formatos`),  // Document Formats
        fetch(`${API_URL}/cuadrillas`)
      ]);

      const employeesData = await employeesRes.json();
      const vehiclesData = await vehiclesRes.json();
      const zonesData = await zonesRes.json();
      const profilesData = await profilesRes.json();
      const allKitsData = await kitsRes.json();
      const formatsData = await formatsRes.json();
      const todayCrewsData = await todayCrewsRes.json();

      // Map Material Kits (Catalogo Kits)
      const mappedMaterialKits = (allKitsData || []).map((k: any) => ({
        ...k,
        id: k.id_kit,
        name: k.nombre_kit
      }));

      // Map Document Kits (Formatos Papeleria)
      const mappedDocumentKits = (formatsData || []).map((f: any) => ({
        ...f,
        id: f.id_formato, // Formatos usually single items but used here as the selected 'kit'
        name: f.nombre
      }));

      setEmployees(employeesData || []);
      setVehicles(vehiclesData || []);
      setZones(zonesData || []);
      setWorkProfiles(profilesData || []);
      setMaterialKits(mappedMaterialKits);
      setDocumentKits(mappedDocumentKits);

      // Map today's published crews to 'Draft' structure but marked as Published
      if (todayCrewsData && todayCrewsData.length > 0) {
        const publishedCrews: CrewDraft[] = todayCrewsData.map((crew: any) => ({
          id: crew.id, // Use existing ID
          code: crew.code,
          leader: crew.leader,
          assistant: crew.assistant,
          vehicle: crew.vehicle,
          zoneId: crew.zoneId,
          workProfileId: crew.workProfileId,
          materialKitId: crew.materialKitId,
          documentKitId: crew.documentKitId,
          isPublished: true // Mark as read-only/published
        }));

        // Merge? usually we just show them. If user creates new ones, they append.
        // We set them as the initial state.
        setCrewDrafts(publishedCrews);

        // Update counter to avoid ID collision
        const codes = publishedCrews.map(c => parseInt(c.code.replace('C-', ''))).filter(n => !isNaN(n));
        const maxCode = Math.max(...codes, 100);
        setCrewCounter(maxCode + 1);
      }

    } catch (error) {
      console.error('Error loading planning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewCrew = () => {
    const newCrew: CrewDraft = {
      id: crypto.randomUUID(),
      code: `C-${crewCounter}`,
      leader: null,
      assistant: null,
      vehicle: null,
      zoneId: '',
      workProfileId: '',
      materialKitId: '',
      documentKitId: ''
    };
    setCrewDrafts([...crewDrafts, newCrew]);
    setCrewCounter(crewCounter + 1);
  };

  const removeCrew = (crewId: string) => {
    setCrewDrafts(crewDrafts.filter(c => c.id !== crewId));
  };

  const updateCrew = (crewId: string, updates: Partial<CrewDraft>) => {
    // Prevent editing published crews?
    const crew = crewDrafts.find(c => c.id === crewId);
    if (crew?.isPublished) return;

    setCrewDrafts(crewDrafts.map(crew =>
      crew.id === crewId ? { ...crew, ...updates } : crew
    ));
  };

  const getAssignedEmployeeIds = () => {
    const ids = new Set<string>();
    crewDrafts.forEach(crew => {
      if (crew.leader) ids.add(crew.leader.id);
      if (crew.assistant) ids.add(crew.assistant.id);
    });
    return ids;
  };

  const getAssignedVehicleIds = () => {
    const ids = new Set<string>();
    crewDrafts.forEach(crew => {
      if (crew.vehicle) ids.add(crew.vehicle.id);
    });
    return ids;
  };

  const isEmployeeAssigned = (employeeId: string) => {
    return getAssignedEmployeeIds().has(employeeId);
  };

  const isVehicleAssigned = (vehicleId: string) => {
    return getAssignedVehicleIds().has(vehicleId);
  };

  const handleLeaderDrop = (crewId: string, e: React.DragEvent) => {
    e.preventDefault();
    const crew = crewDrafts.find(c => c.id === crewId);
    if (crew?.isPublished) return; // Prevent drop on published

    if (draggedEmployee) {
      if (isEmployeeAssigned(draggedEmployee.id)) {
        alert('Este empleado ya está asignado a otra cuadrilla');
        setDraggedEmployee(null);
        return;
      }

      const needsConflictCheck = crew?.hasConflict && !crew.assistant;
      updateCrew(crewId, {
        leader: draggedEmployee,
        missingLeader: undefined,
        hasConflict: needsConflictCheck
      });
      setDraggedEmployee(null);
    }
  };

  const handleAssistantDrop = (crewId: string, e: React.DragEvent) => {
    e.preventDefault();
    const crew = crewDrafts.find(c => c.id === crewId);
    if (crew?.isPublished) return;

    if (draggedEmployee) {
      if (isEmployeeAssigned(draggedEmployee.id)) {
        alert('Este empleado ya está asignado a otra cuadrilla');
        setDraggedEmployee(null);
        return;
      }
      const needsConflictCheck = crew?.hasConflict && !crew.leader;
      updateCrew(crewId, {
        assistant: draggedEmployee,
        missingAssistant: undefined,
        hasConflict: needsConflictCheck
      });
      setDraggedEmployee(null);
    }
  };

  const clearAllDrafts = () => {
    // Only clear drafts, keep published?
    // User said "Maintain view". 
    // Maybe verify if user wants to clear EVERYTHING including published view? 
    // Usually "Clear Drafts" implies clearing work in progress.
    // Let's filter out only !isPublished

    if (confirm('¿Estás seguro de que deseas eliminar los borradores? Las cuadrillas publicadas se mantendrán.')) {
      setCrewDrafts(crewDrafts.filter(c => c.isPublished));
    }
  };

  const replicateYesterday = async () => {
    try {
      setLoading(true);
      // Calculate Yesterday Date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Fetch yesterday's crews
      const res = await fetch(`${API_URL}/cuadrillas?date=${yesterdayStr}`);
      const yesterdayCrews = await res.json();

      if (!yesterdayCrews || yesterdayCrews.length === 0) {
        alert('No hay cuadrillas del día anterior para replicar');
        return;
      }

      // Filter out already published IDs if replication aims to avoid dupes? 
      // No, replication creates NEW drafts based on yesterday.
      // We need to check if these resources are available TODAY in `employees` list.
      const presentEmployeeIds = new Set(employees.map(e => e.id));

      const newDrafts: CrewDraft[] = yesterdayCrews.map((crew: any, index: number) => {
        const leader = crew.leader;
        const assistant = crew.assistant;

        const leaderAbsent = leader ? !presentEmployeeIds.has(leader.id) : false;
        const assistantAbsent = assistant ? !presentEmployeeIds.has(assistant.id) : false;
        const hasConflict = leaderAbsent || assistantAbsent;

        return {
          id: crypto.randomUUID(), // New ID for the draft
          code: `C-${crewCounter + index}`,
          leader: leaderAbsent ? null : leader, // Keep null if absent, or keep data but flagged?
          // Logic: Keep null so they drag replacement, OR keep ghost data?
          // `CrewCard` supports `missingLeader` prop. 
          assistant: assistantAbsent ? null : assistant,
          vehicle: crew.vehicle,
          zoneId: crew.zoneId,
          workProfileId: crew.workProfileId,
          materialKitId: crew.materialKitId,
          documentKitId: crew.documentKitId,
          hasConflict,
          missingLeader: leaderAbsent ? { id: leader.id, name: leader.name } : undefined,
          missingAssistant: assistantAbsent ? { id: assistant.id, name: assistant.name } : undefined,
        };
      });

      // Append to current drafts (keeping published ones)
      setCrewDrafts(prev => [...prev, ...newDrafts]);
      setCrewCounter(prev => prev + newDrafts.length);

      const conflictCount = newDrafts.filter(c => c.hasConflict).length;
      if (conflictCount > 0) {
        alert(`Se replicaron ${yesterdayCrews.length} cuadrillas. ${conflictCount} tienen conflictos por ausencias.`);
      } else {
        alert(`Se replicaron ${yesterdayCrews.length} cuadrillas exitosamente.`);
      }

    } catch (error) {
      console.error('Error replicating yesterday:', error);
      alert('Error al replicar cuadrillas');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleDrop = (crewId: string, e: React.DragEvent) => {
    e.preventDefault();
    const crew = crewDrafts.find(c => c.id === crewId);
    if (crew?.isPublished) return;

    if (draggedVehicle) {
      if (isVehicleAssigned(draggedVehicle.id)) {
        alert('Este vehículo ya está asignado a otra cuadrilla');
        setDraggedVehicle(null);
        return;
      }
      updateCrew(crewId, { vehicle: draggedVehicle });
      setDraggedVehicle(null);
    }
  };

  const publishAllCrews = async () => {
    // Only publish DRAFTS
    const draftsToPublish = crewDrafts.filter(c => !c.isPublished);

    const validCrews = draftsToPublish.filter(crew =>
      crew.leader &&
      crew.vehicle &&
      crew.zoneId &&
      crew.workProfileId &&
      crew.materialKitId &&
      crew.documentKitId
    );

    if (validCrews.length === 0) {
      alert('No hay borradores válidos para publicar.');
      return;
    }

    if (!confirm(`¿Publicar ${validCrews.length} cuadrilla(s)?`)) {
      return;
    }

    try {
      setPublishing(true);

      const crewsPayload = validCrews.map(crew => ({
        id: crew.id,
        code: crew.code,
        zone_id: crew.zoneId,
        leader_id: crew.leader!.id,
        assistant_id: crew.assistant?.id || null,
        vehicle_id: crew.vehicle!.id,
        work_profile_id: crew.workProfileId,
        material_kit_id: crew.materialKitId,
        document_kit_id: crew.documentKitId
      }));

      const res = await fetch(`${API_URL}/cuadrillas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crewsPayload)
      });

      if (!res.ok) throw new Error('Failed to publish');

      alert(`${validCrews.length} cuadrilla(s) publicada(s) exitosamente`);

      // Reload data to show them as published
      await loadData();

    } catch (error) {
      console.error('Error publishing crews:', error);
      alert('Error al publicar las cuadrillas');
    } finally {
      setPublishing(false);
    }
  };

  const validCrewCount = crewDrafts.filter(crew =>
    !crew.isPublished && // Only count drafts
    crew.leader &&
    crew.vehicle &&
    crew.zoneId &&
    crew.workProfileId &&
    crew.materialKitId &&
    crew.documentKitId
  ).length;

  const draftsCount = crewDrafts.filter(c => !c.isPublished).length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando recursos (SQL Server)...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-100">
      <div className="w-80 border-r border-gray-200 bg-white">
        <ResourcePool
          employees={employees}
          vehicles={vehicles}
          assignedEmployeeIds={getAssignedEmployeeIds()}
          assignedVehicleIds={getAssignedVehicleIds()}
          onEmployeeDragStart={setDraggedEmployee}
          onVehicleDragStart={setDraggedVehicle}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">Gestión de Cuadrillas</h1>
                <div className="px-3 py-1 rounded-full bg-blue-100 border border-blue-300">
                  <span className="text-xs font-semibold text-blue-800">SQL Server Connected</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {draftsCount} Borrador(es) | {crewDrafts.length - draftsCount} Publicada(s)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={replicateYesterday}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                title="Replicar configuración de ayer"
              >
                <Copy size={20} />
                Replicar Ayer
              </button>
              <button
                onClick={clearAllDrafts}
                disabled={draftsCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                <Trash2 size={20} />
                Limpiar Borradores
              </button>
              <button
                onClick={addNewCrew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Plus size={20} />
                Nueva Cuadrilla
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {crewDrafts.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={48} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Comienza a Planificar</h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primera cuadrilla haciendo clic en "Nueva Cuadrilla" o "Replicar Ayer"
                </p>
                <button
                  onClick={addNewCrew}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Crear Primera Cuadrilla
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {crewDrafts.map(crew => (
                <div key={crew.id} className={crew.isPublished ? "opacity-75 pointer-events-none grayscale-[0.1]" : ""}>
                  {crew.isPublished && (
                    <div className="mb-1 flex items-center gap-1 text-green-600 text-xs font-bold uppercase">
                      <CheckCircle size={12} /> Publicada
                    </div>
                  )}
                  <CrewCard
                    crewCode={crew.code}
                    leader={crew.leader}
                    assistant={crew.assistant}
                    vehicle={crew.vehicle}
                    selectedZone={crew.zoneId ? String(crew.zoneId) : ''}
                    selectedWorkProfile={crew.workProfileId ? String(crew.workProfileId) : ''}
                    selectedMaterialKit={crew.materialKitId ? String(crew.materialKitId) : ''}
                    selectedDocumentKit={crew.documentKitId ? String(crew.documentKitId) : ''}
                    zones={zones}
                    workProfiles={workProfiles}
                    materialKits={materialKits}
                    documentKits={documentKits}
                    onLeaderDrop={(e) => handleLeaderDrop(crew.id, e)}
                    onAssistantDrop={(e) => handleAssistantDrop(crew.id, e)}
                    onVehicleDrop={(e) => handleVehicleDrop(crew.id, e)}
                    onZoneChange={(zoneId) => updateCrew(crew.id, { zoneId })}
                    onWorkProfileChange={(workProfileId) => updateCrew(crew.id, { workProfileId })}
                    onMaterialKitChange={(materialKitId) => updateCrew(crew.id, { materialKitId })}
                    onDocumentKitChange={(documentKitId) => updateCrew(crew.id, { documentKitId })}
                    onRemove={() => removeCrew(crew.id)}
                    hasConflict={crew.hasConflict}
                    missingLeader={crew.missingLeader}
                    missingAssistant={crew.missingAssistant}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {draftsCount > 0 && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={publishAllCrews}
              disabled={publishing || validCrewCount === 0}
              className="flex items-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <Send size={24} />
              <div className="text-left">
                <div className="text-sm">Publicar {validCrewCount} Cuadrilla(s)</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
