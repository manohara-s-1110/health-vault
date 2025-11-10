
// app/report/[id].js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

// Reusable component for displaying a detail row
const DetailRow = ({ label, value }) => {
  if (!value) return null; // Don't show empty rows
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams(); // Get the ID from the URL
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await AsyncStorage.getItem('reports');
        const allReports = data ? JSON.parse(data) : [];
        const foundReport = allReports.find(r => r.id === id);
        setReport(foundReport);
      } catch (e) {
        console.log('Error loading report:', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadReport();
    }
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Report not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if the file is an image
  const isImage = report.fileUri && (report.fileUri.endsWith('.jpg') || report.fileUri.endsWith('.png') || report.fileUri.endsWith('.jpeg'));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E232C" />
          <Text style={styles.backButtonText}>Back to Reports</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{report.reportType} - {report.patientName}</Text>
        
        {/* --- Edit Button --- */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => { /* I can help you build the edit page next! */ Alert.alert("Edit", "Edit functionality coming soon.")}}
        >
          <Ionicons name="pencil" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Edit Report</Text>
        </TouchableOpacity>
        
        {/* --- AI Summary Section --- */}
        {report.summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Full AI Summary</Text>
            <Text style={styles.summaryText}>{report.summary}</Text>
          </View>
        )}

        {/* --- File Viewer Section --- */}
        {report.fileUri && (
          <View style={styles.fileViewerContainer}>
            <Text style={styles.sectionTitle}>View Report File</Text>
            {isImage ? (
              <Image source={{ uri: report.fileUri }} style={styles.fileImage} />
            ) : (
              <WebView
                originWhitelist={['*']}
                source={{ uri: report.fileUri }}
                style={styles.fileWebView}
              />
            )}
          </View>
        )}
        
        {/* --- All Other Details --- */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Report Details</Text>
          <DetailRow label="Patient Name" value={report.patientName} />
          <DetailRow label="Age" value={report.age} />
          <DetailRow label="Report Date" value={report.reportDate} />
          <DetailRow label="Hospital" value={report.hospitalName} />
          <DetailRow label="Doctor" value={report.doctorName} />
          <DetailRow label="Blood Pressure" value={report.bp} />
          <DetailRow label="Temperature" value={report.temperature ? `${report.temperature}°C` : null} />
          <DetailRow label="BMI" value={report.bmi} />
          <DetailRow label="Medications" value={report.medications} />
          <DetailRow label="Advice" value={report.advice} />
          <DetailRow label="Follow-up Date" value={report.followUpDate} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButtonText: { fontSize: 16, color: '#1E232C', marginLeft: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E232C', marginBottom: 16 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryContainer: {
    backgroundColor: '#E9F0F8',
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF4',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 15,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8391A1',
  },
  detailValue: {
    fontSize: 16,
    color: '#1E232C',
    marginTop: 4,
  },
  fileViewerContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  fileImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#f0f0f0',
  },
  fileWebView: {
    width: '100%',
    height: 500,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  }
});