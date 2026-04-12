import {graphqlRequest} from '@/api/pandoraApi';

const EVIDENCIA_FIELDS = `
  id_evidencia
  imagen
  observaciones
`;

export const getEvidencias = (page = 1, limit = 10) =>
  graphqlRequest<{evidenciasP: any[]}>(
    `query GetEvidencias($page: Int, $limit: Int) { evidenciasP(page: $page, limit: $limit) { ${EVIDENCIA_FIELDS} } }`,
    {page: Number(page), limit: Number(limit)}
  ).then((d) => d.evidenciasP);

export const getEvidencia = (id: number) =>
  graphqlRequest<{evidencia: any}>(
    `query GetEvidencia($id: Int!) { evidencia(id: $id) { ${EVIDENCIA_FIELDS} } }`,
    {id: Number(id)}
  ).then((d) => d.evidencia);

export const createEvidencia = (input: any) =>
  graphqlRequest<{createEvidencia: any}>(
    `mutation CreateEvidencia($input: CreateEvidenciaInput!) { createEvidencia(input: $input) { ${EVIDENCIA_FIELDS} } }`,
    {input}
  ).then((d) => d.createEvidencia);

export const updateEvidencia = (id: number, input: any) =>
  graphqlRequest<{updateEvidencia: any}>(
    `mutation UpdateEvidencia($id: Int!, $input: UpdateEvidenciaInput!) { updateEvidencia(id: $id, input: $input) { ${EVIDENCIA_FIELDS} } }`,
    {id: Number(id), input: {...input, id_evidencia: Number(id)}}
  ).then((d) => d.updateEvidencia);

export const deleteEvidencia = (id: number) =>
  graphqlRequest<{removeEvidencia: boolean}>(
    `mutation DeleteEvidencia($id: Int!) { removeEvidencia(id: $id) }`,
    {id: Number(id)}
  ).then((d) => d.removeEvidencia);
