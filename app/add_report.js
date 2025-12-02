import React, { useState } from "react";
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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { copyAsync, documentDirectory } from "expo-file-system/legacy";
import uuid from "react-native-uuid";

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

  // --- HANDLING IMAGES (Camera or Gallery) ---
  const handleImagePick = () => {
    Alert.alert(
      'Upload Image',
      'Choose source',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: pickFromCamera },
        { text: 'Gallery', onPress: pickFromGallery },
      ],
      { cancelable: true }
    );
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo access.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // Using string to avoid version crashes
        quality: 0.8,
        allowsEditing: false,
      });
      if (!res.canceled) processPickedAsset(res.assets[0]);
    } catch (err) {
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow camera access.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images', // Using string to avoid version crashes
        quality: 0.8,
      });
      if (!res.canceled) processPickedAsset(res.assets[0]);
    } catch (err) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  // --- HANDLING DOCUMENTS (PDFs) ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        processPickedAsset(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick document.');
    }
  };

  // Helper to normalize file data
  const processPickedAsset = (asset) => {
    const uri = asset.uri;
    const name = asset.fileName || asset.name || uri.split('/').pop();
    const mimeType = asset.mimeType || (name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    setPickedFile({ uri, name, mimeType });
  };

  const saveFileToFS = async (file) => {
    if (!file) return null;
    const fileName = `${uuid.v4()}-${file.name}`;
    const dest = documentDirectory + fileName;
    try {
      await copyAsync({ from: file.uri, to: dest });
      return dest;
    } catch (error) {
      return null;
    }
  };

  const saveReport = async () => {
    if (!patientName.trim() || !reportType.trim()) {
      Alert.alert("Error", "Please fill in at least Patient Name and Report Type.");
      return;
    }

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

        const response = await fetch('https://health-vault-ewwl.onrender.com/process-report', {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.ok) {
          const result = await response.json();
          summary = result.summary;
        }
      } catch (error) {
        console.log("Summary gen failed, saving without it.");
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

      Alert.alert("Success", "Report saved successfully!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert("Error", "Could not save the report.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Add Report</Text>

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

        {/* --- NEW UPLOAD SECTION --- */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Upload Report</Text>
          
          {pickedFile ? (
            <View style={styles.filePreviewContainer}>
              {pickedFile.mimeType?.startsWith('image/') ? (
                <Image source={{ uri: pickedFile.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.docPreview}>
                  <Ionicons name="document-text" size={40} color="#4A90E2" />
                </View>
              )}
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{pickedFile.name}</Text>
                <TouchableOpacity onPress={() => setPickedFile(null)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.uploadOptionBtn} onPress={handleImagePick}>
                <Ionicons name="image" size={24} color="#4A90E2" />
                <Text style={styles.uploadOptionText}>Image</Text>
              </TouchableOpacity>
              
              <View style={{width: 15}} /> 

              <TouchableOpacity style={styles.uploadOptionBtn} onPress={pickDocument}>
                <Ionicons name="document-text" size={24} color="#4A90E2" />
                <Text style={styles.uploadOptionText}>PDF</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} onPress={saveReport} disabled={isSaving}>
          {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Save Report</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  
  // New Upload Styles
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  uploadOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  uploadOptionText: { marginLeft: 8, color: '#4A90E2', fontWeight: '600' },
  
  filePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8ECF4'
  },
  previewImage: { width: 50, height: 50, borderRadius: 4 },
  docPreview: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  fileInfo: { flex: 1, marginLeft: 10 },
  fileName: { fontSize: 14, color: '#1E232C', marginBottom: 4 },
  removeText: { fontSize: 12, color: 'red', fontWeight: '600' },

  saveButton: { backgroundColor: "#4A90E2", paddingVertical: 16, borderRadius: 8, alignItems: "center", marginTop: 24 },
  saveButtonDisabled: { backgroundColor: "#A9C5E3" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});