// ============================================
// RUTA: src/graphql/usuario-crud.ts
//
// ============================================

import {graphqlRequest} from '@/api/pandoraApi';
import {
  type Usuario,
  type CreateUsuarioInput,
  type UpdateUsuarioInput,
} from '@/interfaces/usuario.interface';

const USUARIO_FIELDS = `
  id_usuario
  username
  rol_id: id_tipo_usuario
  empleado_id
  ciudadano_id
  avatar_url
  ultimo_acceso
  activo
`;

export const getUsuarios = (page = 1, limit = 10) =>
  graphqlRequest<{usuariosP: Usuario[]}>(
    `query GetUsuarios($page: Int, $limit: Int) {
      usuariosP(page: $page, limit: $limit) { ${USUARIO_FIELDS} }
    }`,
    {page: Number(page), limit: Number(limit)}
  ).then((d) => d.usuariosP);

export const createUsuario = (input: CreateUsuarioInput) =>
  // map local `rol_id` to server `id_tipo_usuario`
  (() => {
    const serverInput: any = {...input};
    if ((serverInput as any).rol_id !== undefined) {
      serverInput.id_tipo_usuario = Number((serverInput as any).rol_id);
      delete serverInput.rol_id;
    }
    return graphqlRequest<{createUsuario: Usuario}>(
      `mutation CreateUsuario($input: CreateUsuarioInput!) {
        createUsuario(input: $input) { ${USUARIO_FIELDS} }
      }`,
      {input: serverInput}
    ).then((d) => d.createUsuario);
  })();

// ── CORREGIDO: recibe UpdateUsuarioInput con id_usuario ya incluido ───────────
export const updateUsuario = (id: number, input: UpdateUsuarioInput) =>
  // map local `rol_id` to server `id_tipo_usuario` inside input
  (() => {
    const serverInput: any = {...input};
    if ((serverInput as any).rol_id !== undefined) {
      serverInput.id_tipo_usuario = Number((serverInput as any).rol_id);
      delete serverInput.rol_id;
    }
    return graphqlRequest<{updateUsuario: Usuario}>(
      `mutation UpdateUsuario($id: Int!, $input: UpdateUsuarioInput!) {
        updateUsuario(id: $id, input: $input) { ${USUARIO_FIELDS} }
      }`,
      {id: Number(id), input: serverInput}
    ).then((d) => d.updateUsuario);
  })();

export const deleteUsuario = (id: number) =>
  graphqlRequest<{removeUsuario: boolean}>(
    `mutation DeleteUsuario($id: Int!) { removeUsuario(id: $id) }`,
    {id: Number(id)}
  ).then((d) => d.removeUsuario);
