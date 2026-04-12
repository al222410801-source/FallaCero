export const getAppColors = (isDark: boolean) => ({
  // Balanceado palette (opción 2): naranja marca + teal agua
  bg:          isDark ? '#0b1220'              : '#F8FAFC',
  primary:     '#FF7A00', // naranja (marca / CTA)
  secondary:   '#0EA5A4', // teal/agua (acciones secundarias)
  accentAlt:   '#38BDF8', // celeste claro (decoración)
  textMain:    isDark ? '#E6F0FF'              : '#365499c5',
  textSub:     isDark ? '#94A3B8'              : '#64748B',
  glassBorder: isDark ? 'rgba(14, 165, 165, 0.43)' : 'rgba(14,165,164,0.04)',
  toggleBg:    isDark ? 'rgba(255, 255, 255, 0.53)' : 'rgba(0,0,0,0.06)',
  logoutBg:    'rgba(220,60,60,0.12)',
  logoutBorder:'rgba(220,60,60,0.2)',
  muted:       '#9CA3AF',
  card:        isDark ? '#111827' : '#FFFFFF',
  border:      isDark ? 'rgba(14,165,164,0.06)' : 'rgba(14,165,164,0.04)',
});

export type AppColors = ReturnType<typeof getAppColors>;
