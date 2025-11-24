import React, { useState } from "react";
// at top of file: add imports
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS, Platform } from 'react-native';

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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { copyAsync, documentDirectory } from "expo-file-system/legacy";
import uuid from "react-native-uuid";

// Reusable input component
const FormInput = ({ label, placeholder, value, onChangeText, multiline, keyboardType, containerStyle }) => (
  <View style={[styles.inputContainer, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      placeholder={placeholder}
      placeholderTextColor="#8391A1"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      keyboardType={keyboardType || "default"}
    />
  </View>
);

export default function AddReport() {
  const router = useRouter();
  const [reportType, setReportType] = useState("");
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [bp, setBp] = useState("");
  const [temperature, setTemperature] = useState("");
  const [bmi, setBmi] = useState("");
  const [medications, setMedications] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [pickedFile, setPickedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);


  // new pickFile implementation
  const pickFile = async () => {
    const openImageLibrary = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please allow photo library access in Settings.');
          return;
        }

        // NOTE: use ImagePicker.MediaType (new API)
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images, // updated API
          quality: 0.8,
          allowsEditing: false,
        });

        // normalize response for old/new SDKs:
        // new SDK returns { canceled: boolean, assets: [ { uri, fileName, type, ... } ] }
        // older SDK returned { cancelled: boolean, uri, ... } (British spelling)
        if (res.canceled || res.cancelled) return;

        const asset = Array.isArray(res.assets) && res.assets.length > 0 ? res.assets[0] : res;
        const uri = asset.uri || asset.uri; // explicit
        if (!uri) return; // safety

        const name = asset.fileName || asset.name || uri.split('/').pop();
        // Try to create a sensible mime type:
        const ext = name && name.includes('.') ? name.split('.').pop().toLowerCase() : '';
        const mimeType =
          asset.type && ext ? `${asset.type}/${ext}` : // asset.type is typically 'image'
          asset.mimeType ||
          (ext ? `image/${ext}` : 'image/jpeg');

        setPickedFile({ uri, name, mimeType });
      } catch (err) {
        console.error('Image pick error', err);
        Alert.alert('Error', 'Could not pick image.');
      }
    };

    const takePhoto = async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please allow camera access in Settings.');
          return;
        }

        const res = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });

        if (res.canceled || res.cancelled) return;
        const asset = Array.isArray(res.assets) && res.assets.length ? res.assets[0] : res;
        const uri = asset.uri;
        if (!uri) return;
        const name = asset.fileName || asset.name || uri.split('/').pop();
        const ext = name && name.includes('.') ? name.split('.').pop().toLowerCase() : '';
        const mimeType = asset.type && ext ? `${asset.type}/${ext}` : (asset.mimeType || (ext ? `image/${ext}` : 'image/jpeg'));
        setPickedFile({ uri, name, mimeType });
      } catch (err) {
        console.error('Camera error', err);
        Alert.alert('Error', 'Could not open camera.');
      }
    };

    const pickDocument = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });

        // handle both shapes like earlier
        if (result.type === 'success') {
          const uri = result.uri;
          const name = result.name || (uri ? uri.split('/').pop() : 'file');
          const mimeType = result.mimeType || (name.includes('.') ? `application/${name.split('.').pop()}` : 'application/octet-stream');
          setPickedFile({ uri, name, mimeType });
        } else if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setPickedFile({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType,
          });
        } else {
          // user cancelled
        }
      } catch (err) {
        console.error('Document pick error', err);
        Alert.alert('Error', 'Could not pick document.');
      }
    };

    // present choices
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Choose from Photos', 'Take Photo', 'Pick Document'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openImageLibrary();
          else if (buttonIndex === 2) takePhoto();
          else if (buttonIndex === 3) pickDocument();
        }
      );
    } else {
      Alert.alert(
        'Upload Report',
        'Choose source',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Choose from Photos', onPress: openImageLibrary },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Pick Document', onPress: pickDocument },
        ],
        { cancelable: true }
      );
    }
  };



  // Save file to local filesystem
  const saveFileToFS = async (file) => {
    if (!file) return null;
    const fileName = `${uuid.v4()}-${file.name}`;
    const dest = documentDirectory + fileName;
    try {
      await copyAsync({ from: file.uri, to: dest });
      return dest;
    } catch (error) {
      console.log("File copy error:", error);
      return null;
    }
  };

  // Save report function
  const saveReport = async () => {
    
    // --- UPDATED VALIDATION ---
    // Only these two fields are mandatory. .trim() removes whitespace.
    if (!patientName.trim() || !reportType.trim()) {
      Alert.alert("Error", "Please fill in at least Patient Name and Report Type.");
      return;
    }
    // --- END OF UPDATE ---

    setIsSaving(true);
    let summary = "Summary could not be generated."; 

    if (pickedFile) {
      try {
        const formData = new FormData();
        formData.append('reportFile', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType,
        });

        // Your live Render URL
        const response = await fetch('https://health-vault-ewwl.onrender.com/process-report', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.ok) {
          throw new Error('Server responded with an error.');
        }

        const result = await response.json();
        summary = result.summary;

      } catch (error) {
        console.error("Failed to get summary:", error);
        Alert.alert("Summary Failed", "The report will be saved without an AI summary.");
      }
    }

    try {
      const savedFileUri = await saveFileToFS(pickedFile);

      const newReport = {
        id: uuid.v4(),
        reportType, patientName, age, reportDate,
        hospitalName, doctorName, bp, temperature, bmi,
        medications, advice, followUpDate,
        fileUri: savedFileUri,
        summary: summary,
      };

      const existingReportsData = await AsyncStorage.getItem("reports");
      const existingReports = existingReportsData ? JSON.parse(existingReportsData) : [];
      const updatedReports = [...existingReports, newReport];
      await AsyncStorage.setItem("reports", JSON.stringify(updatedReports));

      Alert.alert(
        "Success",
        "Report saved successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );

    } catch (error) {
      console.error("Failed to save report:", error);
      Alert.alert("Error", "Could not save the report. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Add Report</Text>

        {/* --- Form Inputs --- */}
        <FormInput label="Report Type *" placeholder="e.g., Blood Test, X-Ray" value={reportType} onChangeText={setReportType} />
        <FormInput label="Patient Name *" placeholder="John Doe" value={patientName} onChangeText={setPatientName} />
        <View style={styles.row}>
          <FormInput label="Age" placeholder="e.g., 35" value={age} onChangeText={setAge} keyboardType="numeric" containerStyle={{ flex: 1, marginRight: 8 }} />
          <FormInput label="Report Date" placeholder="DD-MM-YYYY" value={reportDate} onChangeText={setReportDate} containerStyle={{ flex: 1, marginLeft: 8 }} />
        </View>
        <FormInput label="Hospital Name" placeholder="City Hospital" value={hospitalName} onChangeText={setHospitalName} />
        <FormInput label="Doctor Name" placeholder="Dr. Smith" value={doctorName} onChangeText={setDoctorName} />
        <View style={styles.row}>
          <FormInput label="Blood Pressure" placeholder="e.g., 120/80" value={bp} onChangeText={setBp} containerStyle={{ flex: 1, marginRight: 8 }} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Temperature</Text>
            <View style={styles.tempInputContainer}>
              <TextInput style={styles.tempInput} placeholder="37" placeholderTextColor="#8391A1" value={temperature} onChangeText={setTemperature} keyboardType="numeric" />
              <Text style={styles.tempUnit}>°C</Text>
            </View>
          </View>
        </View>
        <FormInput label="BMI" placeholder="e.g., 22.5" value={bmi} onChangeText={setBmi} keyboardType="numeric" />
        <FormInput label="Medications Prescribed" placeholder="List with name & dosage" value={medications} onChangeText={setMedications} multiline />
        <FormInput label="Treatment / Lifestyle Advice" placeholder="e.g., rest, diet, exercise" value={advice} onChangeText={setAdvice} multiline />
        <FormInput label="Follow-up Date" placeholder="DD-MM-YYYY" value={followUpDate} onChangeText={setFollowUpDate} />

        {/* --- Upload Section --- */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Upload Report (Image or PDF)</Text>
          <View style={styles.uploadRow}>
            {pickedFile && pickedFile.mimeType?.startsWith("image/") ? (
              <Image source={{ uri: pickedFile.uri }} style={styles.uploadPreview} />
            ) : (
              <View style={styles.uploadPreview}>
                <Ionicons name={pickedFile ? "document-text-outline" : "attach-outline"} size={40} color="#8391A1" />
                {pickedFile && <Text style={styles.fileName} numberOfLines={1}>{pickedFile.name}</Text>}
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={pickFile} disabled={isSaving}>
              <Ionicons name="add" size={32} color="#1E232C" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Save Button --- */}
        <TouchableOpacity style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} onPress={saveReport} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#1E232C", textAlign: "center", marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#1E232C", marginBottom: 8 },
  input: { backgroundColor: "#F7F8FA", height: 52, borderColor: "#E8ECF4", borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, fontSize: 15, color: "#1E232C" },
  multilineInput: { height: 100, textAlignVertical: "top", paddingTop: 16 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  tempInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F7F8FA", borderColor: "#E8ECF4", borderWidth: 1, borderRadius: 8, height: 52 },
  tempInput: { flex: 1, paddingHorizontal: 16, fontSize: 15, color: "#1E232C" },
  tempUnit: { fontSize: 15, color: "#8391A1", paddingHorizontal: 16 },
  uploadRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  uploadPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4, 
  },
  fileName: {
    fontSize: 10,
    color: '#8391A1',
    marginTop: 4,
    textAlign: 'center',
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: "#A9C5E3", 
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});