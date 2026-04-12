import React from 'react';
import {TouchableOpacity, View, Text, Image} from 'react-native';
import {type Evidencia} from '@/interfaces/evidencia.interface';

type Props = {
  item: Evidencia;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function EvidenceCard({item, onPress, onEdit, onDelete}: Props) {
  return (
    <TouchableOpacity onPress={onPress} className="mx-4 my-2">
      <View className="flex-row bg-surface rounded-lg shadow-md overflow-hidden">
        <View className="w-2 bg-accent" />

        <View className="flex-row flex-1 p-3 items-center">
          <View className="w-16 h-16 rounded-full overflow-hidden bg-border mr-3">
            {item.imagen ? (
              <Image source={{uri: item.imagen}} className="w-full h-full" style={{resizeMode: 'cover'}} />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-xs text-muted-foreground">No imagen</Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">Evidencia #{item.id_evidencia}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-muted-foreground flex-1" numberOfLines={2}>{item.observaciones ?? '—'}</Text>
            </View>

            <View className="flex-row mt-3 items-center">
              <View className="px-2 py-1 mr-2 rounded-md bg-secondary">
                <Text className="text-xs text-secondary-foreground">Ver</Text>
              </View>
              <View className="px-2 py-1 mr-2 rounded-md bg-muted">
                <Text className="text-xs text-muted-foreground">{item.id_evidencia}</Text>
              </View>
            </View>
          </View>

          <View className="ml-3 items-end">
            <TouchableOpacity onPress={onEdit} className="mb-2">
              <Text className="text-primary">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Text className="text-destructive">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
