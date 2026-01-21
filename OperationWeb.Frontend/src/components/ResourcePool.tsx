import { Users, Truck, Search, CheckCircle, Lock } from 'lucide-react';
import { useState } from 'react';
import { Employee, Vehicle } from '../connections/supabase';

interface ResourcePoolProps {
  employees: Employee[];
  vehicles: Vehicle[];
  assignedEmployeeIds: Set<string>;
  assignedVehicleIds: Set<string>;
  onEmployeeDragStart: (employee: Employee) => void;
  onVehicleDragStart: (vehicle: Vehicle) => void;
}

export default function ResourcePool({
  employees,
  vehicles,
  assignedEmployeeIds,
  assignedVehicleIds,
  onEmployeeDragStart,
  onVehicleDragStart
}: ResourcePoolProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'flota'>('personal');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  const availableEmployees = filteredEmployees.filter(emp => !assignedEmployeeIds.has(emp.id));

  const filteredVehicles = vehicles.filter(veh =>
    veh.plate.toLowerCase().includes(searchVehicle.toLowerCase()) ||
    veh.model.toLowerCase().includes(searchVehicle.toLowerCase())
  );

  const availableVehicles = filteredVehicles.filter(veh => !assignedVehicleIds.has(veh.id));

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Pool de Recursos</h2>
        <p className="text-xs text-gray-600">Arrastra recursos para crear cuadrillas</p>
      </div>

      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 px-4 py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'personal'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <Users size={18} />
          Personal
          <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'personal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
            {availableEmployees.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('flota')}
          className={`flex-1 px-4 py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'flota'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <Truck size={18} />
          Flota
          <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'flota' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
            }`}>
            {availableVehicles.length}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'personal' && (
          <div>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar personal..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={40} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay personal con asistencia marcada</p>
                </div>
              ) : (
                filteredEmployees.map(employee => {
                  const isAssigned = assignedEmployeeIds.has(employee.id);
                  return (
                    <div
                      key={employee.id}
                      draggable={!isAssigned}
                      onDragStart={() => !isAssigned && onEmployeeDragStart(employee)}
                      className={`bg-white border rounded-lg p-3 flex items-center gap-3 transition-all ${isAssigned
                          ? 'border-gray-300 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 cursor-move hover:shadow-md hover:border-blue-400 group'
                        }`}
                    >
                      <div className="relative">
                        <img
                          src={employee.photo_url || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={employee.name}
                          className={`w-12 h-12 rounded-full object-cover border-2 ${isAssigned ? 'border-gray-300' : 'border-gray-200 group-hover:border-blue-400'
                            }`}
                        />
                        {isAssigned ? (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Lock size={10} className="text-white" />
                          </div>
                        ) : (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${isAssigned ? 'text-gray-500' : 'text-gray-900'}`}>
                          {employee.name}
                        </p>
                        <p className="text-xs text-gray-600">{employee.role}</p>
                      </div>
                      {isAssigned ? (
                        <div className="text-xs text-gray-500">
                          Asignado
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Arrastrar
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'flota' && (
          <div>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vehículo..."
                value={searchVehicle}
                onChange={(e) => setSearchVehicle(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Truck size={40} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay vehículos operativos</p>
                </div>
              ) : (
                filteredVehicles.map(vehicle => {
                  const isAssigned = assignedVehicleIds.has(vehicle.id);
                  return (
                    <div
                      key={vehicle.id}
                      draggable={!isAssigned}
                      onDragStart={() => !isAssigned && onVehicleDragStart(vehicle)}
                      className={`bg-white border rounded-lg p-3 flex items-center gap-3 transition-all ${isAssigned
                          ? 'border-gray-300 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 cursor-move hover:shadow-md hover:border-orange-400 group'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 relative ${isAssigned ? 'bg-gray-200' : 'bg-orange-100 group-hover:bg-orange-200'
                        }`}>
                        <Truck size={20} className={isAssigned ? 'text-gray-500' : 'text-orange-600'} />
                        {isAssigned && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Lock size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${isAssigned ? 'text-gray-500' : 'text-gray-900'}`}>
                          {vehicle.plate}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{vehicle.model}</p>
                      </div>
                      {isAssigned ? (
                        <div className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                          Asignado
                        </div>
                      ) : (
                        <div className={`text-xs px-2 py-1 rounded-full ${vehicle.status === 'operativo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {vehicle.status}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
