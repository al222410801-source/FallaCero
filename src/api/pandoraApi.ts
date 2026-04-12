import axios from 'axios';

// URL base de tu servidor NestJS (se puede sobrescribir con la variable de entorno GRAPHQL_URL)
const BASE_URL = process.env.GRAPHQL_URL || 'http://localhost:3000/graphql';

// Cliente axios configurado para GraphQL
// GraphQL siempre usa POST y siempre apunta al mismo endpoint
export const pandoraApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función helper para hacer cualquier query o mutation
// query    → string con la query/mutation de GraphQL
// variables → objeto con los parámetros que necesita la query
export async function graphqlRequest<T>(
  query: string,
  variables?: object,
): Promise<T> {
  const requestBody = {query, variables};
  try {
    // debug: log outgoing request (temporary)
    try { console.debug('GraphQL request:', JSON.stringify(requestBody)); } catch (e) {}
    const response = await pandoraApi.post('', requestBody);

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data as T;

  } catch (error: any) {
    // If server returned a response with details, include them to aid debugging
    if (error.response && error.response.data) {
      const resp = error.response.data;
      const msg = resp.errors ? resp.errors.map((e: any) => e.message).join('; ') : JSON.stringify(resp);
      const body = (() => {
        try { return JSON.stringify((error.config && error.config.data) ? JSON.parse(error.config.data) : requestBody); } catch (e) { return JSON.stringify(requestBody); }
      })();
      // include request body to help find malformed queries or variables
      throw new Error(`GraphQL error (${error.response.status}): ${msg} -- request: ${body}`);
    }
    // network or unexpected error
    throw new Error(error.message || String(error));
  }
}
