import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {type Ciudadano} from '@/interfaces/ciudadano.interface';
import {getCiudadanosPaginated, deleteCiudadano} from '@/graphql/ciudadano';

interface Props {
  navigation: any;
  route?: any;
}

// ─── Modal de confirmación ────────────────────────────────────────────────────
// Reemplaza Alert.alert que no funciona en web
const ModalConfirmacion = ({
  visible,
  nombre,
  onConfirmar,
  onCancelar,
}: {
  visible: boolean;
  nombre: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) => (
  <Modal transparent visible={visible} animationType="fade">
    {/* Fondo oscuro */}
    <View className="items-center justify-center flex-1 bg-black/50">

      {/* Caja del modal */}
      <View className="w-4/5 p-6 mx-4 border rounded-xl bg-card border-border">
        <Text className="mb-2 text-lg font-bold text-foreground">
          Eliminar ciudadano
        </Text>
        <Text className="mb-6 text-sm text-muted-foreground">
          ¿Deseas eliminar a {nombre}? Esta acción no se puede deshacer.
        </Text>

        <View className="flex-row gap-3">
          <Pressable
            onPress={onCancelar}
            className="items-center flex-1 py-2 border rounded-lg border-border bg-background"
          >
            <Text className="font-medium text-foreground">Cancelar</Text>
          </Pressable>

          <Pressable
            onPress={onConfirmar}
            className="items-center flex-1 py-2 rounded-lg bg-destructive"
          >
            <Text className="font-medium text-white">🗑️ Eliminar</Text>
          </Pressable>
        </View>
      </View>

    </View>
  </Modal>
);

// ─── Tarjeta de cada empleado ─────────────────────────────────────────────────
const CiudadanoCard = ({
  ciudadano,
  onEditar,
  onEliminar,
}: {
  ciudadano: Ciudadano;
  onEditar: () => void;
  onEliminar: () => void;
}) => {
  const formatDate = (s?: string) => {
    if (!s) return '—';
    try {
      const d = new Date(s);
      return d.toLocaleDateString();
    } catch {
      return s.split('T')[0] ?? s;
    }
  };

  const initials = `${ciudadano.nombre?.charAt(0) ?? ''}${ciudadano.apellido_p?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <View className="p-4 mx-4 mb-3 border bg-card border-border rounded-xl flex-row">
      <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mr-4">
        <Text className="text-lg font-bold text-primary-foreground">{initials}</Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="flex-1 text-base font-bold text-foreground">
            {ciudadano.nombre} {ciudadano.apellido_p} {ciudadano.apellido_m}
          </Text>
          <Text className="text-xs text-muted-foreground">{formatDate(ciudadano.fecha_registro)}</Text>
        </View>

        <Text className="text-sm text-muted-foreground">{ciudadano.correo ?? '—'}</Text>
        <Text className="text-sm text-muted-foreground">{ciudadano.telefono ?? '—'}</Text>

        <View className="flex-row mt-3 gap-2">
          <Pressable
            onPress={onEditar}
            className="items-center py-2 px-3 rounded-lg bg-primary"
          >
            <Text className="text-sm font-medium text-primary-foreground">Editar ✏️</Text>
          </Pressable>

          <Pressable
            onPress={onEliminar}
            className="items-center py-2 px-3 rounded-lg bg-destructive"
          >
            <Text className="text-sm font-medium text-white">Eliminar 🗑️</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

// Animated wrapper for fade-in + slight translateY per item
const AnimatedCiudadanoCard = ({ciudadano, onEditar, onEliminar, index}: any) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      delay: Math.min(200 + index * 60, 600),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: useNative,
    }).start();
  }, [anim, index]);

  const translateY = anim.interpolate({inputRange: [0, 1], outputRange: [8, 0]});
  const opacity = anim;

  return (
    <Animated.View style={{opacity, transform: [{translateY}]}}>
      <CiudadanoCard ciudadano={ciudadano} onEditar={onEditar} onEliminar={onEliminar} />
    </Animated.View>
  );
};

// Simple skeleton row with subtle shimmer (animated background opacity)
const SkeletonCard = ({anim}:{anim: Animated.Value}) => {
  const bg = anim.interpolate({inputRange: [0, 1], outputRange: ['#e6e7eb', '#f3f4f6']});
  return (
    <Animated.View style={{backgroundColor: bg, marginHorizontal:16, marginBottom:12, padding:12, borderRadius:12}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{width:52, height:52, borderRadius:26, backgroundColor:'#fff', marginRight:12}} />
        <View style={{flex:1}}>
          <View style={{height:14, backgroundColor:'#fff', marginBottom:8, borderRadius:6, width:'50%'}} />
          <View style={{height:12, backgroundColor:'#fff', borderRadius:6, width:'70%'}} />
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function CiudadanosListScreen({navigation, route}: Props) {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Estado del modal — guarda qué empleado se quiere eliminar
  const [modalVisible, setModalVisible] = useState(false);
  const [ciudadanoAEliminar, setCiudadanoAEliminar] = useState<{id: number; nombre: string} | null>(null);

  const cargar = async (pagina: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCiudadanosPaginated(pagina, 10);
      console.warn('cargar ciudadanos', {pagina, count: Array.isArray(data) ? data.length : 'no-array'});
      setCiudadanos(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar ciudadanos');
      console.warn('cargar ciudadanos error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Ensure first page is loaded at mount in addition to focus
  useEffect(() => { cargar(1); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar(1);
    setPage(1);
  };

  useFocusEffect(
    useCallback(() => {cargar(page);}, [page])
  );

  // shimmer for skeletons and fab animation
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: false}),
        Animated.timing(shimmer, {toValue: 0, duration: 700, easing: Easing.linear, useNativeDriver: false}),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const fabAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(fabAnim, {toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: useNative}).start();
  }, [fabAnim]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ciudadanos;
    return ciudadanos.filter(c => (
      `${c.nombre} ${c.apellido_p} ${c.apellido_m}`.toLowerCase().includes(q)
      || (c.correo ?? '').toLowerCase().includes(q)
      || (c.telefono ?? '').toLowerCase().includes(q)
    ));
  }, [ciudadanos, query]);

  // flash banner when returning from form
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  useEffect(() => {
    const msg = route?.params?.flashMessage;
    if (!msg) return;
    setFlashMessage(msg);
    Animated.timing(fabAnim, {toValue: 1, duration: 240, useNativeDriver: true}).start();
    const flashAnim = new Animated.Value(0);
    const useNative = Platform.OS !== 'web';
    Animated.timing(flashAnim, {toValue: 1, duration: 240, useNativeDriver: useNative}).start();
    const timeout = setTimeout(() => {
      Animated.timing(flashAnim, {toValue: 0, duration: 220, useNativeDriver: useNative}).start(() => setFlashMessage(null));
      navigation.setParams && navigation.setParams({flashMessage: undefined, updatedId: undefined});
    }, 2300);
    return () => clearTimeout(timeout);
  }, [route?.params?.flashMessage]);

  // Abre el modal guardando qué empleado se quiere eliminar
  const pedirConfirmacion = (id: number, nombre: string) => {
    setCiudadanoAEliminar({id, nombre});
    setModalVisible(true);
  };

  // Se ejecuta cuando el usuario presiona "Eliminar" en el modal
  const confirmarEliminar = async () => {
    if (!ciudadanoAEliminar) return;
    try {
      await deleteCiudadano(ciudadanoAEliminar.id);
      setModalVisible(false);
      setCiudadanoAEliminar(null);
      cargar(page);
    } catch (e: any) {
      setModalVisible(false);
      setError(e.message || 'Error al eliminar');
    }
  };

  const cancelarEliminar = () => {
    setModalVisible(false);
    setCiudadanoAEliminar(null);
  };

  // ─── Estados de carga y error ─────────────────────────────────────────────
  if (loading && ciudadanos.length === 0) {
    return (
      <View className="flex-1 bg-background pt-6">
        {[0,1,2,3].map((i) => (
          <SkeletonCard key={i} anim={shimmer} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-background">
        <Text className="mb-4 text-center text-destructive">{error}</Text>
        <TouchableOpacity
          onPress={() => cargar(page)}
          className="px-6 py-2 rounded-lg bg-primary"
        >
          <Text className="text-primary-foreground">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Lista ────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-background">

      {flashMessage ? (
        <Animated.View style={{position:'absolute', left:24, right:24, top:8, zIndex:50, alignItems:'center'}}>
          <View style={{backgroundColor:'#ea8613', paddingVertical:6, paddingHorizontal:10, borderRadius:6, minHeight:36, justifyContent:'center', alignItems:'center'}}>
            <Text style={{color:'#fff', textAlign:'center', fontWeight:'600', fontSize:13}}>{flashMessage}</Text>
          </View>
        </Animated.View>
      ) : null}

      {/* Modal de confirmación — aparece encima de todo */}
      <ModalConfirmacion
        visible={modalVisible}
        nombre={ciudadanoAEliminar?.nombre ?? ''}
        onConfirmar={confirmarEliminar}
        onCancelar={cancelarEliminar}
      />

      <FlatList
        keyExtractor={(item) => item.id_ciudadano.toString()}
        contentContainerStyle={{paddingVertical: 16}}

        ListHeaderComponent={
          <View className="px-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Image source={require('../../../assets/Fallalogo.png')} style={{width: 64, height: 44, marginRight: 10}} />
                    <View>
                      <Text className="text-2xl font-bold text-foreground">Ciudadanos</Text>
                      <Text className="text-sm text-muted-foreground">{ciudadanos.length} registros · página {page}</Text>
                    </View>
                  </View>

                  <Image source={require('../../../assets/capibara.png')} style={{width: 56, height: 56}} />
                </View>

                <View className="mt-3">
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Buscar por nombre, correo o teléfono"
                    className="border border-border rounded-lg px-3 py-2 text-foreground bg-background"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
          </View>
        }

        ListEmptyComponent={
          <View className="items-center py-16 px-6">
            <Image source={require('../../../assets/capibara.png')} style={{width:120, height:120, marginBottom:16}} />
            <Text className="mb-3 text-lg font-semibold text-foreground">No hay ciudadanos aún</Text>
            <Text className="mb-4 text-sm text-muted-foreground text-center">Puedes crear uno ahora y aparecerá en esta lista.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CiudadanoForm')} className="px-6 py-3 rounded-lg bg-primary">
              <Text className="text-primary-foreground font-medium">+ Crear ciudadano</Text>
            </TouchableOpacity>
          </View>
        }

        renderItem={({item, index}) => (
          <AnimatedCiudadanoCard
            index={index}
            ciudadano={item}
            onEditar={() => navigation.navigate('CiudadanoForm', {ciudadano: item})}
            onEliminar={() => pedirConfirmacion(item.id_ciudadano, `${item.nombre} ${item.apellido_p}`)}
          />
        )}
        data={filtered}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* ── Paginación ── */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-border bg-background">
        <TouchableOpacity
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-muted' : 'bg-primary'}`}
        >
          <Text className={page === 1 ? 'text-muted-foreground' : 'text-primary-foreground'}>
            ← Anterior
          </Text>
        </TouchableOpacity>

        <Text className="text-sm text-muted-foreground">Página {page}</Text>

        <TouchableOpacity
          onPress={() => setPage((p) => p + 1)}
          disabled={ciudadanos.length < 10}
          className={`px-4 py-2 rounded-lg ${ciudadanos.length < 10 ? 'bg-muted' : 'bg-primary'}`}
        >
          <Text className={ciudadanos.length < 10 ? 'text-muted-foreground' : 'text-primary-foreground'}>
            Siguiente →
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Botón flotante crear ── */}
      <Animated.View style={{position:'absolute', bottom:20, right:24, transform:[{scale: fabAnim}], zIndex: 20}}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CiudadanoForm')}
          className="items-center justify-center rounded-full shadow-lg bg-primary w-14 h-14"
        >
          <Text className="text-3xl font-light text-primary-foreground">+</Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}
