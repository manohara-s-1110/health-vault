// app/languagespreference.js
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { auth, db } from "../firebaseConfig"; // make sure firebaseConfig exports auth and db
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";


const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "pa", label: "Punjabi" },
  // add more if needed
];

export default function LanguagePreference() {
  const [language, setLanguage] = useState(""); // code like 'en'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchPreference = async () => {
      const user = auth.currentUser;
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data?.preferredLanguage) {
            if (mounted) setLanguage(data.preferredLanguage);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch language pref:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPreference();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please sign in to save your language preference.");
      return;
    }
    if (!language) {
      Alert.alert("Choose language", "Please select a preferred language first.");
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { preferredLanguage: language }, { merge: true });
      Alert.alert("Saved", "Your language preference has been saved.");
    } catch (err) {
      console.error("Failed to save language preference:", err);
      Alert.alert("Error", "Could not save preference. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "";

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Feather name="arrow-left" size={22} color="#1E232C" />
        </TouchableOpacity>
        <Text style={styles.header}>Language Preference</Text>

        <Text style={styles.label}>Select preferred language</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.dropdown}
          onPress={() => setModalVisible(true)}
          accessible={true}
          accessibilityLabel="Open language selector"
          accessibilityHint="Opens a list of available languages"
        >
          <Text style={[styles.selectedText, !selectedLabel && styles.placeholderText]}>
            {selectedLabel || "-- Select language --"}
          </Text>
          <Ionicons
            name={modalVisible ? "chevron-up" : "chevron-down"}
            size={20}
            style={styles.chev}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>

        {/* Modal for options */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose language</Text>

              <FlatList
                data={LANGUAGES}
                keyExtractor={(item) => item.code}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = item.code === language;
                  return (
                    <TouchableOpacity
                      style={[styles.optionRow, isSelected && styles.optionSelected]}
                      onPress={() => {
                        setLanguage(item.code);
                        setModalVisible(false);
                      }}
                      accessibilityLabel={`Select ${item.label}`}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {item.label}
                      </Text>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={18} />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close language selector"
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8FA" },
  container: { padding: 20, flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 22,textAlign: 'center', fontWeight: "700", color: "#1E232C", marginBottom: 16 },
  label: { fontSize: 14, color: "#6A707C", marginBottom: 8 },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  selectedText: { fontSize: 16, color: "#1E232C" },
  placeholderText: { color: "#8B94A6" },
  chev: { color: "#6A707C", marginLeft: 8 },
  saveButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: { backgroundColor: "#A9C5E3" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "65%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: { fontSize: 15, color: "#1E232C" },
  optionSelected: { backgroundColor: "#F0F6FF", borderRadius: 8 },
  optionTextSelected: { fontWeight: "700" },
  separator: { height: 1, backgroundColor: "#F1F3F6" },
  modalClose: {
    marginTop: 12,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  modalCloseText: { color: "#4A90E2", fontWeight: "700" },
});
