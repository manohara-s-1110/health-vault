// app/(tabs)/index.js
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  // State for widget values
  const [heartRate, setHeartRate] = useState('97');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [weight, setWeight] = useState('102');

  // State for modal visibility and content
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null); // e.g., 'heartRate', 'bloodGroup', 'weight'
  const [inputValue, setInputValue] = useState('');

  // Function to open the modal with the correct context
  const openEditModal = (widget, currentValue) => {
    setEditingWidget(widget);
    setInputValue(currentValue);
    setModalVisible(true);
  };

  // Function to save the edited value and close the modal
  const handleSaveChanges = () => {
    if (editingWidget === 'heartRate') {
      setHeartRate(inputValue);
    } else if (editingWidget === 'bloodGroup') {
      setBloodGroup(inputValue);
    } else if (editingWidget === 'weight') {
      setWeight(inputValue);
    }
    setModalVisible(false);
    setEditingWidget(null);
  };

  const getModalInfo = () => {
    switch (editingWidget) {
      case 'heartRate':
        return { title: 'Heart Rate', keyboard: 'numeric' };
      case 'bloodGroup':
        return { title: 'Blood Group', keyboard: 'default' };
      case 'weight':
        return { title: 'Weight', keyboard: 'numeric' };
      default:
        return { title: '', keyboard: 'default' };
    }
  };

  const modalInfo = getModalInfo();


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Heart Rate Widget */}
        <TouchableOpacity style={[styles.widget, styles.largeWidget]} onPress={() => openEditModal('heartRate', heartRate)}>
          <View>
            <Text style={styles.widgetTitle}>Heart rate</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.largeValue}>{heartRate}</Text>
              <Text style={styles.unit}>bpm</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chart-line-variant" size={60} color="#1E232C" />
        </TouchableOpacity>

        {/* Row for smaller widgets */}
        <View style={styles.widgetRow}>
          {/* Blood Group Widget */}
          <TouchableOpacity style={[styles.widget, styles.smallWidget, styles.bloodWidget]} onPress={() => openEditModal('bloodGroup', bloodGroup)}>
            <Ionicons name="water" size={30} color="#C94A6F" />
            <Text style={styles.widgetTitle}>Blood Group</Text>
            <Text style={styles.smallValue}>{bloodGroup}</Text>
          </TouchableOpacity>

          {/* Weight Widget */}
          <TouchableOpacity style={[styles.widget, styles.smallWidget, styles.weightWidget]} onPress={() => openEditModal('weight', weight)}>
            <MaterialCommunityIcons name="weight-lifter" size={30} color="#D4A05D" />
            <Text style={styles.widgetTitle}>Weight</Text>
            <Text style={styles.smallValue}>{weight}lbs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Value Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit {modalInfo.title}</Text>
            <TextInput
              style={styles.input}
              onChangeText={setInputValue}
              value={inputValue}
              keyboardType={modalInfo.keyboard}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#8391A1" />
              <Button title="Save" onPress={handleSaveChanges} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  widget: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  largeWidget: {
    backgroundColor: '#E6EAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallWidget: {
    width: '48%',
    height: 180,
    justifyContent: 'space-between',
  },
  bloodWidget: {
    backgroundColor: '#F8E7EE',
  },
  weightWidget: {
    backgroundColor: '#FCF3E4',
  },
  widgetTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  largeValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1E232C',
  },
  unit: {
    fontSize: 18,
    color: '#1E232C',
    marginLeft: 5,
    fontWeight: '600',
  },
  smallValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E232C',
    marginTop: 'auto',
  },

  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#E8ECF4',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});