// backup of src/graphql/detEvidencia.ts
import {graphqlRequest} from '@/api/pandoraApi';

const DET_EVIDENCIA_FIELDS = `
  id_det_evidencia
  denuncia_id
  evidencia_id
  descripcion
`;

export const getDetEvidencias = (page = 1, limit = 10) =>
  graphqlRequest<{detEvidenciasP: any[]}>(
    `query GetDetEvidencias($page: Int, $limit: Int) { detEvidenciasP(page: $page, limit: $limit) { ${DET_EVIDENCIA_FIELDS} } }`,
    {page: Number(page), limit: Number(limit)}
  ).then((d) => d.detEvidenciasP);

export const getDetEvidencia = (id: number) =>
  graphqlRequest<{detEvidencia: any}>(
    `query GetDetEvidencia($id: Int!) { detEvidencia(id: $id) { ${DET_EVIDENCIA_FIELDS} } }`,
    {id: Number(id)}
  ).then((d) => d.detEvidencia);

export const createDetEvidencia = (input: any) => {
  // Backend CreateDetEvidenciaInput only accepts denuncia_id and evidencia_id
  const payload = { denuncia_id: Number(input.denuncia_id), evidencia_id: Number(input.evidencia_id) };
  return graphqlRequest<{createDetEvidencia: any}>(
    `mutation CreateDetEvidencia($input: CreateDetEvidenciaInput!) { createDetEvidencia(input: $input) { ${DET_EVIDENCIA_FIELDS} } }`,
    {input: payload}
  ).then((d) => d.createDetEvidencia);
};

export const updateDetEvidencia = (id: number, input: any) => {
  // Update input accepts denuncia_id and evidencia_id (and id_det_evidencia)
  const payload: any = { id_det_evidencia: Number(id) };
  if (input.denuncia_id !== undefined) payload.denuncia_id = Number(input.denuncia_id);
  if (input.evidencia_id !== undefined) payload.evidencia_id = Number(input.evidencia_id);
  return graphqlRequest<{updateDetEvidencia: any}>(
    `mutation UpdateDetEvidencia($id: Int!, $input: UpdateDetEvidenciaInput!) { updateDetEvidencia(id: $id, input: $input) { ${DET_EVIDENCIA_FIELDS} } }`,
    {id: Number(id), input: payload}
  ).then((d) => d.updateDetEvidencia);
};

export const deleteDetEvidencia = (id: number) =>
  graphqlRequest<{removeDetEvidencia: boolean}>(
    `mutation DeleteDetEvidencia($id: Int!) { removeDetEvidencia(id: $id) }`,
    {id: Number(id)}
  ).then((d) => d.removeDetEvidencia);
