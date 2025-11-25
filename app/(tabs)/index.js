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

// Import the registry
// (Assuming index.js is in 'app' folder and widgets is in 'app/widgets')
import { AVAILABLE_WIDGETS } from '../widgets/widgetRegistry.js';
import UpdateDataModal from '../widgets/UpdateDataModal.js';

export default function App() {
  const [activeWidgets, setActiveWidgets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // State to track which widget is being edited
  const [selectedWidget, setSelectedWidget] = useState(null);

  // Add a widget based on the registry config
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

      {/* Dashboard Grid */}
      <ScrollView contentContainerStyle={styles.widgetContainer}>
        {activeWidgets.length === 0 ? (
          <Text style={styles.emptyText}>Tap "+ Add" to choose a widget</Text>
        ) : (
          activeWidgets.map((widget) => (
            <Pressable
              key={widget.id}
              style={[styles.widgetCard, { backgroundColor: widget.color }]}
              onLongPress={() => confirmDelete(widget.id)}
              delayLongPress={500}
              // --- THIS WAS MISSING ---
              // This triggers the modal to open with the correct widget data
              onPress={() => setSelectedWidget(widget)}
            >
              {/* Dynamic Component Rendering */}
              <widget.component />
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Widget Selection Modal (Add New) */}
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

      {/* Data Entry Modal (Edit Existing) */}
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
  widgetContainer: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', width: '100%' },
  widgetCard: {
    width: '48%', aspectRatio: 1, borderRadius: 16, padding: 15, marginBottom: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 300 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalItemText: { fontSize: 18 },
  plusIcon: { fontSize: 18, color: '#007AFF', fontWeight: 'bold' },
  closeButton: { marginTop: 20, alignItems: 'center', padding: 15 },
  closeButtonText: { color: 'red', fontSize: 16 },
});