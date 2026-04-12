// RUTA: src/navigation/DetEvidenciaNavigator.tsx

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DetEvidenciasListScreen from '@/dashboard/detEvidencia/DetEvidenciasListScreen';
import DetEvidenciaFormScreen from '@/dashboard/detEvidencia/DetEvidenciaFormScreen';
import {type DetEvidencia} from '@/interfaces/detEvidencia.interface';

export type DetEvidenciaStackParamList = {
  DetEvidenciasList: undefined;
  DetEvidenciaForm: {detEvidencia?: DetEvidencia};
};

const Stack = createNativeStackNavigator<DetEvidenciaStackParamList>();

export default function DetEvidenciaNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DetEvidenciasList" component={DetEvidenciasListScreen} options={{headerShown: false}} />
      <Stack.Screen name="DetEvidenciaForm" component={DetEvidenciaFormScreen}
        options={({route}) => ({title: route.params?.detEvidencia ? 'Editar det. evidencia' : 'Nueva det. evidencia'})} />
    </Stack.Navigator>
  );
}
