import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db , auth } from '../../firebaseConfig'; // Check your path!

export default function UpdateDataModal({ visible, onClose, widgetConfig }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);


  if (!widgetConfig) return null;

  const { field, title, unit, inputType } = widgetConfig.dataConfig;

  const handleSave = async () => {
      if (!value.trim()) return;

      setLoading(true);
      try {
        const user = auth.currentUser;

        // DEBUG: Check if user is actually logged in
        console.log("Current User UID:", user ? user.uid : "No User");

        if (!user) {
          alert("Error: You are not logged in!");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);

        await setDoc(userRef, {
          medicalInfo: {
            [field]: value
          }
        }, { merge: true });

        console.log("Save Success!");
        onClose();
      } catch (error) {
        console.error("Error saving data:", error);
        // --- THIS WILL TELL YOU THE EXACT PROBLEM ---
        alert("Error: " + error.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${field}...`}
              placeholderTextColor="#CCC"
              value={value}
              onChangeText={setValue}
              keyboardType={inputType === 'numeric' ? 'decimal-pad' : 'default'}
              autoFocus={true}
            />
            {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 5 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, backgroundColor: '#F9F9F9' },
  input: { flex: 1, paddingVertical: 15, fontSize: 18, color: '#333' },
  unitText: { fontSize: 16, color: '#888', fontWeight: '600', marginLeft: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { flex: 1, marginRight: 10, padding: 15, alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#888', fontWeight: '600' },
  saveButton: { flex: 1, marginLeft: 10, backgroundColor: '#007AFF', borderRadius: 12, padding: 15, alignItems: 'center' },
  saveText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
});