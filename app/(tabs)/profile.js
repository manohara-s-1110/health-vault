// app/(tabs)/profile.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Profile Screen</Text>
        <Text style={styles.subtitle}>Manage your personal health profile.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E232C', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#8391A1', textAlign: 'center' },
});