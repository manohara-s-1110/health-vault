// app/(tabs)/reminder.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TextInput, TouchableOpacity, FlatList, Alert, Platform, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
// --- NEW IMPORT ---
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Configure how notifications are handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const REMINDERS_STORAGE_KEY = 'healthvault-reminders';

export default function ReminderScreen() {
  const [reminders, setReminders] = useState([]);
  const [newReminderText, setNewReminderText] = useState('');
  
  // --- NEW STATES FOR DATE/TIME PICKER ---
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 60000)); // Default to 1 min in future
  const [isRecurring, setIsRecurring] = useState(false);

  // Ask for notification permissions
  useFocusEffect(
    React.useCallback(() => {
      registerForPushNotificationsAsync();
      loadReminders();
    }, [])
  );

  const loadReminders = async () => {
    try {
      const data = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      setReminders(data ? JSON.parse(data) : []);
    } catch (e) { console.log("Failed to load reminders.", e); }
  };

  const saveReminders = async (newReminders) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (e) { console.log("Failed to save reminders.", e); }
  };

  // --- Show/Hide the Date Picker ---
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  // --- Handle Date Selection ---
  const handleDateConfirm = (date) => {
    if (date < new Date()) {
      Alert.alert("Invalid Time", "Please select a time in the future.");
      hideDatePicker();
      return;
    }
    setSelectedDate(date);
    hideDatePicker();
  };

  // --- Schedule a new reminder ---
  const handleAddReminder = async () => {
    if (newReminderText.trim().length === 0) {
      Alert.alert("Empty Reminder", "Please enter a message for your reminder.");
      return;
    }

    // Set trigger
    const trigger = {
      date: selectedDate,
      repeats: isRecurring, // Use the toggle state
    };

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "HealthVault Reminder",
          body: newReminderText,
          data: { text: newReminderText },
        },
        trigger: trigger,
      });

      const newReminder = {
        id: notificationId,
        text: newReminderText,
        time: selectedDate.toISOString(),
        isRecurring: isRecurring,
      };
      
      const updatedReminders = [...reminders, newReminder];
      await saveReminders(updatedReminders);
      
      setNewReminderText('');
      setSelectedDate(new Date(Date.now() + 60000)); // Reset for next time
      setIsRecurring(false);
      
      Alert.alert("Success", `Reminder set successfully!`);
      
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not set reminder.");
    }
  };

  // --- Delete a reminder ---
  const handleDeleteReminder = async (id) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      const updatedReminders = reminders.filter(r => r.id !== id);
      await saveReminders(updatedReminders);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not delete reminder.");
    }
  };

  // --- Render item for the FlatList ---
  const renderItem = ({ item }) => (
    <View style={styles.reminderItem}>
      <View style={styles.reminderTextContainer}>
        <Text style={styles.reminderText}>{item.text}</Text>
        <Text style={styles.reminderTime}>
          {new Date(item.time).toLocaleString()}
          {item.isRecurring ? ' (Daily)' : ''}
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

        <View style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Take antibiotics at 8 PM"
            placeholderTextColor="#8391A1"
            value={newReminderText}
            onChangeText={setNewReminderText}
          />
          
          <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
            <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
            <Text style={styles.datePickerText}>
              {selectedDate.toLocaleString()}
            </Text>
          </TouchableOpacity>

          <View style={styles.recurringContainer}>
            <Text style={styles.recurringText}>Repeat Daily?</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81c7f3" }}
              thumbColor={isRecurring ? "#4A90E2" : "#f4f3f4"}
              onValueChange={setIsRecurring}
              value={isRecurring}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
            <Text style={styles.addButtonText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
          date={selectedDate}
        />

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

// --- Notification Registration ---
async function registerForPushNotificationsAsync() {
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
    // console.log('Must use physical device for Push Notifications');
  }
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E232C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#8391A1', marginBottom: 20 },
  
  inputCard: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  textInput: {
    height: 52,
    backgroundColor: "#FFF",
    borderColor: "#E8ECF4",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1E232C",
    marginBottom: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: "#FFF",
    borderColor: "#E8ECF4",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  datePickerText: {
    fontSize: 15,
    color: '#1E232C',
    marginLeft: 10,
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  recurringText: {
    fontSize: 16,
    color: '#1E232C',
  },
  addButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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