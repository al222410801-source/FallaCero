// ============================================
// RUTA: src/screens/home/sections/AboutSection.tsx
// REDISEÑO: versión moderna, accesible y compacta
// ============================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@/context/ThemeContext';
import {useEffect, useState} from 'react';
import {getDenunciasStats} from '@/graphql/denuncia';
import {getAppColors} from '@/theme/colors';

const FEATURES = [
  {icon: '🎯', title: 'Misión', desc: 'Facilitar la identificación y resolución de fallas urbanas mediante herramientas accesibles para ciudadanos y autoridades.'},
  {icon: '🔭', title: 'Visión', desc: 'Ser la plataforma de referencia que mejore la calidad de los servicios públicos y la participación ciudadana.'},
  {icon: '🎯', title: 'Objetivo', desc: 'Reducir tiempos de atención y aumentar la transparencia en la gestión de incidencias reportadas por la comunidad.'},
];

export function AboutSection() {
  const {isDark} = useTheme();
  const C = getAppColors(isDark);
  const navigation = useNavigation<any>();
  const [total, setTotal] = useState<number | null>(null);
  const [atendidos, setAtendidos] = useState<number | null>(null);


  const goReport = () => {
    try { navigation.navigate('DetEvidencias', {screen: 'DetEvidenciaForm'}); }
    catch { navigation.navigate('DetEvidencias'); }
  };

  const goMyReports = () => {
    try { navigation.navigate('Denuncias', {screen: 'DenunciasList'}); }
    catch { navigation.navigate('Denuncias'); }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getDenunciasStats();
        if (!mounted) return;
        setTotal(s.total);
        setAtendidos(s.atendidos);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: C.bg}]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, {backgroundColor: C.card}]}> 
          <View style={styles.heroText}>
            <Text style={[styles.title, {color: C.textMain}]}>Conócenos</Text>
              <Text style={[styles.subtitle, {color: C.textSub}]}>Nuestra misión, visión y objetivos como proyecto para mejorar la respuesta ciudadana frente a fallas urbanas.</Text>
          </View>

          <View style={styles.heroStats}>
            <View style={[styles.stat, {backgroundColor: C.sectionBg}]}> 
              <Text style={[styles.statNumber, {color: C.textMain}]}>{total != null ? String(total) : '—'}</Text>
                <Text style={[styles.statLabel, {color: C.textSub}]}>Reportes</Text>
            </View>
            <View style={[styles.stat, {backgroundColor: C.sectionBg}]}> 
              <Text style={[styles.statNumber, {color: C.textMain}]}>{(atendidos != null && total) ? `${Math.round((atendidos / total) * 100)}%` : '—'}</Text>
              <Text style={[styles.statLabel, {color: C.textSub}]}>Atendidos</Text>
            </View>
          </View>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={[styles.featureCard, {backgroundColor: C.card}]}> 
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureTitle, {color: C.textMain}]}>{f.title}</Text>
              <Text style={[styles.featureDesc, {color: C.textSub}]}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.footer, {borderColor: C.border}]}> 
          <Text style={[styles.footerText, {color: C.textSub}]}>¿Necesitas ayuda? Contáctanos o consulta las preguntas frecuentes.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const colors = (isDark: boolean) => ({
  sectionBg: isDark ? '#0b0a09' : '#fbfbfb',
  card:      isDark ? '#141312' : '#ffffff',
  border:    isDark ? 'rgba(255,255,255,0.04)' : 'rgba(16,24,40,0.06)',
  text:      isDark ? '#f4efe6' : '#111827',
  muted:     isDark ? '#b9a66b' : '#6b7280',
  accent:    '#FF7A00',
});

const styles = StyleSheet.create({
  container: {paddingVertical: 20},
  content: {paddingHorizontal: 16, gap: 18},
  hero: {flexDirection: 'row', borderRadius: 14, padding: 18, alignItems: 'center', justifyContent: 'space-between'},
  heroText: {flex: 1, paddingRight: 12},
  title: {fontSize: 24, fontWeight: '800', marginBottom: 6},
  subtitle: {fontSize: 14, lineHeight: 20, marginBottom: 12},
  ctaRow: {flexDirection: 'row', gap: 10},
  ctaPrimary: {paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10},
  ctaPrimaryText: {fontWeight: '800'},
  ctaSecondary: {paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1},
  ctaSecondaryText: {fontWeight: '700'},
  heroStats: {flexDirection: 'row', alignItems: 'center', gap: 8},
  stat: {padding: 10, borderRadius: 10, alignItems: 'center', minWidth: 80},
  statNumber: {fontSize: 18, fontWeight: '800'},
  statLabel: {fontSize: 12},

  features: {marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12},
  featureCard: {width: '48%', padding: 12, borderRadius: 12},
  featureIcon: {fontSize: 26, marginBottom: 8},
  featureTitle: {fontSize: 14, fontWeight: '700', marginBottom: 6},
  featureDesc: {fontSize: 13, lineHeight: 18},

  footer: {marginTop: 10, padding: 12, borderTopWidth: 1},
  footerText: {fontSize: 13},
});
