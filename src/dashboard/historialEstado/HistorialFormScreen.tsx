import React, {useEffect, useState, useCallback} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View, FlatList, Modal, TouchableOpacity, ActivityIndicator, ScrollView} from 'react-native';
import {createHistorial, updateHistorial, getHistorial} from '@/graphql/historialEstado';
import {getCiudadanosPaginated, getCiudadano} from '@/graphql/ciudadano';
import {getDenunciasPaginated, getDenuncia} from '@/graphql/denuncia';
import {getServidoresPaginated, getServidor} from '@/graphql/servidorPublico';
import {useTheme} from '@/context/ThemeContext';
import {EstadoSeguimiento} from '@/interfaces/historialEstado.interface';
import {getAppColors} from '@/theme/colors';

export default function HistorialFormScreen({route, navigation}: any) {
  const historial = route.params?.historial;
  const [observaciones, setObservaciones] = useState(historial?.observaciones ?? '');
  const [fecha, setFecha] = useState(historial?.fecha ?? '');
  // seguimiento removed — no local field
  const {isDark} = useTheme();
  const C = getAppColors(isDark);
  const [ciudadanoQuery, setCiudadanoQuery] = useState('');
  const [ciudadanos, setCiudadanos] = useState<any[]>([]);
  const [selectedCiudadano, setSelectedCiudadano] = useState(historial?.ciudadano_id ?? null);

  const [denunciaQuery, setDenunciaQuery] = useState('');
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState(historial?.denuncia_id ?? null);

  const [servidorQuery, setServidorQuery] = useState('');
  const [servidores, setServidores] = useState<any[]>([]);
  const [selectedServidor, setSelectedServidor] = useState(historial?.servidor_publico_id ?? null);
  const [estado, setEstado] = useState<EstadoSeguimiento | string>(historial?.estado ?? EstadoSeguimiento.RECIBIDO);
  const [estadoPickerVisible, setEstadoPickerVisible] = useState(false);

  // Modal search state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'ciudadano'|'denuncia'|'servidor'|null>(null);
  const [modalQuery, setModalQuery] = useState('');
  const [modalPage, setModalPage] = useState(1);
  const [modalItems, setModalItems] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (historial?.id_historial) {
      (async () => {
        const h = await getHistorial(historial.id_historial);
        setObservaciones(h?.observaciones ?? '');
        setFecha(h?.fecha ?? '');
        // Preseleccionar las entidades relacionadas cuando se edita
        if (h?.ciudadano_id || h?.ciudadano) {
          const cid = h.ciudadano_id ?? h.ciudadano?.id_ciudadano ?? null;
          setSelectedCiudadano(cid);
          if (h.ciudadano) {
            setCiudadanos((prev) => [h.ciudadano, ...prev.filter(c => c.id_ciudadano !== h.ciudadano.id_ciudadano)]);
          } else if (cid) {
            // insert placeholder so UI shows something while fetching
            setCiudadanos((prev) => [{id_ciudadano: cid, nombre: 'Cargando...', apellido_p: ''}, ...prev.filter(p => p.id_ciudadano !== cid)]);
            try {
              const c = await getCiudadano(cid);
              if (c) setCiudadanos((prev) => [c, ...prev.filter(p => p.id_ciudadano !== c.id_ciudadano)]);
            } catch (e) {
              // leave placeholder if fetch fails
            }
          }
        }
        if (h?.denuncia_id || h?.denuncia) {
          const did = h.denuncia_id ?? h.denuncia?.id_denuncia ?? null;
          setSelectedDenuncia(did);
          if (h.denuncia) {
            setDenuncias((prev) => [h.denuncia, ...prev.filter(d => d.id_denuncia !== h.denuncia.id_denuncia)]);
          } else if (did) {
            try {
              const d = await getDenuncia(did);
              if (d) setDenuncias((prev) => [d, ...prev.filter(p => p.id_denuncia !== d.id_denuncia)]);
            } catch (e) {}
          }
        }
        if (h?.servidor_publico_id || h?.servidor_publico) {
          const sid = h.servidor_publico_id ?? h.servidor_publico?.id_servidor ?? null;
          setSelectedServidor(sid);
          if (h.servidor_publico) {
            setServidores((prev) => [h.servidor_publico, ...prev.filter(s => s.id_servidor !== h.servidor_publico.id_servidor)]);
          } else if (sid) {
            try {
              const s = await getServidor(sid);
              if (s) setServidores((prev) => [s, ...prev.filter(p => p.id_servidor !== s.id_servidor)]);
            } catch (e) {}
          }
        }
        // set estado if returned
        if (h?.estado) setEstado(h.estado);
      })();
    }
  }, [historial]);

  // computed selected objects for display
  const selectedCiudadanoObj = ciudadanos.find(c => c.id_ciudadano === selectedCiudadano);
  const selectedDenunciaObj = denuncias.find(d => d.id_denuncia === selectedDenuncia);
  const selectedServidorObj = servidores.find(s => s.id_servidor === selectedServidor);

  const fetchCiudadanos = useCallback(async (page = 1, q = '') => {
    const list = await getCiudadanosPaginated(page, 20, q);
    setCiudadanos((prev) => (page === 1 ? list : [...prev, ...list]));
  }, []);

  const fetchDenuncias = useCallback(async (q = '') => {
    const list = await getDenunciasPaginated(1, 20, q);
    setDenuncias(list);
  }, []);

  const fetchServidores = useCallback(async (page = 1, q = '') => {
    const list = await getServidoresPaginated(page, 20, q);
    setServidores((prev) => (page === 1 ? list : [...prev, ...list]));
  }, []);

  useEffect(() => { fetchCiudadanos(1, ''); fetchServidores(1, ''); }, [fetchCiudadanos, fetchServidores]);
  useEffect(() => { const t = setTimeout(() => fetchDenuncias(denunciaQuery), 300); return () => clearTimeout(t); }, [denunciaQuery, fetchDenuncias]);
  useEffect(() => { const t = setTimeout(() => fetchCiudadanos(1, ciudadanoQuery), 300); return () => clearTimeout(t); }, [ciudadanoQuery, fetchCiudadanos]);
  useEffect(() => { const t = setTimeout(() => fetchServidores(1, servidorQuery), 300); return () => clearTimeout(t); }, [servidorQuery, fetchServidores]);

  // Modal fetcher (paginated)
  const loadModalPage = useCallback(async (page = 1, q = '', typeArg?: 'ciudadano'|'denuncia'|'servidor') => {
    const t = typeArg ?? modalType;
    if (!t) return;
    setModalLoading(true);
    try {
      let list: any[] = [];
      if (t === 'ciudadano') list = await getCiudadanosPaginated(page, 20, q);
      if (t === 'denuncia') list = await getDenunciasPaginated(page, 20, q);
      if (t === 'servidor') list = await getServidoresPaginated(page, 20, q);
      setModalItems((prev) => (page === 1 ? list : [...prev, ...list]));
      setModalPage(page);
    } catch (e) {
      // ignore quietly
    } finally {
      setModalLoading(false);
    }
  }, [modalType]);

  const openModal = (type: 'ciudadano'|'denuncia'|'servidor') => {
    setModalType(type);
    setModalQuery('');
    setModalItems([]);
    setModalPage(1);
    setModalVisible(true);
    // load first page (pass type explicitly to avoid stale modalType)
    setTimeout(() => loadModalPage(1, '', type), 0);
  };

  const closeModal = () => { setModalVisible(false); setModalType(null); setModalQuery(''); setModalItems([]); };

  const save = async () => {
    try {
      const safeFecha = (() => {
        try {
          const d = (!fecha || fecha === '') ? new Date() : new Date(fecha);
          if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
          return d.toISOString().slice(0, 10); // YYYY-MM-DD
        } catch (e) { return new Date().toISOString().slice(0, 10); }
      })();
      const input = {
        observaciones,
        fecha: safeFecha,
        estado,
        ciudadano_id: selectedCiudadano != null ? Number(selectedCiudadano) : null,
        denuncia_id: selectedDenuncia != null ? Number(selectedDenuncia) : null,
        servidor_publico_id: selectedServidor != null ? Number(selectedServidor) : null,
      };
      if (historial?.id_historial) {
        await updateHistorial(historial.id_historial, input);
      } else {
        await createHistorial(input);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Error guardando historial');
    }
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: C.bg}]} contentContainerStyle={{padding: 12, paddingBottom: 28}}>
      <View style={[styles.formCard, {backgroundColor: C.card, borderColor: C.glassBorder}]}>
        <Text style={[styles.title, {color: C.textMain}]}>Historial de seguimiento</Text>

        <Text style={[styles.label, {color: C.textMain}]}>Observaciones</Text>
        <TextInput value={observaciones} onChangeText={setObservaciones} style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} multiline placeholder="Anota observaciones sobre el estado..." />

        <View style={styles.row}>
          <View style={{flex:1}}>
            <Text style={[styles.label, {color: C.textMain}]}>Fecha</Text>
            <TextInput value={fecha} onChangeText={setFecha} style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} placeholder="YYYY-MM-DD" />
          </View>
          <View style={{width: 12}} />
          <View style={{flex:1}}>
            <Text style={[styles.label, {color: C.textMain}]}>Estado</Text>
            <Pressable onPress={() => setEstadoPickerVisible(true)} style={[styles.estadoSelector, {borderColor: C.glassBorder}]}> 
              <Text style={[styles.pillText, {color: C.textMain}]}>{(estado || '').toString().replaceAll('_', ' ')}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.label, {color: C.textMain}]}>Ciudadano</Text>
        <View style={styles.rowInline}>
          <Text style={{color: C.textMain, flex:1}}>{selectedCiudadano ? (ciudadanos.find(c=>c.id_ciudadano===selectedCiudadano)?.nombre + ' ' + ciudadanos.find(c=>c.id_ciudadano===selectedCiudadano)?.apellido_p) : 'Ninguno seleccionado'}</Text>
          <Pressable onPress={() => openModal('ciudadano')} style={({pressed}) => [styles.smallBtn, {borderColor: C.accent}, pressed && {opacity:0.8}]}> 
            <Text style={[styles.smallBtnText, {color: C.accent}]}>Buscar</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, {color: C.textMain}]}>Denuncia</Text>
        <View style={styles.rowInline}>
          <Text style={{color: C.textMain, flex:1}}>{selectedDenuncia ? (denuncias.find(d=>d.id_denuncia===selectedDenuncia)?.titulo ?? 'Seleccionado') : 'Ninguno seleccionado'}</Text>
          <Pressable onPress={() => openModal('denuncia')} style={({pressed}) => [styles.smallBtn, {borderColor: C.accent}, pressed && {opacity:0.8}]}> 
            <Text style={[styles.smallBtnText, {color: C.accent}]}>Buscar</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, {color: C.textMain}]}>Servidor público</Text>
        <View style={styles.rowInline}>
          <Text style={{color: C.textMain, flex:1}}>{selectedServidor ? (servidores.find(s=>s.id_servidor===selectedServidor)?.nombre + ' ' + servidores.find(s=>s.id_servidor===selectedServidor)?.apellido_p) : 'Ninguno seleccionado'}</Text>
          <Pressable onPress={() => openModal('servidor')} style={({pressed}) => [styles.smallBtn, {borderColor: C.accent}, pressed && {opacity:0.8}]}> 
            <Text style={[styles.smallBtnText, {color: C.accent}]}>Buscar</Text>
          </Pressable>
        </View>
      </View>

      <View style={{height:12}} />
      <Pressable onPress={save} style={({pressed}) => [styles.saveBtnFull, pressed && {opacity: 0.85}, {backgroundColor: C.accent}]}> 
        <Text style={{color: '#fff', fontWeight: '800'}}>Guardar historial</Text>
      </Pressable>
      {/* Modal de búsqueda compacto */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={[styles.container, {backgroundColor: C.bg}] }>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={[styles.headerTitle, {color: C.textMain}]}>{modalType === 'ciudadano' ? 'Buscar Ciudadano' : modalType === 'denuncia' ? 'Buscar Denuncia' : 'Buscar Servidor'}</Text>
            <Pressable onPress={closeModal} style={({pressed}) => [styles.pill, pressed && {opacity:0.7}]}>
              <Text style={[styles.pillText, {color: C.accent}]}>Cerrar</Text>
            </Pressable>
          </View>

          <TextInput value={modalQuery} onChangeText={(t) => { setModalQuery(t); setTimeout(() => loadModalPage(1, t), 300); }} style={[styles.input, {color: C.textMain, borderColor: C.glassBorder, marginTop:12}]} placeholder="Buscar..." />

          <FlatList data={modalItems} keyExtractor={(i,idx) => (i.id_ciudadano ?? i.id_denuncia ?? i.id_servidor ?? idx).toString()} renderItem={({item}) => (
            <Pressable onPress={() => {
              if (modalType === 'ciudadano') setSelectedCiudadano(item.id_ciudadano);
              if (modalType === 'denuncia') setSelectedDenuncia(item.id_denuncia);
              if (modalType === 'servidor') setSelectedServidor(item.id_servidor);
              // ensure selected shows in lists
              if (modalType === 'ciudadano') setCiudadanos((prev) => [item, ...prev.filter(p => p.id_ciudadano !== item.id_ciudadano)]);
              if (modalType === 'denuncia') setDenuncias((prev) => [item, ...prev.filter(p => p.id_denuncia !== item.id_denuncia)]);
              if (modalType === 'servidor') setServidores((prev) => [item, ...prev.filter(p => p.id_servidor !== item.id_servidor)]);
              closeModal();
            }} style={{padding:12, borderBottomWidth:1, borderColor:'#eee'}}>
              {modalType === 'ciudadano' && <Text style={{color: C.textMain}}>{item.nombre} {item.apellido_p} — {item.correo}</Text>}
              {modalType === 'denuncia' && <Text style={{color: C.textMain}}>{item.titulo} — {item.fecha_denuncia}</Text>}
              {modalType === 'servidor' && <Text style={{color: C.textMain}}>{item.nombre} {item.apellido_p} — {item.cargo}</Text>}
            </Pressable>
          )} ListFooterComponent={() => (
            modalLoading ? <ActivityIndicator style={{margin:12}} /> : (
              <View style={{padding:12}}>
                <Pressable onPress={() => loadModalPage(modalPage+1, modalQuery)} style={({pressed}) => [styles.pill, pressed && {opacity:0.7}]}>
                  <Text style={[styles.pillText, {color: C.accent}]}>Cargar más</Text>
                </Pressable>
              </View>
            )
          )} />
        </View>
      </Modal>
      {/* Modal para seleccionar Estado */}
      <Modal visible={estadoPickerVisible} animationType="slide" onRequestClose={() => setEstadoPickerVisible(false)}>
        <View style={[styles.container, {backgroundColor: C.bg}] }>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={[styles.headerTitle, {color: C.textMain}]}>Seleccionar estado</Text>
            <Pressable onPress={() => setEstadoPickerVisible(false)} style={({pressed}) => [styles.pill, pressed && {opacity:0.7}]}> 
              <Text style={[styles.pillText, {color: C.accent}]}>Cerrar</Text>
            </Pressable>
          </View>
          <FlatList data={Object.values(EstadoSeguimiento)} keyExtractor={(i) => i} renderItem={({item}) => (
            <Pressable onPress={() => { setEstado(item); setEstadoPickerVisible(false); }} style={({pressed}) => [styles.estadoModalItem, {borderColor: item === estado ? C.accent : C.glassBorder}, pressed && {opacity: 0.8}] }>
              <Text style={{color: C.textMain}}>{item.replaceAll('_', ' ')}</Text>
            </Pressable>
          )} ItemSeparatorComponent={() => <View style={{height:1, backgroundColor: C.glassBorder, marginVertical:6}} />} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 0},
  formCard: {borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 6},
  title: {fontSize: 16, fontWeight: '800', marginBottom: 8},
  label: {fontSize: 13, marginTop: 12, marginBottom: 6, fontWeight: '700'},
  input: {borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 40},
  row: {flexDirection: 'row', alignItems: 'flex-start'},
  rowInline: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6},
  pill: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginLeft: 8},
  smallBtn: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginLeft: 8},
  smallBtnText: {fontWeight: '700', fontSize: 13},
  pillText: {fontWeight: '700', fontSize: 13},
  headerTitle: {fontSize: 18, fontWeight: '700'},
  estadoPill: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginRight: 8, minHeight: 36, justifyContent: 'center'},
  saveBtnFull: {marginTop: 6, paddingVertical: 14, alignItems: 'center', borderRadius: 10},
  estadoSelector: {borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, minHeight: 40, justifyContent: 'center'},
  estadoModalItem: {padding: 12, borderWidth: 1, borderRadius: 8, marginVertical: 6},
});
