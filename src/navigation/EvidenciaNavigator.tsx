// RUTA: src/navigation/EvidenciaNavigator.tsx

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import EvidenciasListScreen from '@/dashboard/evidencia/EvidenciasListScreen';
import EvidenciaFormScreen from '@/dashboard/evidencia/EvidenciaFormScreen';
import {type Evidencia} from '@/interfaces/evidencia.interface';

export type EvidenciaStackParamList = {
  EvidenciasList: undefined;
  EvidenciaForm: {evidencia?: Evidencia};
};

const Stack = createNativeStackNavigator<EvidenciaStackParamList>();

export default function EvidenciaNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EvidenciasList" component={EvidenciasListScreen} options={{headerShown: false}} />
      <Stack.Screen name="EvidenciaForm" component={EvidenciaFormScreen}
        options={({route}) => ({title: route.params?.evidencia ? 'Editar evidencia' : 'Nueva evidencia'})} />
    </Stack.Navigator>
  );
}
