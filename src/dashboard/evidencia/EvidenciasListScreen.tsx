import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, Alert} from 'react-native';
import {getEvidencias, deleteEvidencia} from '@/graphql/evidencia';
import {type Evidencia} from '@/interfaces/evidencia.interface';
import EvidenceCard from '@/components/EvidenceCard';

type Props = {navigation: any; route?: any};

export default function EvidenciasListScreen({navigation, route}: Props) {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (pagina = 1) => {
    setLoading(true);
    try {
      const data = await getEvidencias(pagina, 10);
      setEvidencias(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Error al cargar evidencias');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(page); }, [cargar, page]);

  useEffect(() => {
    const msg = route?.params?.flashMessage;
    if (msg) {
      // simple alert flash
      Alert.alert('Éxito', String(msg));
      navigation.setParams && navigation.setParams({flashMessage: undefined});
    }
  }, [route?.params?.flashMessage]);

  const confirmarEliminar = (id: number) => {
    // On web Alert.alert buttons may not work — use window.confirm as fallback
    try {
      if (typeof window !== 'undefined' && window.confirm) {
        const ok = window.confirm('¿Deseas eliminar esta evidencia?');
        if (!ok) return;
        (async () => { try { await deleteEvidencia(id); await cargar(page); } catch (e: any) { Alert.alert('Error', e.message || 'No se pudo eliminar'); } })();
        return;
      }
    } catch (e) {
      // ignore and fall back to Alert
    }

    Alert.alert('Eliminar evidencia', '¿Deseas eliminar esta evidencia?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteEvidencia(id); await cargar(page); }
        catch (e: any) { Alert.alert('Error', e.message || 'No se pudo eliminar'); }
      }}
    ]);
  };

  const renderItem = ({item}: {item: Evidencia}) => (
    <EvidenceCard
      item={item}
      onPress={() => navigation.navigate('EvidenciaForm', {evidencia: item})}
      onEdit={() => navigation.navigate('EvidenciaForm', {evidencia: item})}
      onDelete={() => confirmarEliminar(item.id_evidencia)}
    />
  );

  if (loading && evidencias.length === 0) return (<View className="flex-1 items-center justify-center"><Text>Cargando...</Text></View>);
  if (error) return (<View className="flex-1 items-center justify-center px-6"><Text className="text-destructive">{error}</Text></View>);

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-bold text-foreground">Evidencias</Text>
        <Text className="text-sm text-muted-foreground">{evidencias.length} registros · página {page}</Text>
      </View>

      <FlatList data={evidencias} keyExtractor={(i) => i.id_evidencia.toString()} renderItem={renderItem} />

      <View className="px-6 py-4 flex-row justify-between items-center">
        <TouchableOpacity disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))} className={`px-4 py-2 rounded-lg ${page <= 1 ? 'bg-muted' : 'bg-primary'}`}>
          <Text className={page <= 1 ? 'text-muted-foreground' : 'text-primary-foreground'}>← Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPage((p) => p + 1)} className={`px-4 py-2 rounded-lg ${evidencias.length < 10 ? 'bg-muted' : 'bg-primary'}`}>
          <Text className={evidencias.length < 10 ? 'text-muted-foreground' : 'text-primary-foreground'}>Siguiente →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('EvidenciaForm')} className="absolute right-6 bottom-6 items-center justify-center rounded-full bg-primary w-14 h-14">
        <Text className="text-primary-foreground font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}
