import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';
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
import {type Denuncia} from '@/interfaces/denuncia.interface';
import {getDenunciasPaginated, deleteDenuncia} from '@/graphql/denuncia';

interface Props {
  navigation: any;
  route?: any;
}

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
    <View className="items-center justify-center flex-1 bg-black/50">
      <View className="w-4/5 p-6 mx-4 border rounded-xl bg-card border-border">
        <Text className="mb-2 text-lg font-bold text-foreground">Eliminar denuncia</Text>
        <Text className="mb-6 text-sm text-muted-foreground">¿Deseas eliminar "{nombre}"? Esta acción no se puede deshacer.</Text>

        <View className="flex-row gap-3">
          <Pressable onPress={onCancelar} className="items-center flex-1 py-2 border rounded-lg border-border bg-background">
            <Text className="font-medium text-foreground">Cancelar</Text>
          </Pressable>

          <Pressable onPress={onConfirmar} className="items-center flex-1 py-2 rounded-lg bg-red-600">
            <Text className="font-medium text-white">🗑️ Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

const DenunciaCard = ({denuncia, onEditar, onEliminar}: {denuncia: Denuncia; onEditar: () => void; onEliminar: () => void}) => {
  const formatDate = (s?: string) => {
    if (!s) return '—';
    try { return new Date(s).toLocaleDateString(); } catch { return s.split('T')[0] ?? s; }
  };

  const categoryIconMap: Record<string, string> = {
    'Infraestructura': '🏗️',
    'Delincuencia': '🚨',
    'Servicios': '🔧',
    'Ambiental': '🌳',
    'Salud': '🩺',
    'Tránsito': '🚦',
    'Educación': '🎓',
    'Vandalismo': '🧨',
    'Otro': '📌',
  };
  const icon = categoryIconMap[denuncia.categoria ?? ''] ?? '📣';

  const categoryColorMap: Record<string, string> = {
    'Infraestructura': '#3b82f6',
    'Delincuencia': '#ef4444',
    'Servicios': '#f59e0b',
    'Ambiental': '#10b981',
    'Salud': '#8b5cf6',
    'Tránsito': '#f97316',
    'Educación': '#06b6d4',
    'Vandalismo': '#ef476f',
    'Otro': '#64748b',
  };

  const getPriorityStyles = (p?: string | number) => {
    const defaultStyle = {bg: '#94a3b8', text: '#0f172a'};
    if (p === undefined || p === null) return defaultStyle;
    const str = String(p).trim().toLowerCase();
    // numeric codes
    if (str === '1' || str === 'a' || str === 'alta' || str === 'high') return {bg: '#ef4444', text: '#ffffff'};
    if (str === '2' || str === 'm' || str === 'media' || str === 'medium') return {bg: '#f59e0b', text: '#0f172a'};
    if (str === '3' || str === 'b' || str === 'baja' || str === 'low') return {bg: '#10b981', text: '#ffffff'};
    // contains checks for variants
    if (str.includes('alta')) return {bg: '#ef4444', text: '#ffffff'};
    if (str.includes('media')) return {bg: '#f59e0b', text: '#0f172a'};
    if (str.includes('baja')) return {bg: '#10b981', text: '#ffffff'};
    return defaultStyle;
  };

  const color = categoryColorMap[denuncia.categoria ?? 'Otro'] ?? '#64748b';
  const meta = `Denuncia #${denuncia.id_denuncia}`;

  const {isDark} = useTheme();
  const C = getAppColors(isDark);

  return (
    <View style={{marginHorizontal:12, marginBottom:14, borderRadius:12, overflow:'hidden', backgroundColor: C.card, elevation:2}}>
      <View style={{height:6, backgroundColor: color}} />
      <View style={{padding:14}}>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
          <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
            <View style={{width:44, height:44, borderRadius:10, backgroundColor:'#f1f5f9', alignItems:'center', justifyContent:'center', marginRight:12}}>
              <Text style={{fontSize:20}}>{icon}</Text>
            </View>
            <View style={{flex:1}}>
              <Text numberOfLines={1} style={{fontSize:16, fontWeight:'700', color: C.textMain}}>{denuncia.titulo}</Text>
              <Text numberOfLines={1} style={{fontSize:13, color: C.textSub, marginTop:4}}>{meta}</Text>
            </View>
          </View>

          <View style={{alignItems:'flex-end', marginLeft:8}}>
            <Text style={{fontSize:12, color: C.muted}}>{new Date(denuncia.fecha_denuncia ?? '').toLocaleDateString() || '—'}</Text>
            {
              (() => {
                const s = getPriorityStyles(denuncia.prioridad);
                // adapt dark-mode: if priority text is the dark hex '#0f172a', use themed textMain
                const badgeTextColor = (s.text === '#0f172a') ? C.textMain : s.text;
                return (
                  <View style={{marginTop:8, backgroundColor: s.bg, paddingHorizontal:8, paddingVertical:4, borderRadius:999}}>
                    <Text style={{color: badgeTextColor, fontSize:12, fontWeight:'600'}}>{denuncia.prioridad ?? '—'}</Text>
                  </View>
                );
              })()
            }
          </View>
        </View>

        <View style={{flexDirection:'row', marginTop:12, justifyContent:'flex-end', gap:8}}>
          <Pressable onPress={onEditar} style={{paddingHorizontal:10, paddingVertical:8, borderRadius:8, backgroundColor: C.accentAlt + '22', marginRight:8}}>
            <Text style={{color: C.secondary, fontWeight:'600'}}>✏️ Editar</Text>
          </Pressable>
          <Pressable onPress={onEliminar} style={{paddingHorizontal:10, paddingVertical:8, borderRadius:8, backgroundColor:'#fee2e2'}}>
            <Text style={{color:'#991b1b', fontWeight:'600'}}>🗑️ Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const AnimatedDenunciaCard = ({denuncia, onEditar, onEliminar, index}: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.timing(anim, {toValue: 1, duration: 420, delay: Math.min(200 + index * 60, 600), easing: Easing.out(Easing.cubic), useNativeDriver: useNative}).start();
  }, [anim, index]);
  const translateY = anim.interpolate({inputRange: [0, 1], outputRange: [8, 0]});
  const opacity = anim;
  return (
    <Animated.View style={{opacity, transform: [{translateY}]}}>
      <DenunciaCard denuncia={denuncia} onEditar={onEditar} onEliminar={onEliminar} />
    </Animated.View>
  );
};

const SkeletonCard = ({anim}:{anim: Animated.Value}) => {
  const bg = anim.interpolate({inputRange: [0,1], outputRange: ['#e6e7eb', '#f3f4f6']});
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

export default function DenunciasListScreen({navigation, route}: Props) {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [modalVisible, setModalVisible] = useState(false);
  const [denunciaAEliminar, setDenunciaAEliminar] = useState<{id: number; titulo: string} | null>(null);

  const cargar = async (pagina: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDenunciasPaginated(pagina, 10);
      setDenuncias(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar denuncias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => { setRefreshing(true); await cargar(1); setPage(1); };

  useFocusEffect(useCallback(() => { cargar(page); }, [page]));

  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(shimmer, {toValue:1, duration:700, easing: Easing.linear, useNativeDriver: false}), Animated.timing(shimmer, {toValue:0, duration:700, easing: Easing.linear, useNativeDriver: false})]));
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const fabAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => { const useNative = Platform.OS !== 'web'; Animated.timing(fabAnim, {toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: useNative}).start(); }, [fabAnim]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase(); if (!q) return denuncias;
    return denuncias.filter(c => (`${c.titulo}`.toLowerCase().includes(q) || (c.categoria ?? '').toLowerCase().includes(q) || (c.prioridad ?? '').toLowerCase().includes(q)));
  }, [denuncias, query]);

  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  useEffect(() => {
    const msg = route?.params?.flashMessage; if (!msg) return; setFlashMessage(msg);
    Animated.timing(fabAnim, {toValue: 1, duration: 240, useNativeDriver: true}).start();
    const flashAnim = new Animated.Value(0); const useNative = Platform.OS !== 'web'; Animated.timing(flashAnim, {toValue: 1, duration: 240, useNativeDriver: useNative}).start();
    const timeout = setTimeout(() => { Animated.timing(flashAnim, {toValue: 0, duration: 220, useNativeDriver: useNative}).start(() => setFlashMessage(null)); navigation.setParams && navigation.setParams({flashMessage: undefined, updatedId: undefined}); }, 2300);
    return () => clearTimeout(timeout);
  }, [route?.params?.flashMessage]);

  const pedirConfirmacion = (id: number, titulo: string) => { setDenunciaAEliminar({id, titulo}); setModalVisible(true); };

  const confirmarEliminar = async () => {
    if (!denunciaAEliminar) return;
    try { await deleteDenuncia(denunciaAEliminar.id); setModalVisible(false); setDenunciaAEliminar(null); cargar(page); }
    catch (e: any) { setModalVisible(false); setError(e.message || 'Error al eliminar'); }
  };

  const cancelarEliminar = () => { setModalVisible(false); setDenunciaAEliminar(null); };

  if (loading && denuncias.length === 0) {
    return (<View className="flex-1 bg-background pt-6">{[0,1,2,3].map((i) => (<SkeletonCard key={i} anim={shimmer} />))}</View>);
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-background">
        <Text className="mb-4 text-center text-destructive">{error}</Text>
        <TouchableOpacity onPress={() => cargar(page)} className="px-6 py-2 rounded-lg bg-indigo-600"><Text className="text-white">Reintentar</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View style={{padding:12}}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={{fontSize:16}}>← Inicio</Text>
        </TouchableOpacity>
      </View>
      {flashMessage ? (<Animated.View style={{position:'absolute', left:24, right:24, top:8, zIndex:50, alignItems:'center'}}><View style={{backgroundColor:'#ea8613', paddingVertical:6, paddingHorizontal:10, borderRadius:6, minHeight:36, justifyContent:'center', alignItems:'center'}}><Text style={{color:'#fff', textAlign:'center', fontWeight:'600', fontSize:13}}>{flashMessage}</Text></View></Animated.View>) : null}

      <ModalConfirmacion visible={modalVisible} nombre={denunciaAEliminar?.titulo ?? ''} onConfirmar={confirmarEliminar} onCancelar={cancelarEliminar} />

      <FlatList
        keyExtractor={(item) => item.id_denuncia.toString()}
        contentContainerStyle={{paddingVertical: 16}}
        ListHeaderComponent={
          <View className="px-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Image source={require('../../../assets/Fallalogo.png')} style={{width: 64, height: 44, marginRight: 10}} />
                <View>
                  <Text className="text-2xl font-bold text-foreground">Denuncias</Text>
                  <Text className="text-sm text-muted-foreground">{denuncias.length} registros · página {page}</Text>
                </View>
              </View>
              <Image source={require('../../../assets/capibara.png')} style={{width: 56, height: 56}} />
            </View>

            <View className="mt-3">
              <View className="flex-row items-center border border-border rounded-lg px-3 py-2 bg-card">
                <Text style={{marginRight:8, fontSize:16}}>🔎</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Buscar por título, categoría o prioridad"
                  className="flex-1 text-foreground"
                  placeholderTextColor="#9ca3af"
                />
                {query.length > 0 ? (
                  <TouchableOpacity onPress={() => setQuery('')} className="ml-2 px-2 py-1 rounded-full bg-border">
                    <Text className="text-sm text-muted-foreground">Limpiar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16 px-6">
            <Image source={require('../../../assets/capibara.png')} style={{width:160, height:160, marginBottom:16}} />
            <Text className="mb-3 text-xl font-semibold text-foreground">No hay denuncias aún</Text>
            <Text className="mb-4 text-sm text-muted-foreground text-center">Puedes crear una ahora y aparecerá en esta lista.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DenunciaForm')} className="px-6 py-3 rounded-lg bg-indigo-600"><Text className="text-white font-medium">+ Crear denuncia</Text></TouchableOpacity>
          </View>
        }
        renderItem={({item, index}) => (
          <AnimatedDenunciaCard index={index} denuncia={item} onEditar={() => navigation.navigate('DenunciaForm', {denuncia: item})} onEliminar={() => pedirConfirmacion(item.id_denuncia, item.titulo)} />
        )}
        data={filtered}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <View className="flex-row items-center justify-between px-4 py-3 border-t border-border bg-background">
        <TouchableOpacity onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-muted' : 'bg-indigo-600'}`}>
          <Text className={page === 1 ? 'text-muted-foreground' : 'text-white'}>← Anterior</Text>
        </TouchableOpacity>

        <Text className="text-sm text-muted-foreground">Página {page}</Text>

        <TouchableOpacity onPress={() => setPage((p) => p + 1)} disabled={denuncias.length < 10} className={`px-4 py-2 rounded-lg ${denuncias.length < 10 ? 'bg-muted' : 'bg-indigo-600'}`}>
          <Text className={denuncias.length < 10 ? 'text-muted-foreground' : 'text-white'}>Siguiente →</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{position:'absolute', bottom:20, right:24, transform:[{scale: fabAnim}], zIndex: 20, alignItems:'center'}}>
        <TouchableOpacity onPress={() => navigation.navigate('DenunciaForm')} className="items-center justify-center rounded-full shadow-lg bg-indigo-600 w-14 h-14">
          <Text className="text-3xl font-light text-white">+</Text>
        </TouchableOpacity>
        <Text className="mt-2 text-xs text-muted-foreground">Crear</Text>
      </Animated.View>
    </View>
  );
}
