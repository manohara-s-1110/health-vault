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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { sendPasswordResetEmail } from "firebase/auth";
import { router } from "expo-router";

export default function ManageProfile() {
  const user = auth.currentUser;
  const uid = user?.uid;
  const email = user?.email || "";

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicUri, setProfilePicUri] = useState(null);
  const [remoteProfilePicUrl, setRemoteProfilePicUrl] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Load user data from Firestore
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
          setRemoteProfilePicUrl(data.profilePic || null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, [uid]);

  // Pick image from gallery
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to media library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfilePicUri(result.assets[0].uri);
    }
  };

  // Upload profile image to Firebase Storage
  const uploadProfileImage = async (uri) => {
    if (!uri || !uid) return null;
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profilePics/${uid}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);
      await new Promise((resolve, reject) => {
        uploadTask.on("state_changed", null, reject, resolve);
      });
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Save details to Firestore
  const handleSave = async () => {
    if (!uid) {
      Alert.alert("Not signed in", "Please sign in again.");
      return;
    }
    setIsSaving(true);
    try {
      let uploadedUrl = remoteProfilePicUrl;
      if (profilePicUri) {
        const url = await uploadProfileImage(profilePicUri);
        if (url) uploadedUrl = url;
      }

      const userRef = doc(db, "users", uid);
      await setDoc(
        userRef,
        {
          fullName,
          dob,
          gender,
          phone,
          profilePic: uploadedUrl || null,
          email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setProfilePicUri(null);
      setRemoteProfilePicUrl(uploadedUrl);
      Alert.alert("Success", "Profile saved successfully!");
      router.push('/profile');
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Password reset email
  const handleChangePassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Email Sent", `A password reset link has been sent to ${email}`);
    } catch (err) {
      Alert.alert("Error", "Failed to send reset link.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1E232C" />
          <Text style={styles.header}>Manage Profile</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Personal Details</Text>

        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={pickImage}>
            {profilePicUri || remoteProfilePicUrl ? (
              <Image
                source={{ uri: profilePicUri || remoteProfilePicUrl }}
                style={styles.profilePic}
              />
            ) : (
              <View style={[styles.profilePic, styles.profilePlaceholder]}>
                <Feather name="user" size={36} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.hint}>Tap to change photo</Text>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
        />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={setGender}
          placeholder="Male / Female / Other"
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
          placeholder="+91 98765 43210"
        />

        <Text style={styles.sectionTitle}>Account Credentials</Text>
        <TouchableOpacity
          style={styles.changePasswordBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.changePasswordText}>Change Password</Text>
          <Feather name="chevron-right" size={18} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.disabledSave]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>

        {/* Modal for confirming password reset */}
        <Modal visible={modalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Text style={styles.modalText}>
                A reset link will be sent to:
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
                  <Text style={styles.confirmText}>Send Reset Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  header: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: "700",
    color: "#1E232C",
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E232C",
    marginTop: 10,
    marginBottom: 10,
  },
  profilePicContainer: { alignItems: "center", marginBottom: 20 },
  profilePic: { width: 100, height: 100, borderRadius: 100 },
  profilePlaceholder: {
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  hint: { color: "#8391A1", fontSize: 13, marginTop: 5 },
  label: { fontSize: 14, color: "#1E232C", marginBottom: 5 },
  input: {
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  disabled: { opacity: 0.6 },
  changePasswordBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F7F8FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    marginBottom: 15,
  },
  changePasswordText: { fontSize: 15, color: "#1E232C" },
  saveBtn: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledSave: { backgroundColor: "#A9C5E3" },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  modalText: { fontSize: 14, color: "#555" },
  modalEmail: { fontWeight: "600", marginTop: 8 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 15 },
  cancelBtn: { marginRight: 10, padding: 8 },
  cancelText: { color: "#555" },
  confirmBtn: { backgroundColor: "#4A90E2", borderRadius: 8, padding: 8 },
  confirmText: { color: "#fff", fontWeight: "600" },
});
