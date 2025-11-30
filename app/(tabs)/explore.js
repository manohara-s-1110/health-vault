import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, StatusBar, 
  ActivityIndicator, TouchableOpacity, Linking, Platform, FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

// --- SAFE FALLBACK: If API Key is missing, use empty string to prevent crash ---
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || "";

export default function ExploreScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);

  // 1. Get User's Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (e) {
        setErrorMsg('Unable to fetch location.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Fetch Nearby Places
  useEffect(() => {
    if (location) fetchNearbyPlaces(location);
  }, [location]);

  const fetchNearbyPlaces = async (coords) => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API Key is missing.");
      setLoading(false);
      return;
    }

    const { latitude, longitude } = coords;
    const radius = 5000;
    const hospitalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
      const response = await fetch(hospitalUrl);
      const data = await response.json();
      
      if (data.results) {
        setPlaces(data.results);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (lat, lng) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = `${scheme}${lat},${lng}`;
    Linking.openURL(url).catch(() => alert("Cannot open maps"));
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => {
        mapRef.current?.animateToRegion({
          latitude: item.geometry.location.lat,
          longitude: item.geometry.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }}
    >
      <View style={styles.itemIcon}>
        <Ionicons name="medkit" size={24} color="#FF5252" />
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemVicinity}>{item.vicinity}</Text>
      </View>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => openInMaps(item.geometry.location.lat, item.geometry.location.lng)}
      >
        <Ionicons name="navigate" size={20} color="#FFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loaderText}>Locating you...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: location?.latitude || 37.78825,
            longitude: location?.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
        >
          {places.map((place, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              pinColor="red"
            />
          ))}
        </MapView>
      </View>

      {/* --- Simple Bottom List (No extra libraries needed) --- */}
      <View style={styles.bottomListContainer}>
        <Text style={styles.listHeader}>Nearby Hospitals</Text>
        {places.length === 0 ? (
          <Text style={styles.noPlacesText}>No hospitals found nearby.</Text>
        ) : (
          <FlatList 
            data={places} 
            renderItem={renderPlaceItem} 
            keyExtractor={(item, index) => index.toString()} 
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  mapContainer: { flex: 1 }, // Map takes top half
  
  // Bottom Panel Styles
  bottomListContainer: { 
    height: '40%', // Takes bottom 40% of screen
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  listHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  
  // Item Styles
  itemContainer: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0'
  },
  itemIcon: { marginRight: 15, width: 30, alignItems: 'center' },
  itemTextContainer: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemVicinity: { fontSize: 12, color: '#888', marginTop: 2 },
  navButton: { 
    backgroundColor: '#007AFF', padding: 8, borderRadius: 8, 
    justifyContent: 'center', alignItems: 'center' 
  },
  
  // Loading/Error Styles
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loaderText: { marginTop: 10, color: '#666' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', padding: 20 },
  noPlacesText: { textAlign: 'center', marginTop: 20, color: '#999' },
});