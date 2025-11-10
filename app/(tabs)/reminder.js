// app/(tabs)/reminder.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, StatusBar, 
  TextInput, TouchableOpacity, FlatList, Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Key for AsyncStorage
const REMINDERS_STORAGE_KEY = 'healthvault-reminders';

export default function ReminderScreen() {
  const [reminders, setReminders] = useState([]);
  const [newReminderText, setNewReminderText] = useState('');
  const [notificationToken, setNotificationToken] = useState(null);

  // Ask for notification permissions on first load
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setNotificationToken(token));
  }, []);

  // Load reminders from storage every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadReminders();
    }, [])
  );

  const loadReminders = async () => {
    try {
      const data = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      setReminders(data ? JSON.parse(data) : []);
    } catch (e) {
      console.log("Failed to load reminders.", e);
    }
  };

  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (e) {
      console.log("Failed to save reminders.", e);
    }
  };

  // Function to schedule a new reminder
  const handleAddReminder = async () => {
    if (newReminderText.trim().length === 0) {
      Alert.alert("Empty Reminder", "Please enter a message for your reminder.");
      return;
    }
    
    // For this example, we'll schedule it 5 seconds from now for easy testing
    const triggerInSeconds = 5; 
    // For a real app, you'd use a date picker:
    // const trigger = new Date(yourSelectedDate); 
    
    try {
      // 1. Schedule the system notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "HealthVault Reminder",
          body: newReminderText,
          data: { text: newReminderText },
        },
        trigger: { seconds: triggerInSeconds },
      });

      // 2. Save the reminder to our list in AsyncStorage
      const newReminder = {
        id: notificationId, // Use the notification ID as our reminder ID
        text: newReminderText,
        time: new Date(Date.now() + triggerInSeconds * 1000).toISOString()
      };
      
      const updatedReminders = [...reminders, newReminder];
      await saveReminders(updatedReminders);
      
      setNewReminderText('');
      Alert.alert("Success", `Reminder set for ${triggerInSeconds} seconds from now.`);
      
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not set reminder.");
    }
  };

  // Function to delete a reminder
  const handleDeleteReminder = async (id) => {
    try {
      // 1. Cancel the scheduled notification
      await Notifications.cancelScheduledNotificationAsync(id);
      
      // 2. Remove it from our list in AsyncStorage
      const updatedReminders = reminders.filter(r => r.id !== id);
      await saveReminders(updatedReminders);
      
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not delete reminder.");
    }
  };

  // Render item for the FlatList
  const renderItem = ({ item }) => (
    <View style={styles.reminderItem}>
      <View style={styles.reminderTextContainer}>
        <Text style={styles.reminderText}>{item.text}</Text>
        <Text style={styles.reminderTime}>
          Scheduled for: {new Date(item.time).toLocaleTimeString()}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteReminder(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#E53935" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>My Reminders</Text>
        <Text style={styles.subtitle}>Schedule medication or appointment reminders.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Take antibiotics at 8 PM"
            placeholderTextColor="#8391A1"
            value={newReminderText}
            onChangeText={setNewReminderText}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={reminders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.placeholderContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#CED5E0" />
              <Text style={styles.placeholderText}>You have no scheduled reminders.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

// Function to register for notifications
async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get permissions for notifications.');
      return;
    }
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }
  return token;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E232C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#8391A1', marginBottom: 30 },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    height: 52,
    backgroundColor: "#F7F8FA",
    borderColor: "#E8ECF4",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1E232C",
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  list: {
    flex: 1,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    marginBottom: 10,
  },
  reminderTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  reminderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E232C',
  },
  reminderTime: {
    fontSize: 12,
    color: '#8391A1',
    marginTop: 4,
  },
  placeholderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 50,
    marginTop: 50,
  },
  placeholderText: { 
    marginTop: 15, 
    fontSize: 16, 
    color: '#8391A1', 
    textAlign: 'center' 
  },
});