export interface Evidencia {
  id_evidencia: number;
  imagen: string; // base64 or URL depending on backend
  observaciones: string;
}

export type CreateEvidenciaInput = Omit<Evidencia, 'id_evidencia'>;
