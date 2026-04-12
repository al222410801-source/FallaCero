// ============================================
// RUTA: src/graphql/alumno.ts  — CORREGIDO
//
// BUGS CORREGIDOS:
//  1. updateAlumno: el parámetro input ahora es UpdateAlumnoInput (incluye id_alumno obligatorio).
//     El web construye: {...form, id_alumno: alumnoId} y lo manda como UpdateAlumnoInput.
//     La función graphql YA NO inyecta id_alumno extra —el id llega dentro del input.
//  2. Se quitó el spread redundante {id, input: {...input, id_alumno: id}} que causaba
//     conflicto cuando id_alumno ya venía en input con valor distinto.
// ============================================

import {graphqlRequest} from '@/api/pandoraApi';
import {type Ciudadano, type CreateCiudadanoInput, type UpdateCiudadanoInput} from '@/interfaces/ciudadano.interface';

const CIUDADANO_FIELDS = `
  id_ciudadano
  nombre
  apellido_p
  apellido_m
  correo
  telefono
  fecha_registro
`;

export const getCiudadanos = () =>
  graphqlRequest<{ciudadanos: Ciudadano[]}>(
    `query GetCiudadanos { ciudadanos { ${CIUDADANO_FIELDS} } }`,
    {}
  ).then((d) => d.ciudadanos);

export const getCiudadanosPaginated = (page = 1, limit = 10, q?: string) => {
  // The backend may not accept a `q` argument on `ciudadanosP` (400 Unknown argument).
  // Only include the `q` variable in the GraphQL operation when a non-empty value is provided.
  if (q && q.length > 0) {
    return graphqlRequest<{ciudadanosP: Ciudadano[]}>(
      `query GetCiudadanosP($page: Int, $limit: Int, $q: String) { ciudadanosP(page: $page, limit: $limit, q: $q) { ${CIUDADANO_FIELDS} } }`,
      {page: Number(page), limit: Number(limit), q}
    ).then((d) => d.ciudadanosP);
  }

  return graphqlRequest<{ciudadanosP: Ciudadano[]}>(
    `query GetCiudadanosP($page: Int, $limit: Int) { ciudadanosP(page: $page, limit: $limit) { ${CIUDADANO_FIELDS} } }`,
    {page: Number(page), limit: Number(limit)}
  ).then((d) => d.ciudadanosP);
};

export const getCiudadano = (id: number) =>
  graphqlRequest<{ciudadano: Ciudadano}>(
    `query GetCiudadano($id: Int!) { ciudadano(id: $id) { ${CIUDADANO_FIELDS} } }`,
    {id: Number(id)}
  ).then((d) => d.ciudadano);

export const createCiudadano = (input: CreateCiudadanoInput) =>
  graphqlRequest<{createCiudadano: Ciudadano}>(
    `mutation CreateCiudadano($input: CreateCiudadanoInput!) { createCiudadano(input: $input) { ${CIUDADANO_FIELDS} } }`,
    {input}
  ).then((d) => d.createCiudadano);

export const updateCiudadano = (id: number, input: UpdateCiudadanoInput) =>
  // The web sends `id_ciudadano` inside `input`; do not inject it here to avoid conflicts.
  graphqlRequest<{updateCiudadano: Ciudadano}>(
    `mutation UpdateCiudadano($id: Int!, $input: UpdateCiudadanoInput!) { updateCiudadano(id: $id, input: $input) { ${CIUDADANO_FIELDS} } }`,
    {id: Number(id), input}
  ).then((d) => d.updateCiudadano);

export const deleteCiudadano = (id: number) =>
  graphqlRequest<{removeCiudadano: boolean}>(
    `mutation DeleteCiudadano($id: Int!) { removeCiudadano(id: $id) }`,
    {id: Number(id)}
  ).then((d) => d.removeCiudadano);
