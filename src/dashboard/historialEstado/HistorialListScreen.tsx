import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View, ScrollView} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {getHistoriales, deleteHistorial} from '@/graphql/historialEstado';
import {useTheme} from '@/context/ThemeContext';
import {EstadoSeguimiento} from '@/interfaces/historialEstado.interface';
import {getAppColors} from '@/theme/colors';

export default function HistorialListScreen({navigation}: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const isFocused = useIsFocused();
  const {isDark} = useTheme();
  const C = getAppColors(isDark);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getHistoriales(1, 50);
      const arr = data ?? [];
      setItems(arr);
      // compute simple stats by estado
      const counts: Record<string, number> = {};
      Object.values(EstadoSeguimiento).forEach((k) => (counts[k] = 0));
      arr.forEach((it: any) => {
        const key = it.estado ?? 'RECIBIDO';
        counts[key] = (counts[key] || 0) + 1;
      });
      setStats(counts);
      setTotal(arr.length);
    } catch (err) {
      console.warn('getHistoriales', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isFocused) load(); }, [isFocused]);

  const renderItem = ({item}: {item: any}) => {
    const fecha = item.fecha ? new Date(item.fecha).toLocaleString() : '—';
    const resumen = item.observaciones ? (item.observaciones.length > 120 ? item.observaciones.slice(0, 117) + '…' : item.observaciones) : 'Sin observaciones';
    const ciudadanoNombre = item.ciudadano ? `${item.ciudadano.nombre} ${item.ciudadano.apellido_p}` : null;
    const denunciaTitulo = item.denuncia ? item.denuncia.titulo : null;
    const servidorNombre = item.servidor_publico ? `${item.servidor_publico.nombre} ${item.servidor_publico.apellido_p}` : null;

    return (
      <View style={[styles.card, {borderColor: C.glassBorder, backgroundColor: C.card}]}> 
        <View style={{flex: 1}}>
          <Text style={[styles.title, {color: C.textMain}]}>#{item.id_historial}</Text>
          <Text style={[styles.historial, {color: C.textMain}]}>{resumen}</Text>
          <Text style={[styles.sub, {color: C.textSub}]}>Estado: {item.estado ? String(item.estado).replaceAll('_', ' ') : '—'}</Text>
          <Text style={[styles.sub, {color: C.textSub}]}>Fecha: {fecha}</Text>
          {ciudadanoNombre ? <Text style={[styles.sub, {color: C.textSub}]}>Ciudadano: {ciudadanoNombre}</Text> : null}
          {denunciaTitulo ? <Text style={[styles.sub, {color: C.textSub}]}>Denuncia: {denunciaTitulo}</Text> : null}
          {servidorNombre ? <Text style={[styles.sub, {color: C.textSub}]}>Servidor: {servidorNombre}</Text> : null}
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => navigation.navigate('HistorialForm', {historial: item})} style={({pressed}) => [styles.pill, {borderColor: C.accent}, pressed && {opacity: 0.8}]}> 
            <Text style={[styles.pillText, {color: C.accent}]}>Editar</Text>
          </Pressable>
          <Pressable onPress={async () => { await deleteHistorial(item.id_historial); load(); }} style={({pressed}) => [styles.pill, {borderColor: '#f3c6c6'}, pressed && {opacity: 0.8}]}> 
            <Text style={[styles.pillText, {color: '#e55'}]}>Borrar</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: C.bg}] }>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: C.textMain}]}>Historiales</Text>
        <Pressable onPress={() => navigation.navigate('HistorialForm')} style={({pressed}) => [styles.addBtn, pressed && {opacity: 0.7}]}> 
          <Text style={{color: C.accent}}>Nuevo</Text>
        </Pressable>
      </View>

      <ScrollView horizontal contentContainerStyle={{paddingVertical: 8}} showsHorizontalScrollIndicator={false} style={{marginBottom: 12}}>
        <View style={styles.statsRow}>
          <View style={[styles.statsChip, {borderColor: C.glassBorder, backgroundColor: C.card}]}> 
            <Text style={[styles.statsLabel, {color: C.textSub}]}>Total</Text>
            <Text style={[styles.statsCount, {color: C.textMain}]}>{total}</Text>
          </View>
          {Object.values(EstadoSeguimiento).map((e) => {
            const count = stats[e] || 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <View key={e} style={[styles.statsChip, {borderColor: C.glassBorder, backgroundColor: C.card}]}> 
                <Text style={[styles.statsLabel, {color: C.textSub}]}>{e.replaceAll('_', ' ')}</Text>
                <Text style={[styles.statsCount, {color: C.textMain}]}>{count} · {pct}%</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <FlatList data={items} keyExtractor={(i) => String(i.id_historial)} renderItem={renderItem} refreshing={loading} onRefresh={load} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 12},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  headerTitle: {fontSize: 20, fontWeight: '800'},
  addBtn: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8},
  card: {flexDirection: 'row', padding: 14, borderWidth: 1, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: {width:0, height:2}, shadowRadius: 4},
  title: {fontSize: 14, fontWeight: '800', marginBottom: 6},
  historial: {fontSize: 13, marginBottom: 8, lineHeight: 18},
  sub: {fontSize: 12, marginTop: 0},
  actions: {flexDirection: 'row', gap: 8},
  pill: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginLeft: 8},
  pillText: {fontWeight: '700', fontSize: 13},
  statsRow: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6},
  statsChip: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginRight: 8, alignItems: 'center', minWidth: 88},
  statsLabel: {fontSize: 11},
  statsCount: {fontWeight: '800', fontSize: 13, marginTop: 4},
});
