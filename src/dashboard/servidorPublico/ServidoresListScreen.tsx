import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {getServidoresPaginated, getServidor} from '@/graphql/servidorPublico';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';

export default function ServidoresListScreen({navigation}: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const {isDark} = useTheme();
  const C = getAppColors(isDark);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getServidoresPaginated(1, 50);
      setItems(data ?? []);
    } catch (err) {
      console.warn('getServidores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isFocused) load(); }, [isFocused]);

  const renderItem = ({item}: {item: any}) => (
    <View style={[styles.card, {borderColor: C.glassBorder, backgroundColor: C.card}]}> 
      <View style={{flex:1}}>
        <Text style={[styles.title, {color: C.textMain}]}>{item.nombre} {item.apellido_p}</Text>
        <Text style={[styles.sub, {color: C.textSub}]}>{item.cargo} · #{item.id_servidor}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => navigation.navigate('ServidorForm', {servidor: item})} style={({pressed}) => [styles.pill, pressed && {opacity:0.8}, {borderColor: C.accent}]}> 
          <Text style={[styles.pillText, {color: C.accent}]}>Ver</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) return <View style={[styles.loading, {backgroundColor: C.bg}]}><ActivityIndicator size="large" color={C.accent} /></View>;

  return (
    <View style={[styles.container, {backgroundColor: C.bg}] }>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id_servidor)}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={load}
        ListHeaderComponent={
          <View style={{paddingBottom:12, marginBottom:6}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <Text style={{fontSize:20, fontWeight:'700', color: C.textMain}}>Servidores</Text>
              <Text style={{color: C.textSub}}>{items.length} registros</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{alignItems:'center', padding:24}}>
            <Text style={{fontSize:16, fontWeight:'600', color: C.textMain, marginBottom:8}}>No hay servidores aún</Text>
            <Text style={{color: C.textSub, marginBottom:12}}>Crea un servidor público para comenzar.</Text>
            <Pressable onPress={() => navigation.navigate('ServidorForm')} style={({pressed}) => [{paddingHorizontal:16, paddingVertical:10, borderRadius:8, backgroundColor: C.accent, opacity: pressed?0.8:1}] }>
              <Text style={{color: C.bg, fontWeight:'700'}}>+ Crear servidor</Text>
            </Pressable>
          </View>
        }
      />

      {/* Botón flotante crear */}
      <View style={{position:'absolute', bottom:20, right:18, zIndex:40}}>
        <Pressable onPress={() => navigation.navigate('ServidorForm')} style={({pressed}) => [styles.pill, {backgroundColor: C.accent, borderColor: C.accent}, pressed && {opacity:0.85}] }>
          <Text style={[styles.pillText, {color: '#fff', fontSize: 18}]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 12},
  loading: {flex:1, alignItems:'center', justifyContent:'center'},
  card: {flexDirection: 'row', padding: 14, borderWidth: 1, borderRadius: 12, marginBottom: 12, alignItems: 'center'},
  title: {fontSize: 15, fontWeight: '700'},
  sub: {fontSize: 13, marginTop: 6},
  actions: {flexDirection: 'row'},
  pill: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginLeft: 8},
  pillText: {fontWeight: '700', fontSize: 13},
});
