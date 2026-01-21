import { useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import AttendanceView from '../pages/AttendanceView';
import PlanningView from '../pages/PlanningView';
import JobImportView from '../pages/JobImportView';
import InboxView from '../pages/InboxView';
import MasterBoardView from '../pages/MasterBoardView';
import DispatchMapView from '../pages/DispatchMapView';
import GestionMaterialesView from '../pages/configuration/GestionMaterialesView';
import GestionFlotaView from '../pages/configuration/GestionFlotaView';
import ArmadoKitsView from '../pages/configuration/ArmadoKitsView';
import GestionFormatosView from '../pages/configuration/GestionFormatosView';
import ExecutionMonitorView from '../pages/ExecutionMonitorView';
import OrderDetailView from '../pages/OrderDetailView';
import QualityInboxView from '../pages/QualityInboxView';
import QualityAuditView from '../pages/QualityAuditView';
import LiquidationDashboardView from '../pages/LiquidationDashboardView';
import FleetMonitorView from '../pages/FleetMonitorView';
import GPSLiveView from '../pages/GPSLiveView';
import FleetAnalyticsView from '../pages/FleetAnalyticsView';
import HSEMonitorView from '../pages/HSEMonitorView';
import SafetyAuditView from '../pages/SafetyAuditView';
import GestionStockView from '../pages/logistics/GestionStockView';
import GestionDevolucionesView from '../pages/logistics/GestionDevolucionesView';

interface MainContentProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function MainContent({ activeView, onViewChange }: MainContentProps) {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [selectedLiquidationDetailId, setSelectedLiquidationDetailId] = useState<string | null>(null);

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file.name);
      }
    };
    input.click();
  };

  const handleClearView = () => {
    setSelectedFile('');
  };

  // --- Phase 4: Execution & Monitoring Routing ---
  if (activeView === 'seguimiento-proyectos') {
    if (selectedOrderId) {
      return (
        <main className="flex-1 overflow-hidden">
          <OrderDetailView
            orderId={selectedOrderId}
            onBack={() => setSelectedOrderId(null)}
          />
        </main>
      );
    }
    return (
      <main className="flex-1 overflow-hidden">
        <ExecutionMonitorView
          onViewChange={(view, id) => {
            if (view === 'detalle-auditoria' && id) {
              setSelectedOrderId(id);
            }
          }}
        />
      </main>
    );
  }

  // --- Phase 5: Quality Control Routing ---
  if (activeView === 'reportes-registros') {
    if (selectedAuditId) {
      return (
        <main className="flex-1 overflow-hidden">
          <QualityAuditView
            orderId={selectedAuditId}
            onBack={() => setSelectedAuditId(null)}
            onAuditComplete={() => setSelectedAuditId(null)}
          />
        </main>
      );
    }
    return (
      <main className="flex-1 overflow-hidden">
        <QualityInboxView
          onViewChange={(view, id) => {
            if (view === 'auditoria-detalle' && id) {
              setSelectedAuditId(id);
            }
          }}
        />
      </main>
    );
  }

  // --- Phase 6: Liquidation & Billing Routing ---
  if (activeView === 'liquidacion-lotes') {
    if (selectedLiquidationDetailId) {
      return (
        <main className="flex-1 overflow-hidden">
          <OrderDetailView
            orderId={selectedLiquidationDetailId}
            onBack={() => setSelectedLiquidationDetailId(null)}
          />
        </main>
      );
    }
    return (
      <main className="flex-1 overflow-hidden">
        <LiquidationDashboardView
          onViewChange={(view, id) => setSelectedLiquidationDetailId(id)}
        />
      </main>
    );
  }

  if (activeView === 'asistencia') {
    return (
      <main className="flex-1 p-6 overflow-auto">
        <AttendanceView />
      </main>
    );
  }

  if (activeView === 'planificacion') {
    return (
      <main className="flex-1 overflow-hidden">
        <PlanningView />
      </main>
    );
  }

  if (activeView === 'importacion-trabajos') {
    return (
      <main className="flex-1 overflow-hidden">
        <JobImportView />
      </main>
    );
  }

  if (activeView === 'bandeja-entrada') {
    return (
      <main className="flex-1 overflow-hidden">
        <InboxView onViewChange={onViewChange} />
      </main>
    );
  }

  if (activeView === 'tablero-maestro') {
    return (
      <main className="flex-1 overflow-hidden">
        <MasterBoardView />
      </main>
    );
  }

  if (activeView === 'mapa-despacho') {
    return (
      <main className="flex-1 overflow-hidden">
        <DispatchMapView />
      </main>
    );
  }

  // --- Configuration Routes ---
  if (activeView === 'crea-materiales') {
    return (
      <main className="flex-1 overflow-auto bg-gray-50">
        <GestionMaterialesView />
      </main>
    );
  }

  if (activeView === 'crea-vehiculos') {
    return (
      <main className="flex-1 overflow-auto bg-gray-50">
        <GestionFlotaView />
      </main>
    );
  }

  if (activeView === 'crea-perfiles') {
    return (
      <main className="flex-1 overflow-auto bg-gray-50">
        <ArmadoKitsView />
      </main>
    );
  }

  // ... (in MainContent)

  if (activeView === 'gestion-formatos') {
    return (
      <main className="flex-1 overflow-auto bg-gray-50">
        <GestionFormatosView />
      </main>
    );
  }

  if (activeView === 'control-vehicular') {
    return (
      <main className="flex-1 overflow-hidden">
        <FleetMonitorView />
      </main>
    );
  }

  if (activeView === 'rastreo-satelital') {
    return (
      <main className="flex-1 overflow-hidden">
        <GPSLiveView />
      </main>
    );
  }

  if (activeView === 'analitica-conductores') {
    return (
      <main className="flex-1 overflow-hidden">
        <FleetAnalyticsView />
      </main>
    );
  }

  // --- HSE Views ---
  if (activeView === 'hse-monitor') {
    return <main className="flex-1 overflow-hidden"><HSEMonitorView /></main>;
  }
  if (activeView === 'safety-audit') {
    return <main className="flex-1 overflow-auto"><SafetyAuditView /></main>; // Simulate mobile scroll
  }

  // --- Phase 13: Logistics ---
  if (activeView === 'gestion-stock') {
    return (
      <main className="flex-1 overflow-hidden">
        <GestionStockView />
      </main>
    );
  }

  if (activeView === 'gestion-devoluciones') {
    return (
      <main className="flex-1 overflow-hidden">
        <GestionDevolucionesView />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleFileSelect}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            <Upload size={18} />
            Seleccionar Archivo
          </button>
          <button
            onClick={handleClearView}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            <FileSpreadsheet size={18} />
            Limpiar Vista
          </button>
        </div>

        {selectedFile ? (
          <div className="text-sm text-gray-600 italic">
            {selectedFile}
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic mb-8">
            Ningún archivo seleccionado
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            Cargue un archivo Excel para visualizar los datos
          </p>
        </div>
      </div>
    </main>
  );
}
