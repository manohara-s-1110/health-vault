import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig'; // Ensure this path matches your project structure

const BloodGroupWidget = () => {
  const [bloodGroup, setBloodGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    // Reference to: users -> [uid]
    const userDocRef = doc(db, 'users', user.uid);

    // Listen for real-time updates
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Access medicalInfo -> bloodGroup
        const fetchedGroup = data?.medicalInfo?.bloodGroup;
        setBloodGroup(fetchedGroup || null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching blood group:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.widgetInner}>
        <ActivityIndicator size="small" color="#FF5252" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.widgetInner}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>BLOOD TYPE</Text>
        <View style={styles.iconBadge}>
           <Text style={styles.iconText}>🩸</Text>
        </View>
      </View>

      {/* Data */}
      {bloodGroup ? (
        <View style={styles.dataContainer}>
          <View style={styles.valueRow}>
            <Text style={styles.widgetValue}>{bloodGroup}</Text>
          </View>
          <View style={styles.trendContainer}>
            <Text style={styles.trendText}>Medical Profile</Text>
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
  widgetTitle: { fontSize: 12, fontWeight: '700', color: '#9E4747', letterSpacing: 1, textTransform: 'uppercase' },
  iconBadge: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: 4 },
  iconText: { fontSize: 12 },
  dataContainer: { flex: 1, justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  widgetValue: { fontSize: 32, fontWeight: '800', color: '#2D3436', lineHeight: 36 },
  trendContainer: { marginTop: 4, backgroundColor: '#FFEBEE', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendText: { fontSize: 10, color: '#C62828', fontWeight: '600' },
  loadingText: { marginTop: 8, fontSize: 12, color: '#999' },
  emptyState: { flex: 1, justifyContent: 'center' },
  emptyText: { fontSize: 32, fontWeight: 'bold', color: '#DDD' },
  addText: { fontSize: 12, color: '#FF5252' }
});

export default BloodGroupWidget;