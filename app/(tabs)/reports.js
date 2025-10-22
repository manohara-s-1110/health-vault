import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Image, Alert, Platform } from 'react-native';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReportsScreen() {
  const [reports, setReports] = useState([]);

  // This hook re-loads data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadReports = async () => {
        try {
          const data = await AsyncStorage.getItem('reports');
          setReports(data ? JSON.parse(data) : []);
        } catch (e) {
          console.log('Error loading reports:', e);
          setReports([]);
        }
      };

      loadReports();
    }, [])
  );

  // Function to handle the deletion of a report
  const handleDeleteReport = (reportId) => {
    // This is the core logic for deleting the report
    const performDelete = async () => {
      try {
        const updatedReports = reports.filter(report => report.id !== reportId);
        await AsyncStorage.setItem('reports', JSON.stringify(updatedReports));
        setReports(updatedReports);
      } catch (e) {
        console.log('Error deleting report:', e);
        Alert.alert("Error", "Failed to delete the report.");
      }
    };

    // Use the browser's confirm dialog on web, and the native Alert on mobile
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
        performDelete();
      }
    } else {
      Alert.alert(
        "Delete Report",
        "Are you sure you want to delete this report? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", onPress: performDelete, style: "destructive" }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Reports</Text>
        <Text style={styles.subtitle}>Keep all your medical records organized and accessible.</Text>

        <Link href="/add_report" asChild>
          <TouchableOpacity style={styles.addWidget}>
            <Ionicons name="add-circle-outline" size={32} color="#4A90E2" />
            <Text style={styles.addWidgetText}>Add New Report</Text>
          </TouchableOpacity>
        </Link>

        {reports.length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Ionicons name="document-text-outline" size={60} color="#CED5E0" />
            <Text style={styles.placeholderText}>Your uploaded reports will appear here.</Text>
          </View>
        ) : (
          [...reports].reverse().map((rep) => (
            <View key={rep.id} style={styles.reportCard}>
              <View style={styles.reportRow}>
                {/* Main content area */}
                <View style={styles.reportContent}>
                  <View style={styles.reportText}>
                    <Text style={styles.reportTitle}>{rep.reportType} - {rep.patientName}</Text>
                    <Text>Age: {rep.age} | Date: {rep.reportDate}</Text>
                    <Text>Hospital: {rep.hospitalName} | Doctor: {rep.doctorName}</Text>
                    <Text>BP: {rep.bp} | Temp: {rep.temperature}°C | BMI: {rep.bmi}</Text>
                    <Text>Medications: {rep.medications}</Text>
                    <Text>Advice: {rep.advice}</Text>
                    <Text>Follow-up: {rep.followUpDate}</Text>
                  </View>
                  {rep.fileUri && (
                    <Image
                      source={{ uri: rep.fileUri }}
                      style={styles.reportImage}
                    />
                  )}
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteReport(rep.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E232C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#8391A1', marginBottom: 30 },
  addWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F7F9FC',
    marginBottom: 40,
  },
  addWidgetText: { fontSize: 18, fontWeight: '600', color: '#4A90E2', marginLeft: 10 },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  placeholderText: { marginTop: 15, fontSize: 16, color: '#8391A1', textAlign: 'center' },
  reportCard: {
    backgroundColor: '#F7F9FC',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportContent: {
    flex: 1,
    flexDirection: 'row',
  },
  reportText: {
    flex: 1,
    paddingRight: 10,
  },
  reportTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  reportImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
});