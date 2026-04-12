import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';
import CiudadanosListScreen from '../dashboard/ciudadano/CiudadanosListScreen';
import CiudadanoFormScreen from '../dashboard/ciudadano/CiudadanoFormScreen';
import {Ciudadano} from '@/interfaces/ciudadano.interface';

export type CiudadanoStackParamList = {
  CiudadanosList: undefined;
  CiudadanoForm: {ciudadano?: Ciudadano};
};

const Stack = createNativeStackNavigator<CiudadanoStackParamList>();

export default function CiudadanoNavigation() {
  const {isDark} = useTheme();
  const C = getAppColors(isDark);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: C.bg},
        headerTintColor: C.textMain,
        headerTitleStyle: {fontWeight: 'bold'},
      }}
    >
      {/* Lista principal — sin header porque el Drawer ya tiene su propio header */}
      <Stack.Screen
        name="CiudadanosList"
        component={CiudadanosListScreen}
        options={{headerShown: false}}
      />

      {/* Formulario — muestra "Nuevo ciudadano" o "Editar ciudadano" según el modo */}
      <Stack.Screen
        name="CiudadanoForm"
        component={CiudadanoFormScreen}
        options={({route}) => ({
          title: route.params?.ciudadano ? 'Editar ciudadano' : 'Nuevo ciudadano',
        })}
      />
    </Stack.Navigator>
  );
}
