import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

const GOAL = 2000; // Daily Goal in ml

const WaterWidget = () => {
  const [water, setWater] = useState(0);
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
        // medicalInfo -> water
        setWater(parseInt(data?.medicalInfo?.water) || 0);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching water:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.widgetInner}>
        <ActivityIndicator size="small" color="#0288D1" />
      </View>
    );
  }

  // Calculate percentage for width
  const percentage = Math.min((water / GOAL) * 100, 100);

  return (
    <View style={styles.widgetInner}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.widgetTitle}>WATER</Text>
        <View style={styles.iconBadge}>
           <Text style={styles.iconText}>💧</Text>
        </View>
      </View>

      {/* Data */}
      <View style={styles.dataContainer}>
        <View style={styles.valueRow}>
          <Text style={styles.widgetValue}>{water}</Text>
          <Text style={styles.unitLabel}>ml</Text>
        </View>

        {/* Progress Bar Background */}
        <View style={styles.progressBarBg}>
            {/* Progress Bar Fill */}
            <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>

        <View style={styles.trendContainer}>
          <Text style={styles.trendText}>Goal: {GOAL}ml</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  widgetInner: { flex: 1, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  widgetTitle: { fontSize: 12, fontWeight: '700', color: '#01579B', letterSpacing: 1, textTransform: 'uppercase' },
  iconBadge: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: 4 },
  iconText: { fontSize: 12 },
  dataContainer: { flex: 1, justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  widgetValue: { fontSize: 32, fontWeight: '800', color: '#2D3436', lineHeight: 36 },
  unitLabel: { fontSize: 16, fontWeight: '600', color: '#0288D1', marginBottom: 6, marginLeft: 4 },

  // Progress Bar Styles
  progressBarBg: { height: 6, backgroundColor: '#E1F5FE', borderRadius: 3, width: '100%', marginBottom: 6 },
  progressBarFill: { height: '100%', backgroundColor: '#29B6F6', borderRadius: 3 },

  trendContainer: { alignSelf: 'flex-start' },
  trendText: { fontSize: 10, color: '#0277BD', fontWeight: '600' },

  loadingText: { marginTop: 8, fontSize: 12, color: '#999' },
});

export default WaterWidget;