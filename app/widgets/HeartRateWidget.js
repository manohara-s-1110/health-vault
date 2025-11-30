import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

const HeartRateWidget = () => {
  const [bpm, setBpm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // medicalInfo -> heartRate
        setBpm(data?.medicalInfo?.heartRate || null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching heart rate:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.widgetInner}>
        <ActivityIndicator size="small" color="#E91E63" />
      </View>
    );
  }

  return (
    <View style={styles.widgetInner}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>HEART RATE</Text>
        <View style={styles.iconBadge}>
           <Text style={styles.iconText}>❤️</Text>
        </View>
      </View>

      {/* Data */}
      {bpm ? (
        <View style={styles.dataContainer}>
          <View style={styles.valueRow}>
            <Text style={styles.widgetValue}>{bpm}</Text>
            <Text style={styles.unitLabel}>bpm</Text>
          </View>
          <View style={styles.trendContainer}>
            <Text style={styles.trendText}>Resting</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>--</Text>
          <Text style={styles.addText}>Tap to add</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  widgetInner: { flex: 1, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  widgetTitle: { fontSize: 12, fontWeight: '700', color: '#AD1457', letterSpacing: 1, textTransform: 'uppercase' },
  iconBadge: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: 4 },
  iconText: { fontSize: 12 },
  dataContainer: { flex: 1, justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  widgetValue: { fontSize: 32, fontWeight: '800', color: '#2D3436', lineHeight: 36 },
  unitLabel: { fontSize: 16, fontWeight: '600', color: '#AD1457', marginBottom: 6, marginLeft: 4 },
  trendContainer: { marginTop: 4, backgroundColor: '#FCE4EC', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendText: { fontSize: 10, color: '#C2185B', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center' },
  emptyText: { fontSize: 32, fontWeight: 'bold', color: '#DDD' },
  addText: { fontSize: 12, color: '#E91E63' }
});

export default HeartRateWidget;