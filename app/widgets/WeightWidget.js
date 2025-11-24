import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// --- NEW IMPORTS (JS SDK) ---
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig'; // Import from the file you created in Step 2

const WeightWidget = () => {
  const [weight, setWeight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      // User not logged in
      setLoading(false);
      return;
    }

    // --- NEW LOGIC (JS SDK) ---
    // Reference to: users -> [uid]
    const userDocRef = doc(db, 'users', user.uid);

    // Listen for real-time updates
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Access medicalInfo -> weight
        const fetchedWeight = data?.medicalInfo?.weight;
        setWeight(fetchedWeight || null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching weight:", error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.widgetInner}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.widgetInner}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>WEIGHT</Text>
        <View style={styles.iconBadge}>
           <Text style={styles.iconText}>⚖️</Text>
        </View>
      </View>

      {/* Data */}
      {weight ? (
        <View style={styles.dataContainer}>
          <View style={styles.valueRow}>
            <Text style={styles.widgetValue}>{weight}</Text>
            <Text style={styles.unitLabel}>kg</Text>
          </View>
          <View style={styles.trendContainer}>
            <Text style={styles.trendText}>Latest Entry</Text>
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
  widgetTitle: { fontSize: 12, fontWeight: '700', color: '#627C85', letterSpacing: 1, textTransform: 'uppercase' },
  iconBadge: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: 4 },
  iconText: { fontSize: 12 },
  dataContainer: { flex: 1, justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  widgetValue: { fontSize: 32, fontWeight: '800', color: '#2D3436', lineHeight: 36 },
  unitLabel: { fontSize: 16, fontWeight: '600', color: '#627C85', marginBottom: 6, marginLeft: 4 },
  trendContainer: { marginTop: 4, backgroundColor: '#E0F7FA', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendText: { fontSize: 10, color: '#006064', fontWeight: '600' },
  loadingText: { marginTop: 8, fontSize: 12, color: '#999' },
  emptyState: { flex: 1, justifyContent: 'center' },
  emptyText: { fontSize: 32, fontWeight: 'bold', color: '#DDD' },
  addText: { fontSize: 12, color: '#007AFF' }
});

export default WeightWidget;