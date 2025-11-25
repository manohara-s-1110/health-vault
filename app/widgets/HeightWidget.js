import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
// Ensure this path matches your other widgets!
import { db, auth } from '../../firebaseConfig';

const HeightWidget = () => {
  const [height, setHeight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    // Listen to medicalInfo -> height
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedHeight = data?.medicalInfo?.height;
        setHeight(fetchedHeight || null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching height:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.widgetInner}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.widgetInner}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>HEIGHT</Text>
        <View style={styles.iconBadge}>
           <Text style={styles.iconText}>📏</Text>
        </View>
      </View>

      {/* Data */}
      {height ? (
        <View style={styles.dataContainer}>
          <View style={styles.valueRow}>
            <Text style={styles.widgetValue}>{height}</Text>
            <Text style={styles.unitLabel}>cm</Text>
          </View>
          <View style={styles.trendContainer}>
            <Text style={styles.trendText}>Measured</Text>
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
  widgetTitle: { fontSize: 12, fontWeight: '700', color: '#2E7D32', letterSpacing: 1, textTransform: 'uppercase' },
  iconBadge: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: 4 },
  iconText: { fontSize: 12 },
  dataContainer: { flex: 1, justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  widgetValue: { fontSize: 32, fontWeight: '800', color: '#2D3436', lineHeight: 36 },
  unitLabel: { fontSize: 16, fontWeight: '600', color: '#2E7D32', marginBottom: 6, marginLeft: 4 },
  trendContainer: { marginTop: 4, backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendText: { fontSize: 10, color: '#1B5E20', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center' },
  emptyText: { fontSize: 32, fontWeight: 'bold', color: '#DDD' },
  addText: { fontSize: 12, color: '#4CAF50' }
});

export default HeightWidget;