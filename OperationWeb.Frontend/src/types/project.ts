export interface Project {
  id: number;
  nombre: string;
  cliente?: string;
  estado: string;
  fechaInicio?: string;
  fechaFin?: string;
  presupuesto?: number;
  division?: string;
  gerenteDni?: string;
  // Assignment fields from legacy
  id_cuadrilla?: string;
  id_efectivo?: string;
}

export interface ProjectParams {
  nombre: string;
  cliente?: string;
  estado: string;
  presupuesto?: number;
}
