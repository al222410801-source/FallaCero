export interface ServidorPublico {
  id_servidor: number;
  nombre: string;
  apellido_p: string;
  apellido_m?: string;
  email_personal?: string;
  cargo?: string;
  telefono?: string;
  dependencia?: string;
  fecha_ingreso?: string;
  activo?: boolean;
}

export type CreateServidorPublicoInput = {
  nombre: string;
  apellido_p: string;
  apellido_m?: string;
  email_personal?: string;
  cargo?: string;
  telefono?: string;
  fecha_ingreso?: string;
  activo?: boolean;
};

export type UpdateServidorPublicoInput = CreateServidorPublicoInput & { id_servidor: number };
