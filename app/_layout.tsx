import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter, SplashScreen, useSegments } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '../ctx/auth';

SplashScreen.preventAutoHideAsync();

function CustomDrawerContent(props: any) {
  const router = useRouter();
  
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: '#0D0D0D' }}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>MENU</Text>
      </View>
      
      <DrawerItem
        label="HOME"
        labelStyle={styles.drawerLabel}
        icon={({ color }) => <Ionicons name="stop-outline" size={16} color={color} />}
        onPress={() => router.push('/HomePage')}
        inactiveTintColor="#555"
      />
      
      <DrawerItem
        label="SETTINGS"
        labelStyle={styles.drawerLabel}
        icon={({ color }) => <Ionicons name="stop-outline" size={16} color={color} />}
        onPress={() => router.push('/settings')}
        inactiveTintColor="#555"
      />
      
      <DrawerItem
        label="HELP"
        labelStyle={styles.drawerLabel}
        icon={({ color }) => <Ionicons name="stop-outline" size={16} color={color} />}
        onPress={() => router.push('/modal')}
        inactiveTintColor="#555"
      />
    </DrawerContentScrollView>
  );
}

function RootLayoutNav() {
  const { user, isAuthLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && isAuthLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthLoaded]);

  useEffect(() => {
    if (!fontsLoaded || !isAuthLoaded) return;

    const inAuthGroup = !!user;
    const isLoginScreen = segments[0] === 'LoginPage';
    
    // Auto redirect based on authentication state
    if (!inAuthGroup && !isLoginScreen) {
      router.replace('/LoginPage');
    } else if (inAuthGroup && isLoginScreen) {
      // User is logged in but tried to view the login screen or was redirected there
      router.replace('/HomePage');
    }
  }, [user, segments, fontsLoaded, isAuthLoaded]);

  if (!fontsLoaded || !isAuthLoaded) return null;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#CFFF04',
        drawerInactiveTintColor: '#555',
        drawerStyle: {
          backgroundColor: '#0D0D0D',
          width: 280,
        },
        headerStyle: {
          backgroundColor: '#0D0D0D',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }
      }}
    >
      <Drawer.Screen
        name="LoginPage"
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' },
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' },
          swipeEnabled: true,
        }}
      />
      <Drawer.Screen
        name="index"
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' },
          swipeEnabled: false,
        }}
      />
      
    </Drawer>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: '#0D0D0D',
    paddingLeft: 20,
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#CFFF04',
  },
  drawerHeaderText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
    color: '#fff',
  },
  drawerLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    letterSpacing: 2,
    color: '#fff',
  }
});

