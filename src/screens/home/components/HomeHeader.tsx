// ============================================
// RUTA: src/screens/home/components/HomeHeader.tsx
// Header sticky con logo, links de nav (scroll), toggle de tema y botón Login.
// ============================================

import React, {useState} from 'react';
import {
  View, Text, TouchableOpacity, Image,
  Modal, Pressable, StyleSheet, Animated,
} from 'react-native';
import {useTheme} from '@/context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {getAppColors} from '@/theme/colors';

const pandoraLogo = require('../../../../assets/Fallalogo.png');

const navLinks = [
  {label: 'Inicio',           id: 'hero'},
  {label: 'Conócenos',        id: 'about'},
  {label: 'Acciones de FallaCero', id: 'offer'},
  {label: 'Laplace',       id: 'admissions'},
  {label: 'FallaCero',        id: 'news'},
  {label: 'Contacto',         id: 'contact'},
];

interface Props {
  onNavigate: (id: string) => void;
}

export const HomeHeader = ({onNavigate}: Props) => {
  const {isDark, toggleTheme} = useTheme();
  const navigation = useNavigation<any>();
  const [menuOpen, setMenuOpen] = useState(false);
  const C = getAppColors(isDark);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <View style={[styles.header, {backgroundColor: C.bg, borderBottomColor: C.border}]}>
        {/* Logo */}
        <TouchableOpacity style={styles.brand} onPress={() => handleNav('hero')} activeOpacity={0.8}>
          <Image source={pandoraLogo} style={styles.logo} />
          <Text style={[styles.brandName, {color: C.textMain}]} numberOfLines={1}>
            FallaCero
          </Text>
        </TouchableOpacity>

        {/* Acciones */}
        <View style={styles.actions}>
          {/* Toggle tema */}

          <TouchableOpacity onPress={() => onNavigate('contact')}>
            <Text style={styles.iconBtnText}>Contacto</Text>
          </TouchableOpacity>


          <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, {backgroundColor: C.toggleBg}]} activeOpacity={0.7}>
            <Text style={styles.iconBtnText}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          {/* Login */}
          <TouchableOpacity
            style={[styles.loginBtn, {borderColor: C.primary, backgroundColor: 'transparent'}]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={[styles.loginText, {color: C.primary}]}>Ingresar</Text>
          </TouchableOpacity>

          {/* Menú hamburguesa */}
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={[styles.iconBtn, {backgroundColor: C.toggleBg}]} activeOpacity={0.7}>
            <Text style={styles.iconBtnText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer de navegación */}
      <Modal visible={menuOpen} transparent animationType="slide" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)} />
        <View style={[styles.menuSheet, {backgroundColor: C.bg, borderTopColor: C.border}]}>
          <View style={[styles.menuHandle, {backgroundColor: C.primary}]} />
          {navLinks.map((l) => (
            <TouchableOpacity key={l.id} onPress={() => handleNav(l.id)}
              style={[styles.menuItem, {borderBottomColor: C.border}]} activeOpacity={0.7}>
              <Text style={[styles.menuItemText, {color: C.textMain}]}>{l.label}</Text>
              <Text style={{color: C.primary, fontSize: 18}}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.menuLoginBtn, {backgroundColor: C.primary}]}
            onPress={() => { setMenuOpen(false); navigation.navigate('Login'); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.menuLoginText, {color: '#fff'}]}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

// removed local colors; using global getAppColors

const styles = StyleSheet.create({
  header:       {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  brand:        {flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1},
  logo:         {width: 38, height: 46, borderRadius: 18},
  brandName:    {fontSize: 15, fontWeight: '700', flexShrink: 1},
  actions:      {flexDirection: 'row', alignItems: 'center', gap: 8},
  iconBtn:      {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  icontx:      {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  iconBtnText:  {fontSize: 16},
  loginBtn:     {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1.5, borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  loginText:    {fontSize: 12, fontWeight: '700'},
  menuOverlay:  {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'},
  menuSheet:    {
    paddingBottom: 32, paddingTop: 12, borderTopWidth: 1,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  menuHandle:   {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  menuItem:     {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1,
  },
  menuItemText: {fontSize: 16, fontWeight: '500'},
  menuLoginBtn: {
    marginHorizontal: 24, marginTop: 20, paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
  },
  menuLoginText: {color: '#ffffff', fontWeight: '700', fontSize: 15},
});
