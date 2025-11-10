
// app/(tabs)/profile.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Reusable component for each menu item
const ProfileMenuItem = ({ icon, name, onPress, isLogout }) => {
  const iconColor = isLogout ? '#FF6B6B' : '#4A90E2';
  const textColor = isLogout ? '#FF6B6B' : '#1E232C';
  const iconContainerColor = isLogout ? '#FFE5E5' : '#E9F2FF';

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconContainerColor }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.menuItemText, { color: textColor }]}>{name}</Text>
      <Ionicons name="chevron-forward-outline" size={22} color="#8391A1" />
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const menuItems = [
    { icon: 'person-outline', name: 'Manage Profile' },
    { icon: 'medkit-outline', name: 'Medical Info' },
    { icon: 'shield-checkmark-outline', name: 'Emergency Section' },
    { icon: 'language-outline', name: 'Language Preference' },
    { icon: 'help-circle-outline', name: 'FAQ' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?u=ruchita' }} // Placeholder image
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Ron</Text>
          <Text style={styles.profileEmail}>ron.s@example.com</Text>
        </View>

        <View style={styles.menuWrapper}>
          {menuItems.map((item, index) => (
            <ProfileMenuItem
              key={index}
              icon={item.icon}
              name={item.name}
              onPress={() => console.log(`Pressed ${item.name}`)}
            />
          ))}
          <ProfileMenuItem
            icon="log-out-outline"
            name="Log Out"
            onPress={() => console.log('Pressed Log Out')}
            isLogout={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  profileEmail: {
      fontSize: 15,
      color: '#8391A1', // Lighter font color
      marginTop: 4,     // Space between name and email
    },
  menuWrapper: {
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});