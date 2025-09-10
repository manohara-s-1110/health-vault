// app/onboarding.js (formerly OnboardingScreen.js)
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router'; // Use expo-router's router

export default function OnboardingScreen() { // No 'navigation' prop needed
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Image source={require('../assets/vital_vault_logo.png')} style={styles.logo} />
        <Text style={styles.appName}>Health Vault</Text>
        <Text style={styles.title}>Let's get started!</Text>
        <Text style={styles.subtitle}>Login to Stay healthy and fit</Text>

        <TouchableOpacity 
          style={styles.loginBtn} 
          onPress={() => router.navigate('/signin')} // Use expo-router's navigate
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signupBtn} 
          onPress={() => router.navigate('/signup')} // Use expo-router's navigate
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  logo: {
    width: 80, 
    height: 80,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2F6B',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8391A1',
    marginBottom: 40,
    textAlign: 'center',
  },
  loginBtn: {
    width: '85%',
    paddingVertical: 18,
    backgroundColor: '#4A90E2', 
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupBtn: {
    width: '85%',
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#4A90E2', 
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
  },
  signupText: {
    color: '#4A90E2', 
    fontWeight: 'bold',
    fontSize: 16,
  },
});