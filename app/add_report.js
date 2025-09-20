// app/addReport.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// A reusable component for input fields to keep the code DRY
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
      keyboardType={keyboardType || 'default'}
    />
  </View>
);

export default function AddReportScreen() {
  const [reportType, setReportType] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [bp, setBp] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bmi, setBmi] = useState('');
  const [medications, setMedications] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Add Report</Text>

        <FormInput
          label="Report Type"
          placeholder="General, diabetes etc"
          value={reportType}
          onChangeText={setReportType}
        />

        <FormInput
          label="Patient Name"
          placeholder="John Wick"
          value={patientName}
          onChangeText={setPatientName}
        />

        <View style={styles.row}>
          <FormInput
            label="Age"
            placeholder="20"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            containerStyle={{ flex: 1, marginRight: 8 }}
          />
          <FormInput
            label="Report Date"
            placeholder="XX-XX-XXXX"
            value={reportDate}
            onChangeText={setReportDate}
            containerStyle={{ flex: 1, marginLeft: 8 }}
          />
        </View>

        <FormInput
          label="Hospital Name"
          placeholder="Manipal Hospital"
          value={hospitalName}
          onChangeText={setHospitalName}
        />

        <FormInput
          label="Doctor Name"
          placeholder="Dr srinivas"
          value={doctorName}
          onChangeText={setDoctorName}
        />

        <View style={styles.row}>
            <FormInput
                label="Bp"
                placeholder="120/80"
                value={bp}
                onChangeText={setBp}
                containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <View style={{flex: 1, marginLeft: 8}}>
                 <Text style={styles.label}>Temperature</Text>
                 <View style={styles.tempInputContainer}>
                    <TextInput
                        style={styles.tempInput}
                        placeholder="33"
                        placeholderTextColor="#8391A1"
                        value={temperature}
                        onChangeText={setTemperature}
                        keyboardType="numeric"
                    />
                    <Text style={styles.tempUnit}>°C</Text>
                 </View>
            </View>
        </View>

        <FormInput
            label="BMI"
            placeholder="20"
            value={bmi}
            onChangeText={setBmi}
            keyboardType="numeric"
        />


        <FormInput
          label="Medications Prescribed"
          placeholder="List with name & dosage"
          value={medications}
          onChangeText={setMedications}
          multiline
        />

        <FormInput
          label="Treatment / Lifestyle Advice"
          placeholder="E.g., rest, diet, exercise, precautions"
          value={advice}
          onChangeText={setAdvice}
          multiline
        />

        <FormInput
          label="Follow-up Date"
          placeholder="XX-XX-XXXX"
          value={followUpDate}
          onChangeText={setFollowUpDate}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Upload Report</Text>
          <View style={styles.uploadRow}>
            <View style={styles.uploadPlaceholder} />
            <TouchableOpacity style={styles.uploadButton}>
              <Ionicons name="add" size={32} color="#1E232C" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E232C',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E232C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F8FA',
    height: 52,
    borderColor: '#E8ECF4',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1E232C',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tempInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderColor: '#E8ECF4',
    borderWidth: 1,
    borderRadius: 8,
    height: 52,
  },
  tempInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1E232C',
  },
  tempUnit: {
    fontSize: 15,
    color: '#8391A1',
    paddingHorizontal: 16,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});