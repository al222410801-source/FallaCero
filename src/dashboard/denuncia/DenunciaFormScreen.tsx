import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {createDenuncia, updateDenuncia} from '@/graphql/denuncia';
import {type CreateDenunciaInput as CI, type UpdateDenunciaInput as UI} from '@/interfaces/denuncia.interface';

interface Props {
  navigation: any;
  route?: any;
}

type CreateDenunciaInput = CI;

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
  teclado?: 'default' | 'numeric';
}) => (
  <View className="mb-4">
    <Text className="mb-1 text-sm font-medium text-foreground">{label}</Text>
    <TextInput
      value={valor}
      onChangeText={onChange}
      placeholder={placeholder}
      keyboardType={teclado as any}
      placeholderTextColor="#9ca3af"
      className="border border-border rounded-lg px-3 py-2.5 text-foreground bg-background"
    />
  </View>
);

const Seccion = ({titulo}: {titulo: string}) => (
  <Text className="mt-2 mb-3 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
    {titulo}
  </Text>
);

export default function DenunciaFormScreen({navigation, route}: Props) {
  const todayDateString = (d = new Date()) => d.toISOString().split('T')[0];

  const [form, setForm] = useState<CreateDenunciaInput>({
    ciudadano_id: '',
    titulo: '',
    fecha_denuncia: todayDateString(),
    categoria: '',
    prioridad: '',
  });

  const [loading, setLoading] = useState(false);

  const editingDenuncia = route?.params?.denuncia;

  // Prefill when editing
  useEffect(() => {
    const d = route?.params?.denuncia;
    if (d) {
      setForm({
        ciudadano_id: d.ciudadano_id ?? '',
        titulo: d.titulo ?? '',
        fecha_denuncia: d.fecha_denuncia ? String(d.fecha_denuncia).split('T')[0] : todayDateString(),
        categoria: d.categoria ?? '',
        prioridad: d.prioridad ?? '',
      });
    }
  }, [route?.params?.denuncia]);

  const categorias = [
    'Infraestructura',
    'Delincuencia',
    'Servicios',
    'Ambiental',
    'Salud',
    'Tránsito',
    'Educación',
    'Vandalismo',
    'Otro',
  ];
  const prioridades = ['Alta', 'Media', 'Baja'];

  const setField = <K extends keyof CreateDenunciaInput>(campo: K, valor: CreateDenunciaInput[K]) =>
    setForm((prev) => ({...prev, [campo]: valor}));

  const validar = (): boolean => {
    const requeridos: (keyof CreateDenunciaInput)[] = [
      'ciudadano_id',
      'titulo',
      'fecha_denuncia',
      'categoria',
      'prioridad',
    ];
    for (const campo of requeridos) {
      // @ts-ignore
      if (!form[campo]) {
        Alert.alert('Campo requerido', `El campo "${campo}" no puede estar vacío.`);
        return false;
      }
    }
    return true;
  };



  const guardar = async () => {
    if (!validar()) return;
    try {
      setLoading(true);
      const payload = {
        ciudadano_id: Number(form.ciudadano_id),
        titulo: form.titulo,
        fecha_denuncia: form.fecha_denuncia,
        categoria: form.categoria,
        prioridad: form.prioridad,
      };

      if (editingDenuncia && editingDenuncia.id_denuncia) {
        const id = Number(editingDenuncia.id_denuncia);
        const input: UI = {...payload, id_denuncia: id};
        const updated = await updateDenuncia(id, input);
        Alert.alert('Éxito', `Denuncia actualizada (id ${updated?.id_denuncia ?? id})`);
        navigation.goBack();
      } else {
        const created = await createDenuncia(payload as CI);
        Alert.alert('Éxito', `Denuncia creada (id ${created?.id_denuncia ?? '—'})`);
        navigation.goBack();
      }
    } catch (e: any) {
      console.error('createDenuncia error:', e);
      Alert.alert('Error', e.message || 'Ocurrió un error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{padding: 16}}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="mb-6 text-2xl font-bold text-foreground">{editingDenuncia ? 'Editar denuncia' : 'Nueva denuncia'}</Text>

      <Seccion titulo="Referencias" />
      <Campo label="ID Ciudadano" valor={String(form.ciudadano_id)} onChange={(v) => setField('ciudadano_id', v)} placeholder="123" teclado="numeric" />
      {/* seguimiento_id removed from form */}

      <Seccion titulo="Detalles" />
      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium text-foreground">Título</Text>
        <TextInput value={form.titulo} onChangeText={(v) => setField('titulo', v)} placeholder="Título de la denuncia" placeholderTextColor="#9ca3af" className="border border-border rounded-lg px-3 py-2 text-foreground bg-background" />
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium text-foreground">Fecha</Text>
        <TextInput value={form.fecha_denuncia} onChangeText={(v) => setField('fecha_denuncia', v)} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" className="border border-border rounded-lg px-3 py-2 text-foreground bg-background" />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-medium text-foreground">Categoría</Text>
        <View className="flex-row flex-wrap gap-2">
          {categorias.map((c) => (
            <TouchableOpacity key={c} onPress={() => setField('categoria', c)} className={`px-3 py-1 rounded-full ${form.categoria === c ? 'bg-primary' : 'bg-border'}`}>
              <Text className={form.categoria === c ? 'text-primary-foreground' : 'text-muted-foreground'}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-foreground">Prioridad</Text>
        <View className="flex-row gap-2">
          {prioridades.map((p) => (
            <TouchableOpacity key={p} onPress={() => setField('prioridad', p)} className={`px-3 py-1 rounded-lg ${form.prioridad === p ? (p === 'Alta' ? 'bg-red-500' : p === 'Media' ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-border'}`}>
              <Text className={form.prioridad === p ? 'text-white font-semibold' : 'text-muted-foreground'}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={guardar}
        disabled={loading}
        className={`rounded-xl py-3 items-center mb-10 ${loading ? 'bg-muted' : 'bg-primary'}`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-semibold text-primary-foreground">{editingDenuncia ? 'Actualizar denuncia' : 'Crear denuncia'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
