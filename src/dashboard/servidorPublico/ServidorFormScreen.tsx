import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, ActivityIndicator} from 'react-native';
import {getServidor, createServidor, updateServidor, deleteServidor} from '@/graphql/servidorPublico';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';
import {ServidorPublico, CreateServidorPublicoInput, UpdateServidorPublicoInput} from '@/interfaces/servidorPublico.interface';
export default function ServidorFormScreen({navigation, route}: any) {
  const servidorEditar: ServidorPublico | undefined = route.params?.servidor;
  const esEdicion = !!servidorEditar;

  const today = () => new Date().toISOString().slice(0,10);

  const [form, setForm] = useState<CreateServidorPublicoInput>({
    nombre: servidorEditar?.nombre ?? '',
    apellido_p: servidorEditar?.apellido_p ?? '',
    apellido_m: servidorEditar?.apellido_m ?? '',
    cargo: servidorEditar?.cargo ?? '',
    email_personal: servidorEditar?.email_personal ?? '',
    telefono: servidorEditar?.telefono ?? '',
    dependencia: servidorEditar?.dependencia ?? '',
    fecha_ingreso: servidorEditar?.fecha_ingreso ? String(servidorEditar.fecha_ingreso).split('T')[0] : today(),
    activo: typeof servidorEditar?.activo === 'boolean' ? servidorEditar?.activo : true,
  });
  const [loading, setLoading] = useState(false);

  const {isDark} = useTheme();
  const C = getAppColors(isDark);

  useEffect(() => {
    // if route provided only id, try to fetch full record
    if (servidorEditar && servidorEditar.id_servidor && (!servidorEditar.nombre && !servidorEditar.apellido_p)) {
      (async () => {
        try {
          setLoading(true);
          const s = await getServidor(servidorEditar.id_servidor);
          if (s) setForm({nombre: s.nombre ?? '', apellido_p: s.apellido_p ?? '', apellido_m: s.apellido_m ?? '', cargo: s.cargo ?? '', email_personal: s.email_personal ?? '', telefono: s.telefono ?? '', dependencia: s.dependencia ?? '', fecha_ingreso: s.fecha_ingreso ? String(s.fecha_ingreso).split('T')[0] : today(), activo: typeof s.activo === 'boolean' ? s.activo : true});
        } catch (e) {
          // ignore
        } finally { setLoading(false); }
      })();
    }
  }, [servidorEditar]);

  const setField = <K extends keyof CreateServidorPublicoInput>(field: K, value: CreateServidorPublicoInput[K]) => setForm((p) => ({...p, [field]: value}));

  const validar = (): boolean => {
    const faltan: string[] = [];
    if (!form.nombre) faltan.push('nombre');
    if (!form.apellido_p) faltan.push('apellido paterno');
    // numero_servidor se puede generar automáticamente si no se proporciona
    if (!form.apellido_m) faltan.push('apellido materno');
    if (!form.email_personal) faltan.push('email');
    if (!form.cargo) faltan.push('cargo');
    if (!form.telefono) faltan.push('teléfono');
    if (faltan.length > 0) {
      Alert.alert('Faltan campos', 'Complete: ' + faltan.join(', '));
      return false;
    }
    return true;
  };

  const guardar = async () => {
    if (!validar()) return;
    try {
      setLoading(true);
      if (esEdicion && servidorEditar) {
        const input: UpdateServidorPublicoInput = {...form as any, id_servidor: servidorEditar.id_servidor};
        await updateServidor(servidorEditar.id_servidor, input);
        navigation.navigate('ServidoresList', {flashMessage: 'Servidor actualizado', updatedId: servidorEditar.id_servidor});
      } else {
        // Provide defaults for required backend fields when creating (match Ciudadano behavior)
        const createInput = {
          ...form as any,
          telefono: (form as any).telefono ?? '',
          fecha_ingreso: form.fecha_ingreso ?? today(),
          activo: typeof form.activo === 'boolean' ? form.activo : true,
        };
        const created = await createServidor(createInput as any);
        navigation.navigate('ServidoresList', {flashMessage: 'Servidor creado', updatedId: created.id_servidor});
      }
    } catch (e: any) { Alert.alert('Error', e?.message ?? 'Error al guardar'); }
    finally { setLoading(false); }
  };

  const borrar = () => {
    if (!esEdicion || !servidorEditar) return;
    Alert.alert('Confirmar', 'Eliminar servidor público?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { setLoading(true); await deleteServidor(servidorEditar.id_servidor); navigation.navigate('ServidoresList', {flashMessage: 'Servidor eliminado'}); }
        catch (e:any) { Alert.alert('Error', e?.message ?? 'No se pudo eliminar'); }
        finally { setLoading(false); }
      }}
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{padding:16}} style={{backgroundColor: C.bg}} keyboardShouldPersistTaps="handled">
      <Text style={{fontSize:22, fontWeight:'700', color: C.textMain, marginBottom:12}}>{esEdicion ? 'Editar servidor' : 'Nuevo servidor'}</Text>

      <Text style={[styles.label, {color: C.textMain}]}>Nombre</Text>
      <TextInput value={form.nombre} onChangeText={(t) => setField('nombre', t)} style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} />

      <Text style={[styles.label, {color: C.textMain}]}>Apellido paterno</Text>
      <TextInput value={form.apellido_p} onChangeText={(t) => setField('apellido_p', t)} style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} />

      <Text style={[styles.label, {color: C.textMain}]}>Apellido materno</Text>
      <TextInput value={form.apellido_m ?? ''} onChangeText={(t) => setField('apellido_m', t)} style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} />

      <Text style={[styles.label, {color: C.textMain}]}>Cargo</Text>
      <TextInput value={form.cargo ?? ''} onChangeText={(t) => setField('cargo', t)} style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} />

      <Text style={[styles.label, {color: C.textMain}]}>Email</Text>
      <TextInput value={form.email_personal ?? ''} onChangeText={(t) => setField('email_personal', t)} keyboardType="email-address" style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} />

      <Text style={[styles.label, {color: C.textMain}]}>Teléfono</Text>
      <TextInput value={form.telefono ?? ''} onChangeText={(t) => setField('telefono', t)} keyboardType="phone-pad" style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} />

      <Text style={[styles.label, {color: C.textMain}]}>Dependencia</Text>
      <TextInput value={form.dependencia ?? ''} onChangeText={(t) => setField('dependencia', t)} style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} />

      <Text style={[styles.label, {color: C.textMain}]}>Fecha ingreso</Text>
      <TextInput value={form.fecha_ingreso ?? ''} onChangeText={(t) => setField('fecha_ingreso', t)} placeholder="YYYY-MM-DD" style={[styles.input, {color: C.textMain, borderColor: C.glassBorder}]} />

      <View style={{flexDirection:'row', alignItems:'center', marginTop:10}}>
        <Text style={{flex:1, color: C.textMain, fontWeight:'700'}}>Activo</Text>
        <Pressable onPress={() => setField('activo', !form.activo)} style={({pressed}) => [{paddingHorizontal:12, paddingVertical:8, borderRadius:8, backgroundColor: form.activo? C.accent : C.card, opacity: pressed?0.85:1}] }>
          <Text style={{color: form.activo? '#fff' : C.textMain}}>{form.activo ? 'Sí' : 'No'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={guardar} disabled={loading} style={({pressed}) => [{backgroundColor: C.accent, paddingVertical:12, alignItems:'center', borderRadius:8, marginTop:18}, pressed && {opacity:0.8}, loading && {opacity:0.6}] }>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{color:'#fff', fontWeight:'700'}}>{esEdicion ? 'Actualizar' : 'Crear'}</Text>}
      </Pressable>

      {esEdicion ? (
        <Pressable onPress={borrar} style={({pressed}) => [{backgroundColor:'#e55', paddingVertical:12, alignItems:'center', borderRadius:8, marginTop:12}, pressed && {opacity:0.8}] }>
          <Text style={{color:'#fff', fontWeight:'700'}}>Eliminar</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1},
  label: {fontSize:13, marginTop:12, fontWeight:'700'},
  value: {fontSize:15, marginTop:6},
  input: {borderWidth:1, borderRadius:8, padding:10, minHeight:40},
  saveBtn: {marginTop:18, paddingVertical:12, alignItems:'center', borderRadius:8},
  deleteBtn: {marginTop:12, paddingVertical:12, alignItems:'center', borderRadius:8},
});
