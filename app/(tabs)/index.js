// app/(tabs)/index.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Home Screen</Text>
        <Text style={styles.subtitle}>Welcome to Health Vault!</Text>
        {/* Your home screen content will go here */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Light background
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#8391A1',
    textAlign: 'center',
  },
});