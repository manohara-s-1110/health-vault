import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
// Ensure this path matches your other widgets (e.g. WeightWidget)
import { db, auth } from '../../firebaseConfig';

const BMIWidget = () => {
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    // Listen for real-time updates to Weight OR Height
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // 1. Try to get Weight and Height
        const w = parseFloat(data?.medicalInfo?.weight);
        const h = parseFloat(data?.medicalInfo?.height);

        // 2. Logic: If BMI is missing in DB, calculate it automatically
        if (w && h) {
          const heightInMeters = h / 100;
          const calculatedBMI = (w / (heightInMeters * heightInMeters)).toFixed(1);

          setBmi(calculatedBMI);
          setStatus(getBMIStatus(calculatedBMI));
        } else {
          // 3. If we lack Weight or Height, we can't calculate
          setBmi(null);
          setStatus('N/A');
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Error calculating BMI:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper: Determine Health Category
  const getBMIStatus = (value) => {
    const num = parseFloat(value);
    if (num < 18.5) return 'Underweight';
    if (num < 25) return 'Healthy';
    if (num < 30) return 'Overweight';
    return 'Obese';
  };

  // Helper: Dynamic Color for status
  const getStatusColor = () => {
    if (status === 'Healthy') return '#2E7D32'; // Green
    if (status === 'Underweight') return '#0277BD'; // Blue
    return '#E65100'; // Orange/Red for Overweight
  };

  if (loading) {
    return (
      <View style={styles.widgetInner}>
        <ActivityIndicator size="small" color="#9C27B0" />
      </View>
    );
  }

  return (
    <View style={styles.widgetInner}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>BMI SCORE</Text>
        <View style={styles.iconBadge}>
           <Text style={styles.iconText}>📊</Text>
        </View>
      </View>

      {/* Data Display */}
      {bmi ? (
        <View style={styles.dataContainer}>
          <View style={styles.valueRow}>
            <Text style={styles.widgetValue}>{bmi}</Text>
          </View>
          <View style={[styles.trendContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.trendText, { color: getStatusColor() }]}>
              {status}
            </Text>
          </View>
        </View>
      ) : (
        // Empty State (If Weight/Height are missing)
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>--</Text>
          <Text style={styles.addText}>Need W & H</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  widgetInner: { flex: 1, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  widgetTitle: { fontSize: 12, fontWeight: '700', color: '#7B1FA2', letterSpacing: 1, textTransform: 'uppercase' },
  iconBadge: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: 4 },
  iconText: { fontSize: 12 },
  dataContainer: { flex: 1, justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  widgetValue: { fontSize: 32, fontWeight: '800', color: '#2D3436', lineHeight: 36 },
  trendContainer: { marginTop: 4, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendText: { fontSize: 10, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center' },
  emptyText: { fontSize: 32, fontWeight: 'bold', color: '#DDD' },
  addText: { fontSize: 10, color: '#9C27B0', fontWeight: '600' }
});

export default BMIWidget;