export interface Project {
  id: number;
  nombre: string;
  cliente?: string;
  estado: string;
  fechaInicio?: string;
  presupuesto?: number;
  division?: string;
  gerenteDni?: string;
}

export interface ProjectParams {
  nombre: string;
  cliente?: string;
  estado: string;
  presupuesto?: number;
}
