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
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Configure notifications
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
  
  // UI States
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  // Default to 5 minutes from now
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 5 * 60000)); 
  const [isRecurring, setIsRecurring] = useState(false);

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

  // Date Picker Handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (date) => {
    const now = new Date();
    if (date <= now) {
      Alert.alert("Invalid Time", "Please select a time in the future.");
      hideDatePicker();
      return;
    }
    setSelectedDate(date);
    hideDatePicker();
  };

  // --- NEW LOGIC: Calendar-based Trigger ---
  const handleAddReminder = async () => {
    if (newReminderText.trim().length === 0) {
      Alert.alert("Missing Info", "Please enter the reminder text.");
      return;
    }

    const now = new Date();
    if (selectedDate <= now) {
      Alert.alert("Time Error", "Please pick a future time.");
      return;
    }

    // Create a precise calendar trigger
    let trigger;
    if (isRecurring) {
      // Daily repeat: Fire every day at this Hour and Minute
      trigger = {
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes(),
        repeats: true,
      };
    } else {
      // One-time: Fire at this exact Year, Month, Day, Hour, Minute
      trigger = {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1, // Expo uses 1-12 for months in triggers? 
        // Note: Actually, checking docs, usually Date object is fine, 
        // but let's stick to the components to be safe if Date failed you.
        // Wait, let's try the Date object ONE more time but with a buffer check.
        // If it failed before, it's likely because 'seconds' was 0.
        
        // Let's use the explicit date object which is the standard way.
        date: selectedDate 
      }; 
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "HealthVault Reminder 🔔",
          body: newReminderText,
          sound: 'default',
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
      setSelectedDate(new Date(Date.now() + 5 * 60000)); 
      setIsRecurring(false);
      
      Alert.alert(
        "Success", 
        `Reminder set for ${selectedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      );
      
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not schedule the notification.");
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      const updatedReminders = reminders.filter(r => r.id !== id);
      await saveReminders(updatedReminders);
    } catch (e) {
      Alert.alert("Error", "Could not delete reminder.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.reminderItem}>
      <View style={styles.iconContainer}>
        <Ionicons name="alarm-outline" size={24} color="#4A90E2" />
      </View>
      <View style={styles.reminderTextContainer}>
        <Text style={styles.reminderText}>{item.text}</Text>
        <Text style={styles.reminderTime}>
          {new Date(item.time).toLocaleDateString()} at {new Date(item.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          {item.isRecurring && <Text style={{color:'#4A90E2', fontWeight:'bold'}}> (Daily)</Text>}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteReminder(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.headerTitle}>My Reminders</Text>
        <Text style={styles.headerSubtitle}>Never miss a dose or appointment.</Text>

        {/* --- Input Card --- */}
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Ionicons name="create-outline" size={20} color="#4A90E2" style={{marginRight: 10}} />
            <TextInput
              style={styles.textInput}
              placeholder="What should we remind you?"
              placeholderTextColor="#A0A0A0"
              value={newReminderText}
              onChangeText={setNewReminderText}
            />
          </View>
          
          <View style={styles.divider} />

          <TouchableOpacity style={styles.dateRow} onPress={showDatePicker}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="time-outline" size={20} color="#4A90E2" style={{marginRight: 10}} />
              <Text style={styles.dateLabel}>Select Time:</Text>
            </View>
            <View style={styles.dateValueContainer}>
              <Text style={styles.dateValue}>
                {selectedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
              <Text style={styles.dateDate}>
                {selectedDate.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="repeat-outline" size={20} color="#4A90E2" style={{marginRight: 10}} />
              <Text style={styles.switchLabel}>Repeat Daily</Text>
            </View>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#B3D9FF" }}
              thumbColor={isRecurring ? "#4A90E2" : "#f4f3f4"}
              onValueChange={setIsRecurring}
              value={isRecurring}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
            <Text style={styles.addButtonText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>

        {/* --- Date Picker Configuration --- */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
          date={selectedDate}
          // Android: Use spinner for a different look, or 'default' for calendar
          // 'spinner' often feels more like a time picker
          display={Platform.OS === 'ios' ? 'inline' : 'default'} 
          is24Hour={false} 
          textColor="black"
        />

        <FlatList
          data={reminders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{paddingBottom: 20}}
          ListEmptyComponent={
            <View style={styles.placeholderContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#CED5E0" />
              <Text style={styles.placeholderText}>No reminders yet.</Text>
              <Text style={styles.placeholderSubText}>Add one above to get started.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

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
      Alert.alert('Permission required', 'Please enable notifications in settings.');
    }
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E232C', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: '#8391A1', marginBottom: 20 },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', height: 40 },
  textInput: { flex: 1, fontSize: 16, color: '#1E232C' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  dateLabel: { fontSize: 16, color: '#1E232C', fontWeight: '500' },
  dateValueContainer: { alignItems: 'flex-end' },
  dateValue: { fontSize: 16, color: '#4A90E2', fontWeight: 'bold' },
  dateDate: { fontSize: 12, color: '#8391A1' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  switchLabel: { fontSize: 16, color: '#1E232C', fontWeight: '500' },
  addButton: { backgroundColor: '#4A90E2', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', shadowColor: "#4A90E2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  list: { flex: 1 },
  reminderItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reminderTextContainer: { flex: 1 },
  reminderText: { fontSize: 16, fontWeight: '600', color: '#1E232C', marginBottom: 4 },
  reminderTime: { fontSize: 13, color: '#8391A1' },
  deleteButton: { padding: 8 },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40, opacity: 0.6 },
  placeholderText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: '#1E232C' },
  placeholderSubText: { marginTop: 8, fontSize: 14, color: '#8391A1' }
});