import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Shield,
  Briefcase,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  FolderKanban,
  UserCheck,
  Car,
  FileText,
  CalendarClock,
  Inbox,
  Layers,
  MapIcon,
  MapPin,
  Settings,
  UserPlus,
  Truck,
  Wrench,
  Contact,
  Sliders,
  Navigation,
  Activity,
  ShieldAlert,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  hasSubmenu?: boolean;
  submenu?: { id: string; label: string; icon: any; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    hasSubmenu: false,
  },
  {
    id: 'seguridad',
    label: 'Seguridad (HSE)',
    icon: Shield,
    path: '/seguridad',
    hasSubmenu: true,
  },
  {
    id: 'operaciones',
    label: 'Operaciones Diarias',
    icon: Briefcase,
    hasSubmenu: true,
    submenu: [
      // { id: 'gestion-personal', label: 'Gestión de Personal', icon: UserCheck, path: '/operaciones/personal' },
      // { id: 'gestion-proyectos', label: 'Gestión de Proyectos', icon: FolderKanban, path: '/operaciones/proyectos' },
      { id: 'planificacion', label: 'Gestión de Cuadrillas', icon: CalendarClock, path: '/operaciones/cuadrillas' },
      { id: 'bandeja-entrada', label: 'Bandeja de Entrada', icon: Inbox, path: '/operaciones/inbox' },
      { id: 'tablero-maestro', label: 'Tablero Maestro de OT', icon: Layers, path: '/operaciones/ot-master' },
      { id: 'mapa-despacho', label: 'Gestión Operativa', icon: MapIcon, path: '/operaciones/mapa' },
      { id: 'gestion-stock', label: 'Gestión de Stock', icon: Package, path: '/operaciones/stock' },
    ],
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento',
    icon: TrendingUp,
    hasSubmenu: true,
    submenu: [
      { id: 'seguimiento-proyectos', label: 'Seguimiento de Proyectos', icon: FolderKanban, path: '/seguimiento/proyectos' },
      { id: 'asistencia', label: 'Asistencia', icon: UserCheck, path: '/seguimiento/asistencia' },
      { id: 'control-vehicular', label: 'Control Vehicular', icon: Car, path: '/seguimiento/vehicular' },
      { id: 'rastreo-satelital', label: 'Rastreo Satelital', icon: Navigation, path: '/seguimiento/rastreo' },
      { id: 'analitica-conductores', label: 'Analítica de Conductores', icon: Activity, path: '/seguimiento/conductores' },
      { id: 'reportes-registros', label: 'Reportes / Registros', icon: FileText, path: '/seguimiento/reportes' },
      { id: 'liquidacion-lotes', label: 'Liquidación de Lotes', icon: Briefcase, path: '/seguimiento/lotes' },
      { id: 'hse-monitor', label: 'Supervisión en Campo', icon: ShieldAlert, path: '/seguimiento/hse' },
      { id: 'safety-audit', label: 'App Supervisor (Sim)', icon: ShieldCheck, path: '/seguimiento/safety' },
    ],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    hasSubmenu: true,
    submenu: [
      { id: 'crea-colaboradores', label: 'Crea tus Colaboradores', icon: UserPlus, path: '/config/colaboradores' },
      { id: 'crea-proyectos', label: 'Crea tus Proyectos', icon: MapPin, path: '/config/proyectos' },
      { id: 'crea-vehiculos', label: 'Crea tus Vehículos', icon: Truck, path: '/config/vehiculos' },
      { id: 'crea-materiales', label: 'Crea tus Materiales', icon: Wrench, path: '/config/materiales' },
      { id: 'config-sistema', label: 'Configuración de Sistema', icon: Sliders, path: '/config/sistema' },
    ],
  },
];

export default function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const toggleMenu = (id: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedMenus([id]);
    } else {
      setExpandedMenus(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : 'flex'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            OGN
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">OperationSmart</div>
            <div className="text-xs text-gray-500">Gestión Integral</div>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            {!item.hasSubmenu && item.path ? (
              <NavLink
                to={item.path}
                className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'} ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={18} />
                {!isCollapsed && <span className="flex-1 text-left font-medium">{item.label}</span>}
              </NavLink>
            ) : (
              <button
                onClick={() => toggleMenu(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${expandedMenus.includes(item.id)
                  ? 'text-gray-900 bg-gray-50'
                  : 'text-gray-700 hover:bg-gray-100'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={18} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {expandedMenus.includes(item.id) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </>
                )}
              </button>
            )}


            {item.submenu && expandedMenus.includes(item.id) && !isCollapsed && (
              <div className="ml-4 mt-1 space-y-1">
                {item.submenu.map((subItem) => (
                  <NavLink
                    key={subItem.id}
                    to={subItem.path}
                    className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <subItem.icon size={16} />
                    <span>{subItem.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="User" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-gray-900 truncate" title={user?.nombre || "Usuario"}>
                {user?.nombre || "Cargando..."}
              </div>
              <div className="text-xs text-gray-500 truncate" title={user?.cargo || "Sin cargo"}>
                {user?.cargo || user?.rol || "Usuario del Sistema"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
