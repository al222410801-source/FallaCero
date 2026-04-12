import {graphqlRequest} from '@/api/pandoraApi';

const HISTORIAL_FIELDS = `
  id_historial
  fecha
  observaciones
  estado
  ciudadano_id
  denuncia_id
  servidor_publico_id
  ciudadano { id_ciudadano nombre apellido_p }
  denuncia { id_denuncia titulo }
  servidor_publico { id_servidor nombre apellido_p }
`;

export const getHistoriales = (page = 1, limit = 10) =>
  graphqlRequest<{historialesEstadosP: any[]}>(
    `query GetHistoriales($page: Int, $limit: Int) { historialesEstadosP(page: $page, limit: $limit) { ${HISTORIAL_FIELDS} } }`,
    {page: Number(page), limit: Number(limit)}
  ).then((d) => d.historialesEstadosP);

export const getHistorial = (id: number) =>
  graphqlRequest<{historialEstado: any}>(
    `query GetHistorial($id: Int!) { historialEstado(id: $id) { ${HISTORIAL_FIELDS} } }`,
    {id: Number(id)}
  ).then((d) => d.historialEstado);

export const createHistorial = (input: any) =>
  ((): Promise<any> => {
    try {
      // debug log: show outgoing variables (temporary)
      // eslint-disable-next-line no-console
      console.log('createHistorial - variables:', JSON.stringify({input}));
    } catch (e) {}
    return graphqlRequest<{createHistorialEstado: any}>(
      `mutation CreateHistorial($input: CreateHistorialEstadoInput!) { createHistorialEstado(input: $input) { ${HISTORIAL_FIELDS} } }`,
      {input}
    ).then((d) => d.createHistorialEstado);
  })();

export const updateHistorial = (id: number, input: any) =>
  graphqlRequest<{updateHistorialEstado: any}>(
    `mutation UpdateHistorial($id: Int!, $input: UpdateHistorialEstadoInput!) { updateHistorialEstado(id: $id, input: $input) { ${HISTORIAL_FIELDS} } }`,
    {id: Number(id), input: {...input, id_historial: Number(id)}}
  ).then((d) => d.updateHistorialEstado);

export const deleteHistorial = (id: number) =>
  graphqlRequest<{removeHistorialEstado: boolean}>(
    `mutation DeleteHistorial($id: Int!) { removeHistorialEstado(id: $id) }`,
    {id: Number(id)}
  ).then((d) => d.removeHistorialEstado);
