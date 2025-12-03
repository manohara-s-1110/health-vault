import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

// Import the registry
import { AVAILABLE_WIDGETS } from '../widgets/widgetRegistry.js';
import UpdateDataModal from '../widgets/UpdateDataModal.js';
import ImageCarousel from '../ImageCarousel/ImageCarousel.js';

export default function App() {
  const router = useRouter();

  // Initialize with 4 Default Widgets
  const [activeWidgets, setActiveWidgets] = useState(() => {
    const defaultTypes = ['bmi', 'weight', 'height', 'water'];
    return defaultTypes.map((type, index) => {
      const widgetConfig = AVAILABLE_WIDGETS.find(w => w.type === type);
      if (widgetConfig) {
        return {
          id: `default-${index}`,
          ...widgetConfig,
        };
      }
      return null;
    }).filter(Boolean);
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);

  const handleAddWidget = (widgetConfig) => {
    const newWidget = {
      id: Date.now().toString(),
      ...widgetConfig,
    };
    setActiveWidgets([...activeWidgets, newWidget]);
    setModalVisible(false);
  };

  const confirmDelete = (id) => {
    Alert.alert("Remove Widget", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setActiveWidgets(curr => curr.filter(w => w.id !== id))
      }
    ]);
  };

  // --- Emergency Handler ---
  const handleEmergency = () => {
    Alert.alert(
      "Emergency SOS",
      "Are you sure? Your saved contacts will be notified immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => {
            // Mock Notification Logic
            setTimeout(() => {
              Alert.alert(
                "Contacts Notified",
                "Your emergency contacts have been alerted.\n\nDo you want to find the nearest hospital?",
                [
                  { text: "No", style: "cancel" },
                  {
                    text: "Find Hospital",
                    onPress: () => {
                      // --- UNCOMMENTED: Navigates to Explore Page ---
                      router.push('/explore');
                    }
                  }
                ]
              );
            }, 500);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Dashboard</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* 1. Image Carousel */}
        <ImageCarousel />

        {/* 2. Latest Report Section */}
        <TouchableOpacity
          style={styles.reportSection}
          onPress={() => router.push('/reports')}
        >
          <View style={styles.reportContent}>
            <View style={styles.reportIconBadge}>
              <Text style={{ fontSize: 18 }}>📄</Text>
            </View>
            <View>
              <Text style={styles.reportTitle}>Latest Report</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* 3. Dashboard Widgets */}
        <View style={styles.widgetContainer}>
          {activeWidgets.length === 0 ? (
            <Text style={styles.emptyText}>Tap "+ Add" to choose a widget</Text>
          ) : (
            activeWidgets.map((widget) => (
              <Pressable
                key={widget.id}
                style={[styles.widgetCard, { backgroundColor: widget.color }]}
                onLongPress={() => confirmDelete(widget.id)}
                delayLongPress={500}
                onPress={() => setSelectedWidget(widget)}
              >
                <widget.component />
              </Pressable>
            ))
          )}
        </View>

        {/* 4. Emergency Section */}
        <View style={styles.emergencyContainer}>
          <TouchableOpacity
            style={styles.emergencyButton}
            activeOpacity={0.8}
            onPress={handleEmergency}
          >
            <View style={styles.emergencyIconContainer}>
              <Text style={styles.emergencyIcon}>🚨</Text>
            </View>
            <View style={styles.emergencyTextContainer}>
              <Text style={styles.emergencyTitle}>EMERGENCY SOS</Text>
              <Text style={styles.emergencySubtitle}>Notify contacts & find hospital</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Widget Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Widgets</Text>

            {AVAILABLE_WIDGETS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => handleAddWidget(item)}
              >
                <Text style={styles.modalItemText}>{item.label}</Text>
                <Text style={styles.plusIcon}>+</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Data Update Modal */}
      <UpdateDataModal
        visible={!!selectedWidget}
        widgetConfig={selectedWidget}
        onClose={() => setSelectedWidget(null)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#FFF', fontWeight: '600' },

  // Report Section Styles
  reportSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2,
  },
  reportContent: { flexDirection: 'row', alignItems: 'center' },
  reportIconBadge: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  reportTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  reportSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  arrowIcon: { fontSize: 24, color: '#CCC', fontWeight: '300' },

  // Widget Styles
  widgetContainer: { padding: 20, paddingTop: 0, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', width: '100%' },
  widgetCard: {
    width: '48%', aspectRatio: 1, borderRadius: 16, padding: 15, marginBottom: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3,
  },

  // Emergency Section Styles
  emergencyContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  emergencyButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 4,
  },
  emergencyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  emergencyIcon: { fontSize: 24 },
  emergencyTextContainer: { flex: 1 },
  emergencyTitle: { fontSize: 18, fontWeight: '900', color: '#C62828', letterSpacing: 0.5 },
  emergencySubtitle: { fontSize: 13, color: '#D32F2F', fontWeight: '500', marginTop: 2 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 300 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalItemText: { fontSize: 18 },
  plusIcon: { fontSize: 18, color: '#007AFF', fontWeight: 'bold' },
  closeButton: { marginTop: 20, alignItems: 'center', padding: 15 },
  closeButtonText: { color: 'red', fontSize: 16 },
});