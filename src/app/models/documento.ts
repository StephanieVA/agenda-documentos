export interface Seguimiento {
  fecha: Date;
  detalle: string;
}

export interface Documento {
  id: number;
  numero: string;
  asunto: string;
  descripcion: string;
  estado: 'pendiente' | 'atencion' | 'finalizado';
  fechaCreacion: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  seguimientos: Seguimiento[];
}
