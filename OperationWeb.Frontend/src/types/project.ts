export interface Project {
  id: number;
  nombre: string;
  cliente?: string;
  estado: string;
  fechaInicio?: string;
  presupuesto?: number;
  division?: string;
  gerenteDni?: string;
  id_cuadrilla?: string;
  id_efectivo?: string;
}

export interface ProjectParams {
  nombre: string;
  cliente?: string;
  estado: string;
  presupuesto?: number;
}
