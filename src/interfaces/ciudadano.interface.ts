export interface Ciudadano {
  id_ciudadano: number;
  nombre: string;
  apellido_p: string;
  apellido_m?: string;
  correo?: string;
  telefono?: string;
  fecha_registro?: string;
}

export type CreateCiudadanoInput = {
  nombre: string;
  apellido_p: string;
  apellido_m?: string;
  correo?: string;
  telefono?: string;
  fecha_registro?: string;
};

export type UpdateCiudadanoInput = CreateCiudadanoInput & { id_ciudadano: number };
