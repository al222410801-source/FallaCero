// ============================================
// RUTA: src/navigation/DenunciaNavigator.tsx
// ============================================

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DenunciasListScreen from '@/dashboard/denuncia/DenunciaListScreen';
import DenunciaFormScreen from '@/dashboard/denuncia/DenunciaFormScreen';
import {type Denuncia} from '@/interfaces/denuncia.interface';

export type DenunciaStackParamList = {
  DenunciasList: undefined;
  DenunciaForm: {denuncia?: Denuncia};
};

const Stack = createNativeStackNavigator<DenunciaStackParamList>();

export default function DenunciaNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DenunciasList" component={DenunciasListScreen} options={{headerShown: false}} />
      <Stack.Screen name="DenunciaForm" component={DenunciaFormScreen}
        options={({route}) => ({title: route.params?.denuncia ? 'Editar denuncia' : 'Nueva denuncia'})} />
    </Stack.Navigator>
  );
}
