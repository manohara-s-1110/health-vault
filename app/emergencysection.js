import React from 'react';
import { StyleSheet, View, Text, SafeAreaView,TouchableOpacity, Platform } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";


const EmergencyScreen = () => {
  return (
    // SafeAreaView is good practice, especially for iOS
    <SafeAreaView style={styles.safeArea}>
      {/* This is the main container that uses flexbox
        to center its child.
      */}
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={22} color="#1E232C" />
                </TouchableOpacity>
         <Text style={styles.header}>Emergency Screen</Text>

        {/* This is the emergency alert box */}
        <View style={styles.emergencyBox}>
          <Text style={styles.headerText}>EMERGENCY ALERT</Text>
          <Text style={styles.bodyText}>
            This is an important message. Please read carefully and follow all
            instructions.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

// This is where all the styles live, similar to a CSS file
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 22,textAlign: 'center', fontWeight: "700", color: "#1E232C", marginBottom: 16 },
  label: { fontSize: 14, color: "#6A707C", marginBottom: 8 },
  safeArea: {
    flex: 1, // Ensures the safe area fills the whole screen
  },
  // 1. This container fills the screen and centers content
  container: {
    flex: 1, // Tells the view to take up all available space
    justifyContent: 'top', // Vertically centers content (main axis)
    alignItems: 'left',    // Horizontally centers content (cross axis)
    backgroundColor: '#f4f4f4', // Light gray background
  },
  // 2. This is the styled emergency box
  emergencyBox: {
    width: '90%', // 90% of the parent's width
    maxWidth: 500,
    padding: 25,
    backgroundColor: '#fff0f0',
    borderWidth: 2,
    borderColor: '#d9534f',
    borderRadius: 8,
    alignItems: 'center',

    // --- Platform-specific shadows ---
    // Android
    elevation: 5,

    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // 3. Styles for the text elements
  headerText: {
    fontSize: 24, // React Native uses unitless density-pixels
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmergencyScreen;