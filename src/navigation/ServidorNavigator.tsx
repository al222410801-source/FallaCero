import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';
import ServidoresListScreen from '@/dashboard/servidorPublico/ServidoresListScreen';
import ServidorFormScreen from '@/dashboard/servidorPublico/ServidorFormScreen';
import {ServidorPublico} from '../interfaces/servidorPublico.interface';

export type ServidorStackParamList = {
  ServidoresList: undefined;
  ServidorForm: {servidor?: ServidorPublico};
};

const Stack = createNativeStackNavigator<ServidorStackParamList>();

export default function ServidorNavigation() {
  const {isDark} = useTheme();
  const C = getAppColors(isDark);
  return (
    <Stack.Navigator screenOptions={{headerStyle: {backgroundColor: C.bg}, headerTintColor: C.textMain, headerTitleStyle: {fontWeight: 'bold'}}}>
      <Stack.Screen name="ServidoresList" component={ServidoresListScreen} options={{headerShown: false}} />
      <Stack.Screen name="ServidorForm" component={ServidorFormScreen} options={({route}) => ({title: route.params?.servidor ? 'Ver servidor' : 'Servidor'})} />
    </Stack.Navigator>
  );
}
