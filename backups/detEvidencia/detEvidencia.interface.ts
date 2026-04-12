export interface DetEvidencia {
  id_det_evidencia: number;
  denuncia_id: number;
  evidencia_id: number;
  descripcion?: string | null;
}

// Nota: según el schema GraphQL, CreateDetEvidenciaInput sólo acepta
// `denuncia_id` y `evidencia_id` (no acepta `descripcion`).
export type CreateDetEvidenciaInput = {
  denuncia_id: number;
  evidencia_id: number;
};