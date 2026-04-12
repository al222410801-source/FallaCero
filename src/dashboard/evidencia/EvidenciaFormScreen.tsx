import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Pressable, FlatList} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {ArrowLeft, Check, X} from 'lucide-react-native';
import {createEvidencia, updateEvidencia} from '@/graphql/evidencia';
import {getDenunciasPaginated} from '@/graphql/denuncia';
import {createDetEvidencia} from '@/graphql/detEvidencia';
import {type Evidencia, type CreateEvidenciaInput} from '@/interfaces/evidencia.interface';

type Props = {navigation: any; route: {params?: {evidencia?: Evidencia}}};

export default function EvidenciaFormScreen({navigation, route}: Props) {
  const editing = route?.params?.evidencia;
  const [form, setForm] = useState<CreateEvidenciaInput>({imagen: '', observaciones: ''});
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [denunciaModalOpen, setDenunciaModalOpen] = useState(false);
  const [selectedDenunciaId, setSelectedDenunciaId] = useState<number | null>(null);
  const [denunciaSearch, setDenunciaSearch] = useState('');
  const [denunciaPage, setDenunciaPage] = useState(1);
  const [denunciaLoading, setDenunciaLoading] = useState(false);

  const pickImage = async () => {
    try {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a las imágenes.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });
      // compatibilidad con distintas versiones de expo-image-picker
      const canceled = (result as any)?.cancelled ?? (result as any)?.canceled ?? false;
      const uri = (result as any)?.assets?.[0]?.uri ?? (result as any)?.uri;
      if (canceled || !uri) return;

      // If the picker returned a blob: URL (web), convert to data URL (base64) before saving.
      if (typeof uri === 'string' && uri.startsWith('blob:')) {
        try {
          const resp = await fetch(uri);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onloadend = () => resolve(String(reader.result));
            reader.readAsDataURL(blob);
          });
          setField('imagen', dataUrl as string);
        } catch (e) {
          console.error('convert blob to dataurl', e);
          // fallback: store original uri
          setField('imagen', uri as string);
        }
      } else {
        setField('imagen', uri as string);
      }
    } catch (err: any) {
      console.error('pickImage', err);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  useEffect(() => {
    if (editing) setForm({imagen: editing.imagen ?? '', observaciones: editing.observaciones ?? ''});
  }, [editing]);

  // load denuncias when modal opens or search/page changes (debounced)
  useEffect(() => {
    let mounted = true;
    let t: any = null;
    const doLoad = async () => {
      setDenunciaLoading(true);
      try {
        const list = await getDenunciasPaginated(denunciaPage, 20, denunciaSearch);
        if (!mounted) return;
        if (denunciaPage === 1) setDenuncias(list || []);
        else setDenuncias((prev) => [...prev, ...(list || [])]);
      } catch (e) {
        console.error('load denuncias', e);
      } finally { if (mounted) setDenunciaLoading(false); }
    };

    if (denunciaModalOpen) {
      // debounce search
      t = setTimeout(() => doLoad(), 250);
    }
    return () => { mounted = false; clearTimeout(t); };
  }, [denunciaModalOpen, denunciaSearch, denunciaPage]);

  const setField = <K extends keyof CreateEvidenciaInput>(k: K, v: CreateEvidenciaInput[K]) => setForm(prev => ({...prev, [k]: v}));

  const guardar = async () => {
    if (!form.imagen) { Alert.alert('Requerido', 'La imagen es obligatoria.'); return; }
    setSaving(true);
    try {
      if (editing && editing.id_evidencia) {
        const updated = await updateEvidencia(editing.id_evidencia, form as any);
        // if a denuncia was selected, try to (re)link via DetEvidencia
        if (selectedDenunciaId) {
          try { await createDetEvidencia({denuncia_id: selectedDenunciaId, evidencia_id: updated?.id_evidencia ?? editing.id_evidencia}); } catch (e) { console.error('link detEvidencia update', e); }
        }
        Alert.alert('Éxito', `Evidencia actualizada (id ${updated?.id_evidencia ?? editing.id_evidencia})`);
        navigation.navigate('EvidenciasList', {flashMessage: 'Evidencia actualizada'});
      } else {
        const created = await createEvidencia(form as any);
        if (selectedDenunciaId && created?.id_evidencia) {
          try { await createDetEvidencia({denuncia_id: selectedDenunciaId, evidencia_id: created.id_evidencia}); } catch (e) { console.error('link detEvidencia create', e); }
        }
        Alert.alert('Éxito', `Evidencia creada (id ${created?.id_evidencia ?? '—'})`);
        navigation.navigate('EvidenciasList', {flashMessage: 'Evidencia creada'});
      }
    } catch (e: any) {
      console.error('evidencia save error', e);
      Alert.alert('Error', e.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeft color="#111827" width={20} height={20} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">{editing ? 'Editar evidencia' : 'Nueva evidencia'}</Text>
        <TouchableOpacity onPress={guardar} disabled={saving} className="p-2">
          {saving ? <ActivityIndicator /> : <Check color="#065f46" width={20} height={20} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{padding: 24}}>

        {/* Denuncia selector */}
        <Text className="mb-2 text-sm text-muted-foreground">Vincular a Denuncia (opcional)</Text>
        <TouchableOpacity onPress={() => { setDenunciaModalOpen(true); setDenunciaPage(1); setDenunciaSearch(''); }} className="border border-border rounded-lg px-3 py-3 mb-4">
          <Text className="text-foreground">{selectedDenunciaId ? (`Denuncia #${selectedDenunciaId}`) : 'Seleccionar denuncia...'}</Text>
        </TouchableOpacity>

        {/* Imagen / preview */}
        <Text className="mb-2 text-sm text-muted-foreground">Imagen (base64 o URL)</Text>
        {form.imagen ? (
          <TouchableOpacity onPress={() => setPreviewOpen(true)} activeOpacity={0.9}>
            <Image source={{uri: form.imagen}} className="w-full h-48 rounded-lg mb-4 bg-border" style={{resizeMode: 'cover'}} />
          </TouchableOpacity>
        ) : (
          <View className="w-full h-48 rounded-lg mb-4 bg-border items-center justify-center"><Text className="text-sm text-muted-foreground">Previsualización vacía</Text></View>
        )}

        <View className="flex-row mb-4">
          <TouchableOpacity onPress={pickImage} className="px-3 py-2 rounded-lg bg-primary">
            <Text className="text-primary-foreground">Seleccionar imagen</Text>
          </TouchableOpacity>
        </View>

        <Text className="mb-2 text-sm text-muted-foreground">Observaciones</Text>
        <TextInput value={form.observaciones} onChangeText={(v) => setField('observaciones', v)} placeholder="Observaciones" multiline numberOfLines={4} className="border border-border rounded-lg px-3 py-2 mb-6 text-foreground bg-background" />

        <View className="flex-row space-x-3">
          <TouchableOpacity onPress={guardar} disabled={saving} className={`flex-1 px-4 py-3 rounded-lg items-center ${saving ? 'bg-primary/60' : 'bg-primary'}`}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-primary-foreground font-medium">{editing ? 'Actualizar' : 'Crear'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} className="px-4 py-3 rounded-lg bg-secondary items-center justify-center">
            <Text className="text-foreground">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PreviewModal visible={previewOpen} uri={form.imagen} onClose={() => setPreviewOpen(false)} />

      {/* Denuncia selection modal */}
      <Modal visible={denunciaModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 items-center justify-center px-4">
          <View className="w-full max-h-3/4 bg-background rounded-lg p-4">
            <Text className="text-lg font-semibold mb-3">Seleccionar Denuncia</Text>
            <View>
              <TextInput value={denunciaSearch} onChangeText={(t) => { setDenunciaSearch(t); setDenunciaPage(1); }} placeholder="Buscar denuncia por título o id..." className="border border-border rounded-lg px-3 py-2 mb-3 text-foreground bg-background" />
              {denuncias.length === 0 && !denunciaLoading ? <Text className="text-sm text-muted-foreground">No hay denuncias.</Text> : (
                <FlatList data={denuncias} keyExtractor={(i) => String(i.id_denuncia)} style={{maxHeight: 320}} onEndReached={() => { if (!denunciaLoading) setDenunciaPage((p) => p + 1); }} onEndReachedThreshold={0.4} renderItem={({item: d}) => (
                  <TouchableOpacity key={d.id_denuncia} onPress={() => { setSelectedDenunciaId(Number(d.id_denuncia)); setDenunciaModalOpen(false); }} className="py-3 border-b border-border">
                    <Text className="text-foreground">#{d.id_denuncia} — {d.titulo}</Text>
                    <Text className="text-sm text-muted-foreground">{d.fecha_denuncia}</Text>
                  </TouchableOpacity>
                )} />
              )}
              {denunciaLoading ? <Text className="text-sm text-muted-foreground mt-2">Cargando...</Text> : null}
            </View>
            <View className="flex-row justify-end mt-3">
              <TouchableOpacity onPress={() => setDenunciaModalOpen(false)} className="px-4 py-2 rounded-lg bg-secondary">
                <Text className="text-foreground">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* Preview modal */
function PreviewModal({visible, uri, onClose}: {visible: boolean; uri?: string; onClose: () => void}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/80 items-center justify-center">
        <Pressable onPress={onClose} className="absolute top-10 right-6 p-2 bg-black/50 rounded-full">
          <X color="#fff" width={24} height={24} />
        </Pressable>
        {uri ? <Image source={{uri}} className="w-11/12 h-3/4 rounded-lg" style={{resizeMode: 'contain'}} /> : <Text className="text-white">Sin imagen</Text>}
      </View>
    </Modal>
  );
}
