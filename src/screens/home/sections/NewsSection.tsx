// ============================================
// RUTA: src/screens/home/sections/NewsSection.tsx
// ============================================

import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';

const fallaCero = [
  {title: 'Reportar', desc: 'Informa fallas y problemas para que podamos atenderlos.', color: 'primary'},
  {title: 'Mapa', desc: 'Visualiza las reportes geolocalizados y su estatus.', color: 'secondary'},
  {title: 'Cómo Colaborar', desc: 'Aprende cómo puedes ayudar a mejorar la comunidad.', color: 'accentAlt'},
];

export const NewsSection = () => {
  const {isDark} = useTheme();
  const C = getAppColors(isDark);

  return (
    <View style={[styles.section, {backgroundColor: C.bg}]}> 
      <View style={styles.header}>
        <Text style={[styles.title, {color: C.textMain}]}>FallaCero</Text>
        <Text style={[styles.subtitle, {color: C.muted}]}>Detección y reporte ciudadano de fallas en infraestructura pública.</Text>
      </View>

      <View style={{flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 8}}>
        {fallaCero.map((it) => {
          const topColor = it.color === 'primary' ? C.primary : it.color === 'secondary' ? C.secondary : C.accentAlt;
          return (
            <View key={it.title} style={[styles.card, {backgroundColor: C.card, borderColor: C.border, flex: 1}]}> 
              <View style={[styles.topBar, {backgroundColor: topColor}]} />
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, {color: C.textMain}]}>{it.title}</Text>
                <Text style={[styles.cardDesc, {color: C.muted}]}>{it.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const colors = (isDark: boolean) => ({
  bg:     isDark ? '#0a0806' : '#ffffff',
  card:   isDark ? '#1a1710' : '#faf9f7',
  border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
  text:   isDark ? '#f0ebe0' : '#2a1f0e',
  muted:  isDark ? '#a89070' : '#6b5a47',
});

const styles = StyleSheet.create({
  section:   {paddingVertical: 48, gap: 24},
  header:    {alignItems: 'center', gap: 12, paddingHorizontal: 20},
  title:     {fontSize: 26, fontWeight: '800', textAlign: 'center'},
  subtitle:  {fontSize: 14, textAlign: 'center', lineHeight: 22},
  scroll:    {paddingHorizontal: 20, gap: 14, paddingVertical: 4},
  card:      {
    width: 240, borderRadius: 14, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  topBar:    {height: 4, width: '100%'},
  cardBody:  {padding: 16, gap: 10},
  tag:       {alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999},
  tagText:   {fontSize: 11, fontWeight: '700'},
  cardTitle: {fontSize: 15, fontWeight: '700', lineHeight: 20},
  cardDesc:  {fontSize: 13, lineHeight: 19},
  dateRow:   {flexDirection: 'row', alignItems: 'center', gap: 6},
  dateIcon:  {fontSize: 12},
  dateText:  {fontSize: 12},
});
