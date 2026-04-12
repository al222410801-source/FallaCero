// ============================================
// RUTA: src/graphql/rol.ts
//
// ============================================

import {graphqlRequest} from '@/api/pandoraApi';
import {type Rol, type CreateRolInput, type UpdateRolInput} from '@/interfaces/rol.interface';

// The backend exposes TipoUsuario (id_tipo_usuario). We adapt to frontend `Rol` shape.
const SERVER_FIELDS = `id_tipo_usuario nombre descripcion us_ciudadano us_servidor us_administrador`;

const mapServerToRole = (s: any): Rol => ({
  id_rol: s.id_tipo_usuario,
  nombre: s.nombre,
  descripcion: s.descripcion,
});

export const getRoles = (page = 1, limit = 10) =>
  graphqlRequest<{tiposUsuariosP: any[]}>(
    `query GetTiposUsuariosP($page: Int, $limit: Int) { tiposUsuariosP(page: $page, limit: $limit) { ${SERVER_FIELDS} } }`,
    {page: Number(page), limit: Number(limit)}
  ).then((d) => (d.tiposUsuariosP || []).map(mapServerToRole));

export const getAllRoles = () =>
  graphqlRequest<{tiposUsuarios: any[]}>(
    `query GetTiposUsuarios { tiposUsuarios { ${SERVER_FIELDS} } }`,
    {}
  ).then((d) => (d.tiposUsuarios || []).map(mapServerToRole));

export const createRol = (input: CreateRolInput) =>
  graphqlRequest<{createTipoUsuario: any}>(
    `mutation CreateTipoUsuario($input: CreateTipoUsuarioInput!) { createTipoUsuario(input: $input) { ${SERVER_FIELDS} } }`,
    {input}
  ).then((d) => mapServerToRole(d.createTipoUsuario));

export const updateRol = (id: number, input: UpdateRolInput) =>
  graphqlRequest<{updateTipoUsuario: any}>(
    `mutation UpdateTipoUsuario($id: Int!, $input: UpdateTipoUsuarioInput!) { updateTipoUsuario(id: $id, input: $input) { ${SERVER_FIELDS} } }`,
    {id: Number(id), input}
  ).then((d) => mapServerToRole(d.updateTipoUsuario));

export const deleteRol = (id: number) =>
  graphqlRequest<{removeTipoUsuario: boolean}>(
    `mutation RemoveTipoUsuario($id: Int!) { removeTipoUsuario(id: $id) }`,
    {id: Number(id)}
  ).then((d) => d.removeTipoUsuario);
