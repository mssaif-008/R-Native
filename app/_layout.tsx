import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';

function CustomDrawerContent(props: any) {
  const router = useRouter();
  
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Ionicons name="briefcase" size={40} color="#007AFF" />
      </View>
      
      <DrawerItem
        label="Home Feed"
        icon={({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />}
        onPress={() => router.push('/HomePage')}
      />
      
      <DrawerItem
        label="Settings"
        icon={({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />}
        onPress={() => router.push('/settings')}
      />
      
      <DrawerItem
        label="Help"
        icon={({ color, size }) => <Ionicons name="help-circle-outline" size={size} color={color} />}
        onPress={() => router.push('/modal')}
      />
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerInactiveTintColor: '#333',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
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
      
      {/* Target screens must be registered in the Drawer to be accessible,
          even if we hide them from the automatic drawer list. */}
      <Drawer.Screen
        name="(tabs)/HomePage"
        options={{
          headerShown: false,
          title: "Home",
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="(tabs)/settings"
        options={{
          headerShown: false,
          title: "Settings",
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="(tabs)/modal"
        options={{
          headerShown: false,
          title: "Help & Info",
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  }
});

