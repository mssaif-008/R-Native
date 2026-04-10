import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#eee',
          elevation: 1,
          height: 60,
          paddingBottom: 8,
        }
      }}
    >
      <Tabs.Screen 
        name="HomePage" 
        options={{ 
          title: "Jobs",
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="Profile" 
        options={{ 
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }} 
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
