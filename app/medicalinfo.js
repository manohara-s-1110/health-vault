// app/medicalinfo.js
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, app } from "../firebaseConfig"; // assumes you export `auth` and `app` from firebaseConfig
import { onAuthStateChanged } from "firebase/auth";

/*
  Medical Info page:
  - Fetches existing users/{uid}.medicalInfo on load and pre-fills the fields
  - If no data exists, inputs remain empty and show placeholders
  - Save button writes to Firestore under users/{uid}.medicalInfo (merge)
*/

const Field = ({ label, value, onChangeText, keyboardType = "default", placeholder = "" }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder || label}
      placeholderTextColor="#8391A1"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

export default function MedicalInfo() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("User");

  // form fields
  const [age, setAge] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [cholesterolLevels, setCholesterolLevels] = useState("");
  const [bmi, setBmi] = useState("");

  const [loading, setLoading] = useState(true); // loading initial fetch
  const [saving, setSaving] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setDisplayName(u.displayName || (u.email ? u.email.split("@")[0] : "User"));
      } else {
        setUser(null);
        setDisplayName("User");
      }
    });
    return () => unsub();
  }, []);

  // Fetch medicalInfo when user becomes available
  useEffect(() => {
    let cancelled = false;
    const fetchMedicalInfo = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userDocRef);

        if (!cancelled) {
          if (snapshot.exists()) {
            const data = snapshot.data() || {};
            const mi = data.medicalInfo || {};

            // If a field exists, fill it; otherwise leave empty (show placeholder)
            setAge(mi.age ?? "");
            setHeartRate(mi.heartRate ?? "");
            setBloodGroup(mi.bloodGroup ?? "");
            setWeight(mi.weight ?? "");
            setBloodSugar(mi.bloodSugar ?? "");
            setCholesterolLevels(mi.cholesterolLevels ?? "");
            setBmi(mi.bmi ?? "");
          } else {
            // No user doc -> keep fields empty (placeholders visible)
            setAge("");
            setHeartRate("");
            setBloodGroup("");
            setWeight("");
            setBloodSugar("");
            setCholesterolLevels("");
            setBmi("");
          }
        }
      } catch (err) {
        console.error("Error fetching medicalInfo:", err);
        if (!cancelled) {
          Alert.alert("Load failed", "Could not load medical information. Check your connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMedicalInfo();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const validateNumeric = (val) => {
    if (!val) return true;
    return /^(\d+(\.\d+)?)$/.test(val);
  };

  const saveToFirestore = async () => {
    if (!user) {
      Alert.alert("Not signed in", "Please sign in to save medical info.");
      return;
    }

    // basic numeric validation
    if (
      !validateNumeric(age) ||
      !validateNumeric(heartRate) ||
      !validateNumeric(weight) ||
      !validateNumeric(bloodSugar) ||
      !validateNumeric(cholesterolLevels) ||
      !validateNumeric(bmi)
    ) {
      Alert.alert("Invalid input", "Please enter valid numeric values for numeric fields.");
      return;
    }

    setSaving(true);

    const payload = {
      age: age.trim() || null,
      heartRate: heartRate.trim() || null,
      bloodGroup: bloodGroup.trim() || null,
      weight: weight.trim() || null,
      bloodSugar: bloodSugar.trim() || null,
      cholesterolLevels: cholesterolLevels.trim() || null,
      bmi: bmi.trim() || null,
      updatedAt: new Date().toISOString(),
    };

    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { medicalInfo: payload }, { merge: true });

      Alert.alert("Saved", "Medical information saved successfully.");
      router.back();
    } catch (error) {
      console.error("Firestore save error:", error);
      Alert.alert("Save failed", "Could not save medical information. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Feather name="user" size={22} color="#1E232C" style={{ marginRight: 8 }} />
          <Text style={styles.headerText}>{displayName} Medical Info</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Field label="Age" value={age} onChangeText={setAge} keyboardType="numeric" placeholder="e.g., 35" />
            <Field label="Heart Rate (bpm)" value={heartRate} onChangeText={setHeartRate} keyboardType="numeric" placeholder="e.g., 72" />
            <Field label="Blood Group" value={bloodGroup} onChangeText={setBloodGroup} placeholder="e.g., A+, O-" />
            <Field label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="e.g., 70" />
            <Field label="Blood Sugar (mg/dL)" value={bloodSugar} onChangeText={setBloodSugar} keyboardType="numeric" placeholder="e.g., 90" />
            <Field label="Cholesterol Levels (mg/dL)" value={cholesterolLevels} onChangeText={setCholesterolLevels} keyboardType="numeric" placeholder="e.g., 180" />
            <Field label="Body Mass Index (BMI)" value={bmi} onChangeText={setBmi} keyboardType="numeric" placeholder="e.g., 22.5" />

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveToFirestore}
              disabled={saving}
            >
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerText: { fontSize: 20, fontWeight: "700", color: "#1E232C" },
  inputContainer: { marginBottom: 14 },
  label: { fontSize: 13, color: "#1E232C", marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#F7F8FA",
    height: 50,
    borderColor: "#E8ECF4",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1E232C",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 18,
  },
  saveButtonDisabled: { backgroundColor: "#A9C5E3" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelButton: { marginTop: 12, alignItems: "center" },
  cancelButtonText: { color: "#6A707C", fontSize: 15 },
});
