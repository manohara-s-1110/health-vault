import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebaseConfig"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { router } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function ManageProfile() {
  const user = auth.currentUser;
  const uid = user?.uid;
  const email = user?.email || "";

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  
  // We treat this as a local path string
  const [profilePicUri, setProfilePicUri] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Load user data
  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (!uid) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, "users", uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (!active) return;
          setFullName(data.fullName || "");
          setDob(data.dob || "");
          setGender(data.gender || "");
          setPhone(data.phone || "");
          // Load the local URI string from Firestore
          setProfilePicUri(data.profilePic || null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadProfile();
    return () => { active = false; };
  }, [uid]);

  // Pick image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to photos to select a profile picture.");
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // FIXED: Reverted to the stable property to prevent crash
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        // Just set the local URI immediately
        setProfilePicUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Could not open image picker.");
    }
  };

  // Date Picker Handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setDob(formattedDate);
    hideDatePicker();
  };

  // Save Data (Local-First Approach)
  const handleSave = async () => {
    if (!uid) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", uid);
      
      // Save text fields + the local image path string to Firestore
      await setDoc(
        userRef,
        {
          fullName,
          dob,
          gender,
          phone,
          profilePic: profilePicUri, // Saving the string directly
          email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      Alert.alert(
        "Success", 
        "Profile updated successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
      
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Email Sent", `A password reset link has been sent to ${email}`);
    } catch (err) {
      Alert.alert("Error", "Failed to send reset link. Please try again later.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#1E232C" />
            </TouchableOpacity>
            <Text style={styles.header}>Manage Profile</Text>
            <View style={{ width: 24 }} /> 
          </View>

          <View style={styles.profilePicContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              {profilePicUri ? (
                <Image
                  source={{ uri: profilePicUri }}
                  style={styles.profilePic}
                />
              ) : (
                <View style={[styles.profilePic, styles.profilePlaceholder]}>
                  <Feather name="user" size={40} color="#fff" />
                </View>
              )}
              <View style={styles.editIconBadge}>
                <Feather name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.hint}>Tap to change photo</Text>
          </View>

          <Text style={styles.sectionTitle}>Personal Details</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.dateInput}>
             <Text style={{ color: dob ? "#1E232C" : "#A0A0A0", fontSize: 15 }}>
               {dob || "Select Date of Birth"}
             </Text>
             <Feather name="calendar" size={18} color="#4A90E2" />
          </TouchableOpacity>

          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            value={gender}
            onChangeText={setGender}
            placeholder="e.g. Male, Female"
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, styles.disabled]}
            value={email}
            editable={false}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+91 00000 00000"
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.changePasswordBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.changePasswordText}>Reset Password via Email</Text>
            <Feather name="chevron-right" size={18} color="#555" />
          </TouchableOpacity>

          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.disabledSave]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
            date={dob ? new Date(dob) : new Date()}
            maximumDate={new Date()}
          />

          <Modal visible={modalVisible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalText}>
                  Send a password reset link to:
                </Text>
                <Text style={styles.modalEmail}>{email}</Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={async () => {
                      setModalVisible(false);
                      await handleChangePassword();
                    }}
                  >
                    <Text style={styles.confirmText}>Send Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 24, paddingBottom: 50 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  header: { fontSize: 20, fontWeight: "700", color: "#1E232C" },
  backButton: { padding: 5 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1E232C", marginTop: 20, marginBottom: 12 },
  profilePicContainer: { alignItems: "center", marginBottom: 10 },
  avatarWrapper: { position: "relative" },
  profilePic: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: "#F7F8FA" },
  profilePlaceholder: { backgroundColor: "#4A90E2", justifyContent: "center", alignItems: "center" },
  editIconBadge: { position: "absolute", bottom: 5, right: 5, backgroundColor: "#4A90E2", padding: 6, borderRadius: 15, borderWidth: 2, borderColor: "#fff" },
  hint: { color: "#8391A1", fontSize: 13, marginTop: 8 },
  label: { fontSize: 14, fontWeight: "500", color: "#1E232C", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#F7F8FA", borderWidth: 1, borderColor: "#E8ECF4", borderRadius: 8, height: 50, paddingHorizontal: 16, fontSize: 15, color: "#1E232C" },
  dateInput: { backgroundColor: "#F7F8FA", borderWidth: 1, borderColor: "#E8ECF4", borderRadius: 8, height: 50, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  disabled: { opacity: 0.6, backgroundColor: "#F0F2F5" },
  changePasswordBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#F7F8FA", borderRadius: 8, borderWidth: 1, borderColor: "#E8ECF4" },
  changePasswordText: { fontSize: 15, color: "#1E232C", fontWeight: "500" },
  spacer: { height: 30 },
  saveBtn: { backgroundColor: "#4A90E2", paddingVertical: 16, borderRadius: 8, alignItems: "center", shadowColor: "#4A90E2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  disabledSave: { backgroundColor: "#A9C5E3", shadowOpacity: 0 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { width: "85%", backgroundColor: "#fff", borderRadius: 16, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#1E232C" },
  modalText: { fontSize: 15, color: "#6A707C" },
  modalEmail: { fontWeight: "600", marginTop: 5, color: "#1E232C", fontSize: 15 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 24 },
  cancelBtn: { marginRight: 15, paddingVertical: 10, paddingHorizontal: 5 },
  cancelText: { color: "#6A707C", fontWeight: "600" },
  confirmBtn: { backgroundColor: "#4A90E2", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  confirmText: { color: "#fff", fontWeight: "600" },
});