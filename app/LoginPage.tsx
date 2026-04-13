import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../ctx/auth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please enter both email and password.');
      } else {
        Alert.alert('Error', 'Please enter both email and password.');
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://reqres.in/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'reqres_4711c3c92a804cc8ab5e9e04f5aa54dc',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Save email using Auth context
        await signIn(email.trim());

        if (Platform.OS === 'web') {
          window.alert('Login successful!');
        } else {
          Alert.alert('Success', 'Login successful!');
        }
      } else {
        const errorMsg = data.error || 'Invalid credentials. Please try again.';
        if (Platform.OS === 'web') {
          window.alert('Login Failed: ' + errorMsg);
        } else {
          Alert.alert('Login Failed', errorMsg);
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to connect to the authentication API.');
      } else {
        Alert.alert('Error', 'Failed to connect to the authentication API.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor="#CFFF04"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          selectionColor="#CFFF04"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#0D0D0D" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 50,
    lineHeight: 56,
    color: '#fff',
    marginBottom: 60,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 35,
  },
  inputLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    width: '100%',
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 0,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#CFFF04',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Inter_700Bold',
    color: '#0D0D0D',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
