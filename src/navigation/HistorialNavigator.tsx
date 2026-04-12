// ============================================
// RUTA: src/navigation/HistorialNavigator.tsx
// ============================================

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HistorialListScreen from '@/dashboard/historialEstado/HistorialListScreen';
import HistorialFormScreen from '@/dashboard/historialEstado/HistorialFormScreen';
import {type HistorialEstado} from '@/interfaces/historialEstado.interface';

export type HistorialStackParamList = {
  HistorialesList: undefined;
  HistorialForm: {historial?: HistorialEstado};
};

const Stack = createNativeStackNavigator<HistorialStackParamList>();

export default function HistorialNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HistorialesList" component={HistorialListScreen} options={{headerShown: false}} />
      <Stack.Screen name="HistorialForm" component={HistorialFormScreen}
        options={({route}) => ({title: route.params?.historial ? 'Editar historial' : 'Nuevo historial'})} />
    </Stack.Navigator>
  );
}
