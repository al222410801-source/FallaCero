// ============================================
// RUTA: src/screens/home/sections/AdmissionsSection.tsx
// ============================================

import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';
import {getDenunciasPrediction} from '@/graphql/denuncia';
import Svg, {Path, Polyline, Rect, G, Circle, Line} from 'react-native-svg';
const AnimatedPolyline: any = Animated.createAnimatedComponent(Polyline);
const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);


interface Props { onContacto: () => void; }

export const AdmissionsSection = ({onContacto}: Props) => {
  const {isDark} = useTheme();
  const C = getAppColors(isDark);
  const [prediction, setPrediction] = useState<any | null>(null);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getDenunciasPrediction(6, 0.1);
        if (!mounted) return;
        setPrediction(p);
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <View style={[styles.section, {backgroundColor: C.bg}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: C.textMain}]}>LAPLACE</Text>
        <Text style={[styles.subtitle, {color: C.muted}]}>Predicción de denuncias mensual (suavizado Laplace).</Text>
      </View>
      {prediction && (
        <View style={[styles.chartCard, {backgroundColor: C.bg, borderColor: C.border}]}> 
          <Text style={[styles.chartTitle, {color: C.textMain}]}>Predicción de denuncias (Laplace)</Text>
          <View>
            <Svg width="100%" height={140} viewBox="0 0 300 140">
              <Rect x="0" y="0" width="300" height="140" fill="transparent" />
              <G>
                {(() => {
                  const series: number[] = prediction.series || [];
                  const pred = prediction.prediccion || 0;
                  const data = [...series, pred];
                  const max = Math.max(...data, 1);
                  const min = Math.min(...data, 0);
                  const w = 260; const h = 90; const padX = 20; const padY = 20;
                  const stepX = w / Math.max(1, data.length - 1);

                  const pointsArr = data.map((v: number, i: number) => {
                    const x = padX + i * stepX;
                    const y = padY + (1 - (v - min) / (max - min || 1)) * h;
                    return {x, y, v, i};
                  });

                  const points = pointsArr.map(p => `${p.x},${p.y}`).join(' ');
                  const pathD = pointsArr.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                  return (
                    <>
                      {Array.from({length: 4}).map((_, gi) => {
                        const gy = padY + (gi / 4) * h;
                        return <Line key={`g-${gi}`} x1={padX} x2={padX + w} y1={gy} y2={gy} stroke={C.border} strokeWidth={0.6} />;
                      })}

                      <Line x1={padX} x2={padX} y1={padY} y2={padY + h} stroke={C.border} strokeWidth={1} />
                      <Line x1={padX} x2={padX + w} y1={padY + h} y2={padY + h} stroke={C.border} strokeWidth={1} />

                      <AnimatedPolyline
                        points={points}
                        fill="none"
                        stroke={C.primary}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={anim}
                        collapsable={undefined}
                      />

                      <Path d={pathD} fill="none" stroke={C.primary} strokeWidth={8} strokeLinejoin="round" strokeOpacity={0.12} opacity={0.6} />

                      {pointsArr.map((p: any, idx: number) => (
                        <AnimatedCircle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r={idx === pointsArr.length -1 ? 5 : 4}
                          fill={idx === pointsArr.length -1 ? '#6b5a47' : C.primary}
                          opacity={anim}
                          collapsable={undefined}
                        />
                      ))}
                    </>
                  );
                })()}
              </G>
            </Svg>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8}}>
              {(prediction.labels || []).map((lab: string, i: number) => (
                <Text key={i} style={{fontSize: 11, color: C.muted}}>{lab.slice(5)}</Text>
              ))}
              <Text style={{fontSize: 11, color: C.muted}}>P</Text>
            </View>
          </View>
          <Text style={[styles.chartFoot, {color: C.muted}]}>Mes predicho: {prediction.mes_predicho} — Valor: {prediction.prediccion}</Text>
        </View>
      )}
    </View>
  );
};

const colors = (isDark: boolean) => ({
  bg:     isDark ? '#111009' : '#f7f5f2',
  border: isDark ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.35)',
  text:   isDark ? '#f0ebe0' : '#2a1f0e',
  muted:  isDark ? '#a89070' : '#6b5a47',
});

const styles = StyleSheet.create({
  section:      {paddingVertical: 48, paddingHorizontal: 20, gap: 28},
  header:       {alignItems: 'center', gap: 12},
  title:        {fontSize: 26, fontWeight: '800', textAlign: 'center'},
  subtitle:     {fontSize: 14, textAlign: 'center', lineHeight: 22},
  steps:        {gap: 0},
  stepRow:      {flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 24, position: 'relative'},
  connector:    {position: 'absolute', left: 27, top: 56, width: 2, height: 28, borderRadius: 1},
  stepCircle:   {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 2,
    flexShrink: 0,
  },
  stepIcon:     {fontSize: 24},
  stepContent:  {flex: 1, paddingTop: 4, gap: 4},
  stepNum:      {fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1},
  stepTitle:    {fontSize: 17, fontWeight: '700'},
  stepDesc:     {fontSize: 13, lineHeight: 20},
  btn:          {
    alignItems: 'center', paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  btnText:      {fontWeight: '700', fontSize: 15},
  chartCard:    {marginTop: 18, padding: 12, borderRadius: 12, borderWidth: 1},
  chartTitle:   {fontSize: 14, fontWeight: '800', marginBottom: 8},
  chartRow:     {flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingVertical: 8},
  barWrap:      {width: 28, alignItems: 'center'},
  bar:          {width: 18, borderRadius: 6},
  barLabel:     {fontSize: 11, marginTop: 6},
  tooltipBox:   {position: 'absolute', right: 12, top: 8, padding: 8, borderRadius: 8, backgroundColor: '#111', zIndex: 10},
  tooltipText:  {color: '#fff', fontSize: 12},
  chartFoot:    {fontSize: 12, marginTop: 8},
});
