// app/(tabs)/explore.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, Text, StyleSheet, StatusBar, 
  ActivityIndicator, TouchableOpacity, Linking, Platform 
} from 'react-native';
// Import SafeAreaView from the correct library
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
// Import this wrapper, it's required for the bottom sheet
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Get the Google Maps API key from our app.config.js
const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.GOOGLE_MAPS_API_KEY;

export default function ExploreScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  // Define the "snap points" for the bottom sheet
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // 1. Get User's Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  // 2. Fetch Nearby Places once we have the location
  useEffect(() => {
    if (location) {
      fetchNearbyPlaces(location);
    }
  }, [location]);

  // 3. Google Places API Fetch
  const fetchNearbyPlaces = async (coords) => {
    const { latitude, longitude } = coords;
    const radius = 5000; // 5km radius
    
    const hospitalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${GOOGLE_MAPS_API_KEY}`;
    const pharmacyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=pharmacy&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
      const [hospitalResponse, pharmacyResponse] = await Promise.all([
        fetch(hospitalUrl),
        fetch(pharmacyUrl)
      ]);
      
      const hospitalData = await hospitalResponse.json();
      const pharmacyData = await pharmacyResponse.json();

      const combinedResults = [...(hospitalData.results || []), ...(pharmacyData.results || [])];
      
      const uniquePlaces = Array.from(new Map(combinedResults.map(p => [p.place_id, p])).values());
      
      setPlaces(uniquePlaces);
    } catch (error) {
      console.error("Error fetching places:", error);
      setErrorMsg("Failed to load nearby places.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Helper function to open a place in Google Maps
  const openInMaps = (lat, lng) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = `${scheme}${lat},${lng}`;
    Linking.openURL(url);
  };

  // 5. Render list items in the Bottom Sheet
  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => {
        mapRef.current?.animateToRegion({
          latitude: item.geometry.location.lat,
          longitude: item.geometry.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        bottomSheetRef.current?.snapToIndex(1); 
      }}
    >
      <View style={styles.itemIcon}>
        <Ionicons name={item.types.includes('hospital') ? "medkit" : "medical"} size={24} color="#4A90E2" />
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemVicinity}>{item.vicinity}</Text>
      </View>
      <TouchableOpacity onPress={() => openInMaps(item.geometry.location.lat, item.geometry.location.lng)}>
        <Ionicons name="navigate-circle-outline" size={30} color="#4A90E2" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Show loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loaderText}>Finding nearby places...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error message
  if (errorMsg) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Text style={styles.title}>{errorMsg}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show the map and list
  return (
    // Wrap the *entire* screen in GestureHandlerRootView
    <GestureHandlerRootView style={{ flex: 1 }}> 
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
          >
            {places.map(place => (
              <Marker
                key={place.place_id}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }}
                title={place.name}
                pinColor={place.types.includes('hospital') ? 'red' : 'blue'}
              />
            ))}
          </MapView>
          
          <BottomSheet
            ref={bottomSheetRef}
            index={1} 
            snapPoints={snapPoints}
          >
            <BottomSheetFlatList
              data={places}
              renderItem={renderPlaceItem}
              keyExtractor={(item) => item.place_id}
              contentContainerStyle={styles.listContainer}
              ListHeaderComponent={<Text style={styles.listHeader}>Nearby Hospitals & Pharmacies</Text>}
            />
          </BottomSheet>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loaderText: { marginTop: 10, fontSize: 16, color: '#8391A1' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E232C', textAlign: 'center' },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  listHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E232C',
    marginBottom: 16,
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  itemIcon: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E232C',
  },
  itemVicinity: {
    fontSize: 14,
    color: '#8391A1',
    marginTop: 4,
  },
});