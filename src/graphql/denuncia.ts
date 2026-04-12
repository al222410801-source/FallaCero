import {graphqlRequest} from '@/api/pandoraApi';
import {type Denuncia, type CreateDenunciaInput, type UpdateDenunciaInput} from '@/interfaces/denuncia.interface';

const DENUNCIA_FIELDS = `
  id_denuncia
  ciudadano_id
  titulo
  fecha_denuncia
  categoria
  prioridad
`;

export const getDenuncias = () =>
  graphqlRequest<{denuncias: Denuncia[]}>(
    `query GetDenuncias { denuncias { ${DENUNCIA_FIELDS} } }`,
    {}
  ).then((d) => d.denuncias);

export const getDenunciasPaginated = (page = 1, limit = 10, q?: string) => {
  const query = `query GetDenunciasP($page: Int, $limit: Int, $q: String) { denunciasP(page: $page, limit: $limit, q: $q) { ${DENUNCIA_FIELDS} } }`;
  const variables: any = { page: Number(page), limit: Number(limit) };
  if (q && String(q).trim() !== '') variables.q = q;
  return graphqlRequest<{denunciasP: Denuncia[]}>(query, variables).then((d) => d.denunciasP);
};

export const getDenuncia = (id: number) =>
  graphqlRequest<{denuncia: Denuncia}>(
    `query GetDenuncia($id: Int!) { denuncia(id: $id) { ${DENUNCIA_FIELDS} } }`,
    {id: Number(id)}
  ).then((d) => d.denuncia);

export const createDenuncia = (input: CreateDenunciaInput) =>
  graphqlRequest<{createDenuncia: Denuncia}>(
    `mutation CreateDenuncia($input: CreateDenunciaInput!) { createDenuncia(input: $input) { ${DENUNCIA_FIELDS} } }`,
    {input}
  ).then((d) => d.createDenuncia);

export const updateDenuncia = (id: number, input: UpdateDenunciaInput) =>
  // Do not inject id into input — the web sends it as part of input when needed
  graphqlRequest<{updateDenuncia: Denuncia}>(
    `mutation UpdateDenuncia($id: Int!, $input: UpdateDenunciaInput!) { updateDenuncia(id: $id, input: $input) { ${DENUNCIA_FIELDS} } }`,
    {id: Number(id), input}
  ).then((d) => d.updateDenuncia);

export const deleteDenuncia = (id: number) =>
  graphqlRequest<{removeDenuncia: boolean}>(
    `mutation DeleteDenuncia($id: Int!) { removeDenuncia(id: $id) }`,
    {id: Number(id)}
  ).then((d) => d.removeDenuncia);

export const getDenunciasStats = () =>
  graphqlRequest<{denunciasStats: {total: number; atendidos: number; porcentaje: number}}>(
    `query DenunciasStats { denunciasStats { total atendidos porcentaje } }`,
    {}
  ).then((d) => d.denunciasStats);

export const getDenunciasPrediction = (meses = 8, factorS = 0.1) =>
  graphqlRequest<{denunciasPrediction: {mes_predicho: string; prediccion: number; alpha: number; confianza_pct: number; meses_analizados: number; series?: number[]; labels?: string[]}}>(
    `query DenunciasPrediction($meses: Int, $factorS: Float) { denunciasPrediction(meses: $meses, factorS: $factorS) { mes_predicho prediccion alpha confianza_pct meses_analizados series labels } }`,
    {meses: Number(meses), factorS: Number(factorS)}
  ).then((d) => d.denunciasPrediction);
