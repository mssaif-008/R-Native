import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true, // Choice B: Enable headers in the Tabs layout
        headerLeft: () => <DrawerToggleButton tintColor="#121212" />, // Add the menu button
        tabBarActiveTintColor: '#121212',
        tabBarInactiveTintColor: 'gray',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings", // Ensure title shows in header
          href: null,
        }}
      />
      <Tabs.Screen
        name="modal"
        options={{
          title: "Help",
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="LoginPage"
        options={{
          href: null,
          headerShown: false, // Keep login clean
        }}
      />
    </Tabs>
  );
}

