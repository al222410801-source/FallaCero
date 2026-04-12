// ============================================
// RUTA: src/screens/home/sections/ContactSection.tsx
// ============================================

import React from 'react';
import {View, Text, TouchableOpacity, Linking, StyleSheet} from 'react-native';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';

const infoItems = [
  {icon: '📍', label: 'Dirección', value: 'Manzana 035 #123, Santa Maria Atarrasquillo, Méx. CP 52044'},
  {icon: '📞', label: 'Teléfono',  value: '(55) 1234-5678',    action: () => Linking.openURL('tel:5512345678')},
  {icon: '✉️',  label: 'Correo',    value: 'contacto@cepandora.edu.mx', action: () => Linking.openURL('mailto:contacto@cepandora.edu.mx')},
];

export const ContactSection = () => {
  const {isDark} = useTheme();
  const C = getAppColors(isDark);

  return (
    <View style={[styles.section, {backgroundColor: C.bg}]}> 
      <View style={styles.header}>
        <Text style={[styles.title, {color: C.textMain}]}>Contacto</Text>
        <Text style={[styles.subtitle, {color: C.textSub}]}>Estamos aquí para ayudarte. Usa los métodos de contacto abajo.</Text>
      </View>

      <View style={[styles.formCard, {backgroundColor: C.card, borderColor: C.border}]}>
        <Text style={[{color: C.muted}]}>Si necesitas ayuda puedes solicitar información, comunícate por teléfono o correo electrónico usando las opciones a continuación.</Text>
      </View>

      <View style={styles.infoList}>
        {infoItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.infoRow, {backgroundColor: C.card, borderColor: C.border}]}
            onPress={item.action}
            activeOpacity={item.action ? 0.7 : 1}
          >
            <View style={[styles.infoIconBox, {backgroundColor: C.accentAlt ? C.accentAlt + '22' : 'rgba(56,189,248,0.12)'}]}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.infoLabel, {color: C.textMain}]}>{item.label}</Text>
              <Text style={[styles.infoValue, {color: C.muted}]}>{item.value}</Text>
            </View>
            {item.action && <Text style={{color: C.primary, fontSize: 18}}>›</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const colors = (isDark: boolean) => ({
  bg:          isDark ? '#111009' : '#f7f5f2',
  card:        isDark ? '#1a1710' : '#ffffff',
  border:      isDark ? 'rgba(201,168,76,0.15)' : 'rgba(201,168,76,0.25)',
  text:        isDark ? '#f0ebe0' : '#4a4337',
  muted:       isDark ? '#a89070' : '#6b5a47',
  inputBg:     isDark ? '#0f0e0b' : '#faf9f7',
  placeholder: isDark ? '#6b5a47' : '#9ca3af',
});

const styles = StyleSheet.create({
  section:     {paddingVertical: 48, paddingHorizontal: 20, gap: 24},
  header:      {alignItems: 'center', gap: 12},
  title:       {fontSize: 26, fontWeight: '800', textAlign: 'center'},
  subtitle:    {fontSize: 14, textAlign: 'center', lineHeight: 22},
  formCard:    {borderRadius: 16, borderWidth: 1, padding: 20, gap: 12},
  input:       {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14,
  },
  textarea:    {height: 100, paddingTop: 12},
  btn:         {
    paddingVertical: 14, borderRadius: 10, alignItems: 'center',
    backgroundColor: '#FF7A00',
    shadowColor: '#FF7A00', shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 4,
  },
  btnText:     {color: '#fff', fontWeight: '700', fontSize: 15},
  infoList:    {gap: 12},
  infoRow:     {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  infoIconBox: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  infoIcon:    {fontSize: 20},
  infoLabel:   {fontSize: 13, fontWeight: '700', marginBottom: 2},
  infoValue:   {fontSize: 13, lineHeight: 18},
});
