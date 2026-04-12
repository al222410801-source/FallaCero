// ============================================
// RUTA: src/screens/home/sections/AcademicOfferSection.tsx
// Los <Tabs> del web se reemplazan por un selector horizontal scrollable.
// ============================================

import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';
import {useNavigation} from '@react-navigation/native';

const levels = [
  {
    id: 'reportar', label: 'Reportar', icon: '📷',
    ages: 'Inicia un nuevo reporte',
    desc: 'Captura fotos, agrega ubicación y detalles para enviar una falla a la autoridad correspondiente.',
    features: ['Foto y descripción', 'Ubicación', 'Categoría de falla', 'Adjuntar evidencias'],
  },
  {
    id: 'seguimiento', label: 'Seguimiento', icon: '🔎',
    ages: 'Revisa el estado',
    desc: 'Consulta el historial de atención de tus reportes y comunica con los responsables cuando sea necesario.',
    features: ['Historial por denuncia', 'Estados actualizados', 'Notificaciones'],
  },
  {
    id: 'autoridades', label: 'Autoridades', icon: '🏛️',
    ages: 'Contacta responsables',
    desc: 'Encuentra información de las dependencias y servidores públicos encargados de atender las fallas.',
    features: ['Teléfonos', 'Dependencias', 'Responsables por área'],
  },
  {
    id: 'evidencias', label: 'Evidencias', icon: '🗂️',
    ages: 'Gestiona archivos',
    desc: 'Visualiza y administra las evidencias asociadas a tus reportes: imágenes, documentos y anexos.',
    features: ['Galería por denuncia', 'Descargar', 'Eliminar'],
  },
  {
    id: 'estadisticas', label: 'Estadísticas', icon: '📊',
    ages: 'Indicadores clave',
    desc: 'Resumen de atención por estados, tiempos de respuesta y volumen de reportes por zona.',
    features: ['Reportes por estado', 'Porcentaje atendido', 'Filtrar por periodo'],
  },
];

export const AcademicOfferSection = () => {
  const [selected, setSelected] = useState(levels[0].id);
  const {isDark} = useTheme();
  const C = getAppColors(isDark);
  const navigation = useNavigation<any>();
  const level = levels.find((l) => l.id === selected) ?? levels[0];

  return (
    <View style={[styles.section, {backgroundColor: C.bg}]}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: C.textMain}]}>Acciones de FallaCero</Text>
        <Text style={[styles.subtitle, {color: C.textSub}]}> 
          Herramientas para reportar, dar seguimiento y gestionar fallas
          en tu comunidad desde la app.
        </Text>
      </View>

      {/* Mini-cards horizontales para elegir nivel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
        {levels.map((l) => {
          const active = selected === l.id;
          return (
            <TouchableOpacity key={l.id} onPress={() => setSelected(l.id)} activeOpacity={0.8} style={[styles.levelMini, {borderColor: active ? C.primary : C.border, backgroundColor: active ? C.accentAlt + '22' : C.card}]}> 
              <Text style={styles.tabIcon}>{l.icon}</Text>
              <Text style={[styles.levelMiniLabel, {color: C.textMain}]}>{l.label}</Text>
              <Text style={[styles.levelMiniAges, {color: C.muted}]}>{l.ages}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Contenido del nivel seleccionado */}
      <View style={[styles.card, {backgroundColor: C.card, borderColor: C.border}]}>
          <View style={[styles.cardHeader]}>
          <View style={[styles.iconBadge, {backgroundColor: C.accentAlt + '22'}]}>
            <Text style={styles.cardIcon}>{level.icon}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={[styles.cardTitle, {color: C.textMain}]}>{level.label}</Text>
            <Text style={[styles.cardAges, {color: C.primary}]}>{level.ages}</Text>
          </View>
        </View>

        <Text style={[styles.cardDesc, {color: C.muted}]}>{level.desc}</Text>

        <View style={styles.features}>
          {level.features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <View style={[styles.featureDot, {backgroundColor: C.primary}]} />
              <Text style={[styles.featureText, {color: C.textMain}]}>{f}</Text>
            </View>
          ))}
        </View>
        {/* CTA removido: el botón fue eliminado por solicitud del equipo */}
      </View>
    </View>
  );
};

const colors = (isDark: boolean) => ({
  bg:    isDark ? '#0a0806' : '#ffffff',
  card:  isDark ? '#1a1710' : '#faf9f7',
  border: isDark ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.3)',
  text:  isDark ? '#f0ebe0' : '#2a1f0e',
  muted: isDark ? '#a89070' : '#6b5a47',
});

const styles = StyleSheet.create({
  section:     {paddingVertical: 48, gap: 24},
  header:      {alignItems: 'center', gap: 12, paddingHorizontal: 20},
  title:       {fontSize: 26, fontWeight: '800', textAlign: 'center'},
  subtitle:    {fontSize: 14, textAlign: 'center', lineHeight: 22},
  tabScroll:   {flexGrow: 0},
  tabContent:  {paddingHorizontal: 20, gap: 10, paddingVertical: 4},
  tab:         {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5,
  },
  tabIcon:     {fontSize: 16},
  tabLabel:    {fontSize: 13, fontWeight: '600'},
  levelMini:   {width: 140, borderRadius: 12, padding: 12, marginRight: 10, borderWidth: 1, alignItems: 'flex-start'},
  levelMiniLabel: {fontSize: 14, fontWeight: '800', marginTop: 6},
  levelMiniAges: {fontSize: 12, marginTop: 4},
  card:        {
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1,
    padding: 20, gap: 14,
  },
  cardHeader:  {flexDirection: 'row', alignItems: 'center', gap: 14},
  iconBadge:   {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  cardIcon:    {fontSize: 26},
  cardTitle:   {fontSize: 20, fontWeight: '800'},
  cardAges:    {fontSize: 13, fontWeight: '600', marginTop: 2},
  cardDesc:    {fontSize: 14, lineHeight: 22},
  features:    {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  featureRow:  {flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%'},
  featureDot:  {width: 8, height: 8, borderRadius: 4},
  featureText: {fontSize: 13, fontWeight: '500'},
  ctaBtn: {marginTop: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center'},
  ctaText: {fontWeight: '800'},
});
