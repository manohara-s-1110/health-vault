import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, SafeAreaView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

// FIREBASE IMPORTS
import { doc, onSnapshot, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // <--- IMPORT AUTH
import { db } from '../firebaseConfig';

const EmergencyScreen = () => {
  const [user, setUser] = useState(null); // Store the current user object
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // 1. Get the Current Logged In User & Listen for Data
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "No user logged in");
      return;
    }

    setUser(currentUser); // Save user to state
    const userDocRef = doc(db, "users", currentUser.uid); // <--- USE REAL UID

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const fetchedContacts = userData.emergencyContacts || [];
        setContacts(fetchedContacts);

        if (fetchedContacts.length === 0) setShowForm(true);
      } else {
        // Doc doesn't exist yet? No problem, we will create it when saving.
        setContacts([]);
        setShowForm(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Add Contact (Uses setDoc with merge to prevent crashes)
  const handleSaveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }

    if (!user) return; // Safety check

    setIsLoading(true);
    const newContact = {
      name: contactName,
      phone: contactPhone,
      id: Date.now().toString()
    };

    try {
      const userDocRef = doc(db, "users", user.uid); // <--- USE REAL UID

      // 'setDoc' with 'merge: true' works even if the document doesn't exist yet
      await setDoc(userDocRef, {
        emergencyContacts: arrayUnion(newContact)
      }, { merge: true });

      setContactName('');
      setContactPhone('');
      setShowForm(false);
      Alert.alert("Success", "Contact added to your profile.");
    } catch (error) {
      Alert.alert('Error', 'Could not update profile.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Delete Contact
  const handleDelete = async (contactToDelete) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid); // <--- USE REAL UID

      await setDoc(userDocRef, {
        emergencyContacts: arrayRemove(contactToDelete)
      }, { merge: true });

    } catch (error) {
      console.error("Error deleting:", error);
      Alert.alert("Error", "Could not delete contact.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>

          <View style={styles.topRow}>
             <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Feather name="arrow-left" size={22} color="#1E232C" />
             </TouchableOpacity>
             <Text style={styles.header}>Emergency Contacts</Text>
          </View>

          {/* LIST OF CONTACTS */}
          {contacts.length > 0 && (
            <View style={styles.listContainer}>
              {contacts.map((contact, index) => (
                <View key={contact.id || index} style={styles.contactCard}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(contact)}>
                    <Feather name="trash-2" size={20} color="#FF4D4D" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* ADD BUTTON / FORM */}
          {!showForm ? (
            <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
              <Feather name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Another Contact</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.formHeaderRow}>
                <Text style={styles.formTitle}>New Contact Details</Text>
                {contacts.length > 0 && (
                  <TouchableOpacity onPress={() => setShowForm(false)}>
                     <Feather name="x" size={24} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mom"
                value={contactName}
                onChangeText={setContactName}
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 9876543210"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveContact} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Contact</Text>}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footerNote}>
             <Feather name="shield" size={16} color="#888" />
             <Text style={styles.footerText}>Synced to your HealthVault profile.</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8FA" },
  container: { flexGrow: 1, padding: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 10, backgroundColor: '#fff', borderRadius: 10, marginRight: 15, elevation: 2 },
  header: { fontSize: 22, fontWeight: "700", color: "#1E232C" },
  listContainer: { marginBottom: 20 },
  contactCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 10,
    elevation: 2, borderLeftWidth: 5, borderLeftColor: '#1E232C'
  },
  contactName: { fontSize: 16, fontWeight: '600', color: '#1E232C' },
  contactPhone: { fontSize: 14, color: '#666', marginTop: 2 },
  addButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#1E232C', padding: 16, borderRadius: 12, marginBottom: 20,
  },
  addButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  formContainer: {
    backgroundColor: '#FFF', padding: 20, borderRadius: 16, borderWidth: 1,
    borderColor: '#E8ECF4', marginBottom: 20,
  },
  formHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1E232C' },
  label: { fontSize: 14, fontWeight: '500', color: '#1E232C', marginBottom: 6 },
  input: {
    backgroundColor: '#F7F8FA', borderWidth: 1, borderColor: '#E8ECF4', borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 16, color: '#1E232C',
  },
  saveButton: {
    backgroundColor: '#28a745', borderRadius: 8, paddingVertical: 14, alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  footerNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto' },
  footerText: { color: '#888', marginLeft: 6, fontSize: 12 },
});

export default EmergencyScreen;