export interface Denuncia {
  id_denuncia: number;
  ciudadano_id: number;
  titulo: string;
  fecha_denuncia?: string;
  categoria: string;
  prioridad: string;
}

export type CreateDenunciaInput = {
  ciudadano_id: number;
  titulo: string;
  fecha_denuncia: string;
  categoria: string;
  prioridad: string;
};

export type UpdateDenunciaInput = Partial<CreateDenunciaInput> & { id_denuncia: number };
