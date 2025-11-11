// app/report/[id].js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Reusable component for displaying a detail row
const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
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
    if (id) loadReport();
  }, [id]);

  // --- Function to open the file (lazy import + fallback) ---
  const handleViewFile = async () => {
    if (!report?.fileUri) {
      Alert.alert("No File", "No file was saved with this report.");
      return;
    }

    try {
      // lazy import so Metro won't require the native module at startup
      const SharingModule = await import('expo-sharing').catch(() => null);

      if (SharingModule && SharingModule.isAvailableAsync) {
        try {
          const available = await SharingModule.isAvailableAsync();
          if (available) {
            await SharingModule.shareAsync(report.fileUri);
            return;
          }
        } catch (e) {
          // continue to fallback
          console.warn('Sharing module failed at runtime:', e);
        }
      }
    } catch (err) {
      console.warn('Error importing expo-sharing dynamically:', err);
    }

    // Fallback: try to open by URL (Files app / default viewer)
    try {
      const opened = await Linking.openURL(report.fileUri);
      // sometimes openURL resolves undefined, so we just try
    } catch (err) {
      console.warn('Fallback openURL failed:', err);
      Alert.alert('Open failed', 'Cannot open file on this device. Try installing a PDF viewer or use the web build.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Report not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#1E232C" />
        <Text style={styles.backButtonText}>Back to Reports</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{report.reportType} - {report.patientName}</Text>

      <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert("Edit", "Edit functionality coming soon.")}>
        <Ionicons name="pencil" size={18} color="#fff" />
        <Text style={styles.editButtonText}>Edit Report</Text>
      </TouchableOpacity>

      {report.summary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Full AI Summary</Text>
          <Text style={styles.summaryText}>{report.summary}</Text>
        </View>
      )}

      {report.fileUri && (
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>View Report File</Text>
          <TouchableOpacity style={styles.viewFileButton} onPress={handleViewFile}>
            <Ionicons name="document-attach-outline" size={20} color="#fff" />
            <Text style={styles.viewFileButtonText}>Open Original Report</Text>
          </TouchableOpacity>
        </View>
      )}

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
  viewFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34A853',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  viewFileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
