// ============================================
// RUTA: src/dashboard/usuarios/UsuarioFormScreen.tsx
// ============================================

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import {Usuario, CreateUsuarioInput, UpdateUsuarioInput} from '@/interfaces/usuario.interface';
// Empleado/Alumno/Tutor removed — selectors unused for FallaCero app
import {Rol} from '@/interfaces/rol.interface';
import {createUsuario, updateUsuario} from '@/graphql/usuario-crud';
// graphql helpers for empleado/alumno/tutor removed
import {getAllRoles} from '@/graphql/rol';
import {SelectorModal} from '@/components/SelectorModal';

interface Props {
  navigation: any;
  route: {params?: {usuario?: Usuario}};
}

const Campo = ({label, valor, onChange, placeholder, teclado = 'default', secureTextEntry = false}: {
  label: string; valor: string; onChange: (v: string) => void;
  placeholder?: string; teclado?: any; secureTextEntry?: boolean;
}) => (
  <View className="mb-4">
    <Text className="mb-1 text-sm font-medium text-foreground">{label}</Text>
    <TextInput
      value={valor} onChangeText={onChange} placeholder={placeholder}
      keyboardType={teclado} secureTextEntry={secureTextEntry}
      placeholderTextColor="#9ca3af"
      className="border border-border rounded-lg px-3 py-2.5 text-foreground bg-background"
    />
  </View>
);

const CampoFK = ({label, valor, onSeleccionar, onLimpiar}: {
  label: string; valor: string; onSeleccionar: () => void; onLimpiar: () => void;
}) => (
  <View className="mb-4">
    <Text className="mb-1 text-sm font-medium text-foreground">{label}</Text>
    <View className="flex-row gap-2">
      <View className="flex-1 border border-border rounded-lg px-3 py-2.5 bg-muted justify-center">
        <Text className={valor ? 'text-foreground' : 'text-muted-foreground'} numberOfLines={1}>
          {valor || 'Ninguno seleccionado'}
        </Text>
      </View>
      <TouchableOpacity onPress={onLimpiar}
        className="px-3 py-2.5 border border-border rounded-lg bg-background justify-center">
        <Text className="text-sm text-muted-foreground">Limpiar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSeleccionar}
        className="px-3 py-2.5 rounded-lg bg-primary justify-center">
        <Text className="text-sm font-medium text-primary-foreground">Elegir</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const SelectorRol = ({roles, rolIdActual, onChange}: {
  roles: Rol[]; rolIdActual: number; onChange: (id: number) => void;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-sm font-medium text-foreground">Rol *</Text>
    {roles.length === 0
      ? <ActivityIndicator size="small" />
      : (
        <View className="flex-row flex-wrap gap-2">
          {roles.map((rol) => (
            <TouchableOpacity key={rol.id_rol} onPress={() => onChange(rol.id_rol)}
              className={`px-3 py-1.5 rounded-full border ${rolIdActual === rol.id_rol ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
              <Text className={`text-sm font-medium ${rolIdActual === rol.id_rol ? 'text-primary-foreground' : 'text-foreground'}`}>
                {rol.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    {!rolIdActual && <Text className="mt-1 text-xs text-destructive">Debes seleccionar un rol</Text>}
  </View>
);

const Seccion = ({titulo}: {titulo: string}) => (
  <Text className="mt-2 mb-3 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
    {titulo}
  </Text>
);

type SelectorType = null | null;

export default function UsuarioFormScreen({navigation, route}: Props) {
  const usuarioExistente = route.params?.usuario;
  const esEdicion = !!usuarioExistente;

  const [form, setForm] = useState({
    username:      usuarioExistente?.username      ?? '',
    password_hash: '',                              // Siempre vacío al abrir — igual que el web
    rol_id:        usuarioExistente?.rol_id        ?? 0,
    empleado_id:   usuarioExistente?.empleado_id   ?? null as number | null,
    alumno_id:     usuarioExistente?.alumno_id     ?? null as number | null,
    tutor_id:      usuarioExistente?.tutor_id      ?? null as number | null,
    avatar_url:    usuarioExistente?.avatar_url    ?? '',
    ultimo_acceso: usuarioExistente?.ultimo_acceso ?? new Date().toISOString().split('T')[0],
    activo:        usuarioExistente?.activo        ?? true,
  });

  const [empleadoNombre, setEmpleadoNombre] = useState('');
  const [alumnoNombre, setAlumnoNombre] = useState('');
  const [tutorNombre, setTutorNombre] = useState('');

  const [selectorAbierto, setSelectorAbierto] = useState<SelectorType>(null);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllRoles()
      .then(setRoles)
      .catch((e) => console.error('Error al cargar roles:', e));
  }, []);

  const set = (key: string, value: any) =>
    setForm((prev) => ({...prev, [key]: value}));

  // selectors removed

  const guardar = async () => {
    if (!form.username.trim()) {
      Alert.alert('Requerido', 'El nombre de usuario es obligatorio.');
      return;
    }
    if (!esEdicion && !form.password_hash.trim()) {
      Alert.alert('Requerido', 'La contraseña es obligatoria al crear un usuario.');
      return;
    }
    if (!form.rol_id) {
      Alert.alert('Requerido', 'Debes seleccionar un rol.');
      return;
    }

    try {
      setLoading(true);

      // ── Construye el payload limpio (igual que el web) ───────────────────
      const inputParaEnvio = {
        username:      form.username.trim(),
        password_hash: form.password_hash,
        rol_id:        Number(form.rol_id),
        empleado_id:   form.empleado_id ? Number(form.empleado_id) : null,
        alumno_id:     form.alumno_id   ? Number(form.alumno_id)   : null,
        tutor_id:      form.tutor_id    ? Number(form.tutor_id)    : null,
        avatar_url:    form.avatar_url  || '',
        ultimo_acceso: form.ultimo_acceso,
        activo:        form.activo,
      };

      if (esEdicion && usuarioExistente) {
        // ── CORRECCIÓN: construye UpdateUsuarioInput correctamente ──────────
        const input: UpdateUsuarioInput = {
          ...inputParaEnvio,
          id_usuario: Number(usuarioExistente.id_usuario),
        };
        // ── CORRECCIÓN: elimina password_hash si está vacío ─────────────────
        // (no sobreescribe la contraseña si el usuario no quiso cambiarla)
        if (!input.password_hash) delete input.password_hash;

        await updateUsuario(usuarioExistente.id_usuario, input);
      } else {
        await createUsuario(inputParaEnvio as CreateUsuarioInput);
      }

      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{padding: 16}} keyboardShouldPersistTaps="handled">

      <Text className="mb-6 text-2xl font-bold text-foreground">
        {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
      </Text>

      <Seccion titulo="Credenciales" />
      <Campo label="Username *" valor={form.username}
        onChange={(v) => set('username', v)} placeholder="admin_pandora" />
      <Campo
        label={esEdicion ? 'Nueva contraseña (vacío = sin cambios)' : 'Contraseña *'}
        valor={form.password_hash} onChange={(v) => set('password_hash', v)}
        placeholder="••••••••" secureTextEntry />

      <Seccion titulo="Rol" />
      <SelectorRol roles={roles} rolIdActual={form.rol_id} onChange={(id) => set('rol_id', id)} />

      <View className="flex-row items-center justify-between mt-1 mb-4">
        <Text className="text-sm font-medium text-foreground">Usuario Activo</Text>
        <Switch value={form.activo} onValueChange={(v) => set('activo', v)} />
      </View>

      <Seccion titulo="Vínculos (opcionales)" />

      {/* Empleado/Alumno/Tutor selectors removed — not used by API FallaCero */}

      <TouchableOpacity onPress={guardar} disabled={loading}
        className={`rounded-xl py-3 items-center mb-10 mt-4 ${loading ? 'bg-muted' : 'bg-primary'}`}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text className="text-base font-semibold text-primary-foreground">
              {esEdicion ? 'Actualizar usuario' : 'Crear usuario'}
            </Text>}
      </TouchableOpacity>

      {/* ═══ Selectores modales ═══════════════════════════════════════════ */}

      {/* Selectores relacionados con alumnos/profesores eliminados */}

    </ScrollView>
  );
}
