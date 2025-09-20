// app/(tabs)/reports.js
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReportsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Reports</Text>
        <Text style={styles.subtitle}>Keep all your medical records organized and accessible.</Text>
        
        {/* The Link component wraps the widget to handle navigation */}
        <Link href="/add_report" asChild>
          <TouchableOpacity style={styles.addWidget}>
            <Ionicons name="add-circle-outline" size={32} color="#4A90E2" />
            <Text style={styles.addWidgetText}>Add New Report</Text>
          </TouchableOpacity>
        </Link>

        {/* Placeholder for where the list of reports will go */}
        <View style={styles.placeholderContainer}>
            <Ionicons name="document-text-outline" size={60} color="#CED5E0" />
            <Text style={styles.placeholderText}>Your uploaded reports will appear here.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  container: { 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1E232C', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#8391A1', 
    marginBottom: 30 
  },
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
  addWidgetText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  placeholderText: {
    marginTop: 15,
    fontSize: 16,
    color: '#8391A1',
    textAlign: 'center'
  }
});