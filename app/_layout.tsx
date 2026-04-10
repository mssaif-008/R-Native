import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Drawer 
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
          title: "Home",
          drawerLabel: "Home Feed",
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }} 
      />
      <Drawer.Screen 
        name="settings" 
        options={{ 
          title: "Settings",
          drawerLabel: "Settings",
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }} 
      />
      <Drawer.Screen 
        name="modal" 
        options={{ 
          title: "Help & Info",
          drawerLabel: "Help",
          drawerIcon: ({ color, size }) => <Ionicons name="help-circle-outline" size={size} color={color} />,
        }} 
      />
    </Drawer>
  );
}
