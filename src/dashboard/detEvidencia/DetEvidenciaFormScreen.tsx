import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import {createDetEvidencia, updateDetEvidencia} from '@/graphql/detEvidencia';
import {getEvidencia, createEvidencia} from '@/graphql/evidencia';
import {getDenuncia, createDenuncia} from '@/graphql/denuncia';
import {type DetEvidencia} from '@/interfaces/detEvidencia.interface';

type FormState = {
  denuncia_id: number;
  evidencia_id: number;
  descripcion?: string;
};

type LocalEvidence = { imagen?: string; observaciones?: string };
type LocalDenuncia = { ciudadano_id?: number; titulo?: string; fecha_denuncia?: string; categoria?: string; prioridad?: string };

type Props = {navigation: any; route: {params?: {detEvidencia?: DetEvidencia}}};

export default function DetEvidenciaFormScreen({navigation, route}: Props) {
  const editing = route?.params?.detEvidencia;
  const [form, setForm] = useState<FormState>({denuncia_id: 0, evidencia_id: 0, descripcion: ''});
  const [localEv, setLocalEv] = useState<LocalEvidence>({imagen: '', observaciones: ''});
  const [localDen, setLocalDen] = useState<LocalDenuncia>({ciudadano_id: undefined, titulo: '', fecha_denuncia: undefined, categoria: '', prioridad: ''});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (editing) setForm({denuncia_id: editing.denuncia_id, evidencia_id: editing.evidencia_id, descripcion: editing.descripcion ?? ''}); }, [editing]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(prev => ({...prev, [k]: v}));

  const guardar = async () => {
    setSaving(true);
    // Use local variables to avoid mutating React state directly
    let denunciaId = form.denuncia_id;
    let evidenciaId = form.evidencia_id;

    try {
      if (!evidenciaId && (localEv.imagen || localEv.observaciones)) {
        const ev = await createEvidencia({ imagen: localEv.imagen || '', observaciones: localEv.observaciones || '' });
        if (ev && ev.id_evidencia) {
          evidenciaId = Number(ev.id_evidencia);
          setForm(prev => ({...prev, evidencia_id: evidenciaId}));
        }
      }

      if (!denunciaId && localDen.titulo && localDen.ciudadano_id) {
        const denPayload: any = {
          ciudadano_id: Number(localDen.ciudadano_id),
          // seguimiento_id removed
          titulo: localDen.titulo,
          fecha_denuncia: localDen.fecha_denuncia || new Date().toISOString(),
          categoria: localDen.categoria || 'Otro',
          prioridad: localDen.prioridad || 'Media',
        };
        const den = await createDenuncia(denPayload);
        if (den && den.id_denuncia) {
          denunciaId = Number(den.id_denuncia);
          setForm(prev => ({...prev, denuncia_id: denunciaId}));
        }
      }

      // After attempting automatic creation, ensure we have both IDs
      if (!denunciaId || !evidenciaId) {
        setSaving(false);
        Alert.alert('Requerido', 'IDs de denuncia y evidencia son obligatorios. Si no existen, completa los campos para crearlas automáticamente.');
        return;
      }

      // Verify that referenced parent records exist to avoid FK violation
      const [den, ev] = await Promise.all([
        getDenuncia(Number(denunciaId)).catch(() => null),
        getEvidencia(Number(evidenciaId)).catch(() => null),
      ]);

      if (!den || !ev) {
        setSaving(false);
        const missing = [] as string[];
        if (!den) missing.push('denuncia');
        if (!ev) missing.push('evidencia');
        Alert.alert(
          'Padres faltantes',
          `No se encontró la(s) ${missing.join(' y ')} indicada(s). Debes crearla(s) antes para evitar error de clave foránea.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ir a crear', onPress: () => {
                if (!den) navigation.navigate('DenunciaForm');
                else if (!ev) navigation.navigate('EvidenciaForm');
              } },
          ]
        );
        return;
      }
    } catch (checkErr) {
      console.error('FK check / auto-create error', checkErr);
      setSaving(false);
      Alert.alert('Error', 'No se pudo verificar o crear claves foráneas. Intenta de nuevo.');
      return;
    }
    try {
      if (editing && editing.id_det_evidencia) {
        const payload = { denuncia_id: denunciaId, evidencia_id: evidenciaId };
        await updateDetEvidencia(editing.id_det_evidencia, payload as any);
        navigation.navigate('DetEvidenciasList', {flashMessage: 'Registro actualizado'});
      } else {
        const payload = { denuncia_id: denunciaId, evidencia_id: evidenciaId };
        await createDetEvidencia(payload as any);
        navigation.navigate('DetEvidenciasList', {flashMessage: 'Registro creado'});
      }
    } catch (e: any) { console.error('detEvidencia save', e); Alert.alert('Error', e.message || 'No se pudo guardar'); }
    finally { setSaving(false); }
  };

  return (
    <View className="flex-1 bg-background px-6 pt-6">
      <Text className="mb-6 text-2xl font-bold text-foreground">{editing ? 'Editar Det. Evidencia' : 'Nueva Det. Evidencia'}</Text>

      <Text className="mb-2 text-sm text-muted-foreground">ID Denuncia</Text>
      <TextInput editable={!saving} value={String(form.denuncia_id)} onChangeText={(v) => setField('denuncia_id', Number(v || 0))} keyboardType="numeric" className="border border-border rounded-lg px-3 py-2 mb-4 text-foreground bg-background" />

      <Text className="mb-2 text-sm text-muted-foreground">ID Evidencia</Text>
      <TextInput editable={!saving} value={String(form.evidencia_id)} onChangeText={(v) => setField('evidencia_id', Number(v || 0))} keyboardType="numeric" className="border border-border rounded-lg px-3 py-2 mb-4 text-foreground bg-background" />
      {/* Optional: create evidencia here if you don't have an ID */}
      <Text className="mb-2 text-sm text-muted-foreground">Crear evidencia (opcional)</Text>
      <TextInput editable={!saving} value={localEv.imagen} onChangeText={(v) => setLocalEv(prev => ({...prev, imagen: v}))} placeholder="URL o base64 de imagen" className="border border-border rounded-lg px-3 py-2 mb-2 text-foreground bg-background" />
      <TextInput editable={!saving} value={localEv.observaciones} onChangeText={(v) => setLocalEv(prev => ({...prev, observaciones: v}))} placeholder="Observaciones" className="border border-border rounded-lg px-3 py-2 mb-4 text-foreground bg-background" />

      <Text className="mb-2 text-sm text-muted-foreground">Descripción</Text>
      <TextInput editable={!saving} value={form.descripcion ?? ''} onChangeText={(v) => setField('descripcion', v)} multiline numberOfLines={3} className="border border-border rounded-lg px-3 py-2 mb-6 text-foreground bg-background" />

      {/* Optional: create denuncia here if you don't have an ID */}
      <Text className="mb-2 text-sm text-muted-foreground">Crear denuncia (opcional)</Text>
      <TextInput editable={!saving} value={localDen.titulo ?? ''} onChangeText={(v) => setLocalDen(prev => ({...prev, titulo: v}))} placeholder="Título (requerido para crear)" className="border border-border rounded-lg px-3 py-2 mb-2 text-foreground bg-background" />
      <TextInput editable={!saving} value={localDen.ciudadano_id ? String(localDen.ciudadano_id) : ''} onChangeText={(v) => setLocalDen(prev => ({...prev, ciudadano_id: Number(v || 0)}))} placeholder="ID Ciudadano (requerido)" keyboardType="numeric" className="border border-border rounded-lg px-3 py-2 mb-2 text-foreground bg-background" />
      <TextInput editable={!saving} value={localDen.categoria ?? ''} onChangeText={(v) => setLocalDen(prev => ({...prev, categoria: v}))} placeholder="Categoría" className="border border-border rounded-lg px-3 py-2 mb-2 text-foreground bg-background" />
      <TextInput editable={!saving} value={localDen.prioridad ?? ''} onChangeText={(v) => setLocalDen(prev => ({...prev, prioridad: v}))} placeholder="Prioridad" className="border border-border rounded-lg px-3 py-2 mb-4 text-foreground bg-background" />

      <TouchableOpacity onPress={guardar} disabled={saving} className={`px-4 py-3 rounded-lg items-center ${saving ? 'bg-muted' : 'bg-primary'}`}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text className="text-primary-foreground font-medium">{editing ? 'Actualizar' : 'Crear'}</Text>
        }
      </TouchableOpacity>
    </View>
  );
}
