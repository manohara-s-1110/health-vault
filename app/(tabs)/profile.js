// app/(tabs)/profile.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig'; // adjust path if needed
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Actual logout operation
  const performLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  // Show confirmation dialog before logging out
  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: performLogout },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      name: 'Manage Profile',
      onPress: () => router.push('/manageprofile'), // create or change route as needed
    },
    {
      icon: 'medkit-outline',
      name: 'Medical Info',
      onPress: () => router.push('/medicalinfo'),
    },
    {
      icon: 'shield-checkmark-outline',
      name: 'Emergency Section',
      onPress: () => router.push('/emergencysection'),
    },
    {
      icon: 'language-outline',
      name: 'Language Preference',
      onPress: () => router.push('/languagespreference'),
    },
    {
      icon: 'help-circle-outline',
      name: 'FAQ',
      onPress: () => router.push('/faq'),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </SafeAreaView>
    );
  }

  // If no user, show prompt to sign in
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>Guest</Text>
            <Text style={styles.profileEmail}>Not signed in</Text>

            <TouchableOpacity
              style={[styles.logoutButton, { marginTop: 20 }]}
              onPress={() => router.replace('/signin')}
            >
              <Text style={styles.logoutText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuWrapper}>
            {menuItems.map((item, index) => (
              <ProfileMenuItem
                key={index}
                icon={item.icon}
                name={item.name}
                onPress={() => Alert.alert('Sign in required', 'Please sign in to access this feature.')}
              />
            ))}

            <ProfileMenuItem
              icon="log-out-outline"
              name="Log Out"
              onPress={() => Alert.alert('Not signed in', 'You are not signed in.')}
              isLogout
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // If user is signed in, show their profile details
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: user.photoURL
                ? user.photoURL
                : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user.displayName || 'User'}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>

        <View style={styles.menuWrapper}>
          {menuItems.map((item, index) => (
            <ProfileMenuItem
              key={index}
              icon={item.icon}
              name={item.name}
              onPress={item.onPress}
            />
          ))}

          <ProfileMenuItem
            icon="log-out-outline"
            name="Log Out"
            onPress={confirmLogout}
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
    backgroundColor: '#F7F8FA',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  profileEmail: {
    fontSize: 15,
    color: '#8391A1',
    marginTop: 4,
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
  logoutButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
