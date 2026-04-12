import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Ciudadano, CreateCiudadanoInput, UpdateCiudadanoInput} from '@/interfaces/ciudadano.interface';
import {createCiudadano, updateCiudadano} from '@/graphql/ciudadano';

interface Props {
  navigation: any;
  route: {
    params?: {
      ciudadano?: Ciudadano; // Si viene un ciudadano → modo edición
    };
  };
}

// ─── Campo de texto reutilizable ──────────────────────────────────────────────
const Campo = ({
  label,
  valor,
  onChange,
  placeholder,
  teclado = 'default',
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  teclado?: 'default' | 'email-address' | 'phone-pad';
}) => (
  <View className="mb-4">
    <Text className="mb-1 text-sm font-medium text-foreground">{label}</Text>
    <TextInput
      value={valor}
      onChangeText={onChange}
      placeholder={placeholder}
      keyboardType={teclado}
      placeholderTextColor="#9ca3af"
      className="border border-border rounded-lg px-3 py-2.5 text-foreground bg-background"
    />
  </View>
);

// (removed SelectorChips — no es necesario para Ciudadano)

// ─── Separador de sección ─────────────────────────────────────────────────────
const Seccion = ({titulo}: {titulo: string}) => (
  <Text className="mt-2 mb-3 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
    {titulo}
  </Text>
);

// ─── Pantalla del formulario ──────────────────────────────────────────────────
export default function CiudadanoFormScreen({navigation, route}: Props) {
  const ciudadanoEditar = route.params?.ciudadano as Ciudadano | undefined;
  const esEdicion = !!ciudadanoEditar;

  // Estado del formulario — precargamos si venimos a editar
  const todayDateString = (d = new Date()) => d.toISOString().split('T')[0];

  const [form, setForm] = useState<CreateCiudadanoInput>({
    nombre: ciudadanoEditar?.nombre ?? '',
    apellido_p: ciudadanoEditar?.apellido_p ?? '',
    apellido_m: ciudadanoEditar?.apellido_m ?? '',
    correo: ciudadanoEditar?.correo ?? '',
    telefono: ciudadanoEditar?.telefono ?? '',
    fecha_registro: ciudadanoEditar?.fecha_registro ? String(ciudadanoEditar.fecha_registro).split('T')[0] : todayDateString(),
  });

  const [loading, setLoading] = useState(false);

  // Actualiza un campo individual del formulario
  const setField = <K extends keyof CreateCiudadanoInput>(
    campo: K,
    valor: CreateCiudadanoInput[K]
  ) => setForm((prev) => ({...prev, [campo]: valor}));

  // Validación mínima antes de enviar
  const validar = (): boolean => {
    const requeridos: (keyof CreateCiudadanoInput)[] = ['nombre', 'apellido_p', 'apellido_m', 'correo', 'telefono', 'fecha_registro'];
    for (const campo of requeridos) {
      // @ts-ignore
      if (!form[campo]) {
        Alert.alert('Campo requerido', `El campo "${campo}" no puede estar vacío.`);
        return false;
      }
    }
    return true;
  };

  // Enviar al servidor
  const guardar = async () => {
    if (!validar()) return;
    try {
      setLoading(true);
      if (esEdicion) {
        const id = (ciudadanoEditar as Ciudadano).id_ciudadano;
        const input: UpdateCiudadanoInput = {...form, id_ciudadano: Number(id)};
        const updated = await updateCiudadano(id, input);
        navigation.navigate('CiudadanosList', {flashMessage: 'Ciudadano actualizado', updatedId: updated.id_ciudadano});
      } else {
        // Create only the fields defined in CreateCiudadanoInput — do not send password_hash
        const payload: CreateCiudadanoInput = {...form};
        const created = await createCiudadano(payload);
        navigation.navigate('CiudadanosList', {flashMessage: 'Ciudadano creado', updatedId: created.id_ciudadano});
      }
    } catch (e: any) {
        console.error('CreateCiudadano error:', e);
        Alert.alert('Error', e.message || 'Ocurrió un error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{padding: 16}}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="mb-6 text-2xl font-bold text-foreground">
        {esEdicion ? 'Editar ciudadano' : 'Nuevo ciudadano'}
      </Text>

      {/* ── Datos personales ── */}
      <Seccion titulo="Datos personales" />
      <Campo label="Nombre" valor={form.nombre}
        onChange={(v) => setField('nombre', v)} placeholder="Juan" />
      <Campo label="Apellido paterno" valor={form.apellido_p}
        onChange={(v) => setField('apellido_p', v)} placeholder="García" />
      <Campo label="Apellido materno" valor={form.apellido_m || ''}
        onChange={(v) => setField('apellido_m', v)} placeholder="López" />

      {/* ── Contacto ── */}
      <Seccion titulo="Contacto" />
      <Campo label="Correo" valor={form.correo || ''}
        onChange={(v) => setField('correo', v)}
        placeholder="juan@gmail.com" teclado="email-address" />
      <Campo label="Teléfono" valor={form.telefono || ''}
        onChange={(v) => setField('telefono', v)}
        placeholder="7221234567" teclado="phone-pad" />

      {/* ── Botón guardar ── */}
      <TouchableOpacity
        onPress={guardar}
        disabled={loading}
        className={`rounded-xl py-3 items-center mb-10 ${loading ? 'bg-muted' : 'bg-primary'}`}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text className="text-base font-semibold text-primary-foreground">
                {esEdicion ? 'Actualizar ciudadano' : 'Crear ciudadano'}
              </Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}
