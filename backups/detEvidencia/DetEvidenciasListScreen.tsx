import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, Alert} from 'react-native';
import {getDetEvidencias, deleteDetEvidencia} from '@/graphql/detEvidencia';
import {type DetEvidencia} from '@/interfaces/detEvidencia.interface';

type Props = {navigation: any; route?: any};

export default function DetEvidenciasListScreen({navigation, route}: Props) {
  const [items, setItems] = useState<DetEvidencia[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (pagina = 1) => {
    setLoading(true);
    try {
      const data = await getDetEvidencias(pagina, 10);
      setItems(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(page); }, [cargar, page]);

  useEffect(() => {
    const msg = route?.params?.flashMessage; if (msg) { Alert.alert('Éxito', String(msg)); navigation.setParams && navigation.setParams({flashMessage: undefined}); }
  }, [route?.params?.flashMessage]);

  const confirmarEliminar = (id: number) => {
    Alert.alert('Eliminar', '¿Deseas eliminar este registro?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: async () => { try { await deleteDetEvidencia(id); await cargar(page); } catch (e: any) { Alert.alert('Error', e.message || 'No se pudo eliminar'); } }}
    ]);
  };

  const renderItem = ({item}: {item: DetEvidencia}) => (
    <View className="p-4 border-b border-border bg-background">
      <Text className="text-base font-semibold text-foreground">Det. Evidencia #{item.id_det_evidencia}</Text>
      <Text className="text-sm text-muted-foreground">Denuncia #{item.denuncia_id} · Evidencia #{item.evidencia_id}</Text>
      {item.descripcion ? <Text className="text-sm mt-1">{item.descripcion}</Text> : null}
      <View className="flex-row mt-2">
        <TouchableOpacity onPress={() => navigation.navigate('DetEvidenciaForm', {detEvidencia: item})} className="mr-3"><Text className="text-primary">Editar</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => confirmarEliminar(item.id_det_evidencia)}><Text className="text-destructive">Eliminar</Text></TouchableOpacity>
      </View>
    </View>
  );

  if (loading && items.length === 0) return (<View className="flex-1 items-center justify-center"><Text>Cargando...</Text></View>);
  if (error) return (<View className="flex-1 items-center justify-center px-6"><Text className="text-destructive">{error}</Text></View>);

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-bold text-foreground">Det. Evidencias</Text>
        <Text className="text-sm text-muted-foreground">{items.length} registros · página {page}</Text>
      </View>

      <FlatList data={items} keyExtractor={(i) => i.id_det_evidencia.toString()} renderItem={renderItem} />

      <View className="px-6 py-4 flex-row justify-between items-center">
        <TouchableOpacity disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))} className={`px-4 py-2 rounded-lg ${page <= 1 ? 'bg-muted' : 'bg-primary'}`}>
          <Text className={page <= 1 ? 'text-muted-foreground' : 'text-primary-foreground'}>← Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPage((p) => p + 1)} className={`px-4 py-2 rounded-lg ${items.length < 10 ? 'bg-muted' : 'bg-primary'}`}>
          <Text className={items.length < 10 ? 'text-muted-foreground' : 'text-primary-foreground'}>Siguiente →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('DetEvidenciaForm')} className="absolute right-6 bottom-6 items-center justify-center rounded-full bg-primary w-14 h-14">
        <Text className="text-primary-foreground font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}
