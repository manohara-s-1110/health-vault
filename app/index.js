// app/index.js (formerly SplashScreen.js)
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { router } from 'expo-router'; // Use expo-router's router

export default function SplashScreen() { // No 'navigation' prop needed
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding'); // Use expo-router's replace
    }, 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []); // Empty dependency array as router is stable

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Image source={require('../assets/vital_vault_logo.png')} style={styles.logo} /> 
      <Text style={styles.appName}>Health Vault</Text>
      <Text style={styles.appSubtitle}>Medical app</Text>
      <Text style={styles.appCaption}>Your Personal Health Companion</Text>
      <Image source={require('../assets/stethoscope.png')} style={styles.stethoscope} />
      <Image source={require('../assets/pills.png')} style={styles.pills} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    width: 100, 
    height: 100, 
    marginBottom: 10,
    resizeMode: 'contain',
    zIndex: 1, 
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A2F6B', 
    marginBottom: 5,
    zIndex: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6A707C',
    marginBottom: 8,
    zIndex: 1,
  },
  appCaption: {
    fontSize: 14,
    color: '#6A707C',
    zIndex: 1,
  },
  stethoscope: {
    position: 'absolute',
    bottom: -50, 
    left: -50,
    width: 300, 
    height: 300,
    opacity: 0.3, 
    resizeMode: 'contain',
  },
  pills: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 80,
    height: 80,
    opacity: 0.3,
    resizeMode: 'contain',
  },
});