// RUTA: src/interfaces/historialEstado.interface.ts

export enum EstadoSeguimiento {
  RECIBIDO = 'RECIBIDO',
  EN_REVISION = 'EN_REVISION',
  ASIGNADO = 'ASIGNADO',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
  RECHAZADO = 'RECHAZADO',
}

export type HistorialEstado = {
  id_historial: number;
  fecha?: string;
  observaciones?: string;
  estado?: EstadoSeguimiento | string;
  ciudadano_id?: number;
  denuncia_id?: number;
  servidor_publico_id?: number;
};

export type CreateHistorialEstadoInput = {
  fecha?: string;
  observaciones?: string;
  estado?: EstadoSeguimiento | string;
  ciudadano_id?: number;
  denuncia_id?: number;
  servidor_publico_id?: number;
};

export type UpdateHistorialEstadoInput = CreateHistorialEstadoInput & {id_historial: number};
