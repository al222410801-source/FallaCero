// ============================================
// RUTA: src/navigation/DrawerNavigator.tsx
// ============================================

import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import CiudadanoNavigation  from './CiudadanoNavigator';
import DenunciaNavigator   from './DenunciaNavigator';
import EvidenciaNavigator  from './EvidenciaNavigator';
import DetEvidenciaNavigator from './DetEvidenciaNavigator';
import HistorialNavigator from './HistorialNavigator';
import ServidorNavigation  from './ServidorNavigator';
import UsuarioNavigator    from './UsuarioNavigator';

import HomeScreen          from '@/screens/HomeScreen';
import LoginScreen         from '@/screens/LoginScreen';

import {useAuth}  from '@/context/AuthContext';
import {useTheme} from '@/context/ThemeContext';
import {getAppColors} from '@/theme/colors';

// ─── Stack público (Home + Login) ─────────────────────────────────────────────
const PublicStack = createNativeStackNavigator();

function PublicNavigator() {
  return (
    <PublicStack.Navigator screenOptions={{headerShown: false}}>
      <PublicStack.Screen name="Home"  component={HomeScreen} />
      <PublicStack.Screen name="DetEvidencias" component={DetEvidenciaNavigator} />
      <PublicStack.Screen name="Denuncias" component={DenunciaNavigator} />
      <PublicStack.Screen name="Login" component={LoginScreen} />
    </PublicStack.Navigator>
  );
}

// ─── Drawer privado ────────────────────────────────────────────────────────────
const Drawer = createDrawerNavigator();

const getColors = (isDark: boolean) => getAppColors(isDark);

function ThemeToggleBtn() {
  const {isDark, toggleTheme} = useTheme();
  const C = getColors(isDark);
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.themeBtn, {backgroundColor: C.toggleBg, borderColor: C.glassBorder}]}
      activeOpacity={0.7}
    >
      <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
      <Text style={[styles.themeText, {color: C.textMain}]}>
        {isDark ? 'Tema Claro' : 'Tema Oscuro'}
      </Text>
    </TouchableOpacity>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const {user, cerrarSesion} = useAuth();
  const {isDark} = useTheme();
  const C = getColors(isDark);

  let avatarUri: string | null = null;
  try {
    const raw = user?.avatar_url;
    if (typeof raw === 'string' && raw.length > 0) {
      if (raw.startsWith('data:') || raw.startsWith('http') || raw.startsWith('/')) {
        avatarUri = raw;
      } else {
        // assume stored as base64 string
        avatarUri = `data:image/jpeg;base64,${raw}`;
      }
    }
  } catch (err) {
    avatarUri = null;
  }

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={[styles.drawerContainer, {backgroundColor: C.bg}]}>
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          {avatarUri
            ? <Image source={{uri: avatarUri}} style={[styles.avatarSmall, {borderColor: C.accent}]} />
            : (
              <View style={[styles.avatarFallbackSmall, {borderColor: C.accent}]}>
                <Text style={[styles.avatarFallbackTextSmall, {color: C.accent}]}> {user?.username?.charAt(0).toUpperCase() ?? '?'} </Text>
              </View>
            )}

          <View style={{marginLeft: 12}}>
            <Text style={[styles.usernameSmall, {color: C.textMain}]}>{user?.username}</Text>
            <Text style={[styles.userRoleSmall,  {color: C.textSub}]}>FallaCero</Text>
          </View>
        </View>
      </View>

      <View style={[styles.separator, {backgroundColor: C.glassBorder}]} />
      {/* Drawer items (fallback to ensure something renders) */}
      <DrawerItemList {...props} />
      <View style={[styles.separator, {backgroundColor: C.glassBorder}]} />
      <ThemeToggleBtn />
      <View style={[styles.separator, {backgroundColor: C.glassBorder}]} />

      <Pressable
        style={({pressed}) => [styles.logoutBtn, {backgroundColor: C.logoutBg, borderColor: C.logoutBorder}, pressed && {opacity: 0.7}]}
        onPress={cerrarSesion}
      >
        <Text style={styles.logoutIcon}>⎋</Text>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

// ─── Navigator principal ──────────────────────────────────────────────────────
export default function DrawerNavigator() {
  const {isAuthenticated, cargando} = useAuth();
  const {isDark} = useTheme();
  const C = getColors(isDark);

  if (cargando) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: C.bg}]}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  // Sin sesión → stack público (Home + Login)
  if (!isAuthenticated) {
    return <PublicNavigator />;
  }

  // Con sesión → drawer completo
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle:      {backgroundColor: C.bg},
        headerTintColor:  C.accent,
        headerTitleStyle: {fontWeight: 'bold', color: C.textMain},
        drawerStyle:      {backgroundColor: C.bg},
        drawerActiveTintColor:        C.accent,
        drawerInactiveTintColor:      C.textSub,
        drawerActiveBackgroundColor:  'rgba(201,168,76,0.12)',
        drawerLabelStyle:             {fontWeight: '600'},
        drawerItemStyle:              {marginVertical: 4, borderRadius: 8},
      }}
    >
      <Drawer.Screen name="Ciudadanos"  component={CiudadanoNavigation} options={{title: '👥  Ciudadanos'}} />
      <Drawer.Screen name="Denuncias"  component={DenunciaNavigator}  options={{title: '📣  Denuncias'}} />
      <Drawer.Screen name="Historiales" component={HistorialNavigator} options={{title: '📜  Historiales'}} />
      <Drawer.Screen name="Evidencias" component={EvidenciaNavigator} options={{title: '🖼️  Evidencias'}} />
      <Drawer.Screen name="DetEvidencias" component={DetEvidenciaNavigator} options={{title: '🔗  Det. Evidencias'}} />
      <Drawer.Screen name="Usuarios" component={UsuarioNavigator} options={{title: '👤  Usuarios'}} />
      <Drawer.Screen name="Servidores" component={ServidorNavigation} options={{title: '👔  Servidores'}} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer:    {flex: 1, alignItems: 'center', justifyContent: 'center'},
  drawerContainer:     {flex: 1, paddingBottom: 24},
  profileSection:      {paddingTop: 18, paddingBottom: 12, paddingHorizontal: 16},
  profileRow:          {flexDirection: 'row', alignItems: 'center'},
  avatarSmall:         {width: 72, height: 72, borderRadius: 36, borderWidth: 3, marginBottom: 0},
  avatarFallbackSmall: {width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 2, alignItems: 'center', justifyContent: 'center'},
  avatarFallbackTextSmall:{fontSize: 20, fontWeight: '700'},
  usernameSmall:       {fontSize: 16, fontWeight: '700'},
  userRoleSmall:       {fontSize: 12, marginTop: 2},
  separator:           {height: 1, marginHorizontal: 16, marginVertical: 8},
  themeBtn:            {flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginVertical: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1},
  themeIcon:           {fontSize: 16},
  themeText:           {fontSize: 14, fontWeight: '600'},
  logoutBtn:           {flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1},
  logoutIcon:          {fontSize: 18, color: '#e55'},
  logoutText:          {fontSize: 14, fontWeight: '600', color: '#e55'},
});
