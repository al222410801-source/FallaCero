import {graphqlRequest} from '@/api/pandoraApi';
import {type ServidorPublico} from '../interfaces/servidorPublico.interface';

const SERVIDOR_FIELDS = `
  id_servidor
  nombre
  apellido_p
  apellido_m
  email_personal
  cargo
  telefono
  dependencia
  fecha_ingreso
  activo
`;


export const getServidoresPaginated = (page = 1, limit = 10, q?: string) => {
  // Avoid sending `q` when backend does not accept it (causes 400 Unknown argument).
  if (q && q.length > 0) {
    return graphqlRequest<{servidoresPublicosP: ServidorPublico[]}>(
      `query GetServidoresP($page: Int, $limit: Int, $q: String) { servidoresPublicosP(page: $page, limit: $limit, q: $q) { ${SERVIDOR_FIELDS} } }`,
      {page: Number(page), limit: Number(limit), q}
    ).then((d) => d.servidoresPublicosP);
  }

  return graphqlRequest<{servidoresPublicosP: ServidorPublico[]}>(
    `query GetServidoresP($page: Int, $limit: Int) { servidoresPublicosP(page: $page, limit: $limit) { ${SERVIDOR_FIELDS} } }`,
    {page: Number(page), limit: Number(limit)}
  ).then((d) => d.servidoresPublicosP);
};

export const getServidor = (id: number) =>
  graphqlRequest<{servidorPublico: ServidorPublico}>(
    `query GetServidor($id: Int!) { servidorPublico(id: $id) { ${SERVIDOR_FIELDS} } }`,
    {id: Number(id)}
  ).then((d) => d.servidorPublico);

export const createServidor = (input: any) =>
  graphqlRequest<{createServidorPublico: ServidorPublico}>(
    `mutation CreateServidor($input: CreateServidorPublicoInput!) { createServidorPublico(input: $input) { ${SERVIDOR_FIELDS} } }`,
    {input}
  ).then((d) => d.createServidorPublico);

export const updateServidor = (id: number, input: any) =>
  graphqlRequest<{updateServidorPublico: ServidorPublico}>(
    `mutation UpdateServidor($id: Int!, $input: UpdateServidorPublicoInput!) { updateServidorPublico(id: $id, input: $input) { ${SERVIDOR_FIELDS} } }`,
    {id: Number(id), input: {...input, id_servidor: Number(id)}}
  ).then((d) => d.updateServidorPublico);

export const deleteServidor = (id: number) =>
  graphqlRequest<{removeServidorPublico: boolean}>(
    `mutation DeleteServidor($id: Int!) { removeServidorPublico(id: $id) }`,
    {id: Number(id)}
  ).then((d) => d.removeServidorPublico);
