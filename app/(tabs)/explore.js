// app/(tabs)/explore.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, Text, StyleSheet, StatusBar, 
  ActivityIndicator, TouchableOpacity, Linking, Platform, FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

export default function ExploreScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [BottomSheetComp, setBottomSheetComp] = useState(null);
  const [BottomSheetFlatListComp, setBottomSheetFlatListComp] = useState(null);
  const [bottomSheetAvailable, setBottomSheetAvailable] = useState(false);

  const mapRef = useRef(null);

  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Try to lazy-load bottom-sheet after mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('@gorhom/bottom-sheet').catch(() => null);
        if (mod && mounted) {
          setBottomSheetComp(() => mod.default || mod.BottomSheet || mod);
          setBottomSheetFlatListComp(() => mod.BottomSheetFlatList || mod.FlatList || mod);
          setBottomSheetAvailable(true);
        } else {
          console.warn('Bottom sheet module not available — falling back to simple list.');
          setBottomSheetAvailable(false);
        }
      } catch (err) {
        console.warn('Failed to import bottom-sheet dynamically:', err);
        setBottomSheetAvailable(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

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

  // 2. Fetch Nearby Places once we have the location
  useEffect(() => {
    if (location) fetchNearbyPlaces(location);
  }, [location]);

  const fetchNearbyPlaces = async (coords) => {
    const { latitude, longitude } = coords;
    const radius = 5000;
    const hospitalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${GOOGLE_MAPS_API_KEY}`;
    const pharmacyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=pharmacy&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const [hospitalResponse, pharmacyResponse] = await Promise.all([fetch(hospitalUrl), fetch(pharmacyUrl)]);
      const hospitalData = await hospitalResponse.json();
      const pharmacyData = await pharmacyResponse.json();
      const combinedResults = [...(hospitalData.results || []), ...(pharmacyData.results || [])];
      const uniquePlaces = Array.from(new Map(combinedResults.map(p => [p.place_id, p])).values());
      setPlaces(uniquePlaces);
    } catch (error) {
      console.error("Error fetching places:", error);
      setErrorMsg("Failed to load nearby places.");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (lat, lng) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = `${scheme}${lat},${lng}`;
    Linking.openURL(url).catch(() => {});
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
        <Ionicons name={item.types?.includes('hospital') ? "medkit" : "medical"} size={24} color="#4A90E2" />
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

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Text style={styles.title}>{errorMsg}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude || 0,
              longitude: location?.longitude || 0,
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
                pinColor={place.types?.includes('hospital') ? 'red' : 'blue'}
              />
            ))}
          </MapView>

          {/* If bottom-sheet available, render it; otherwise fallback to a simple list */}
          {bottomSheetAvailable && BottomSheetComp ? (
            <BottomSheetComp index={1} snapPoints={snapPoints}>
              {/* dynamic import of BottomSheetFlatList is tricky; render a simple array map as fallback inside */}
              <View style={styles.listContainer}>
                <Text style={styles.listHeader}>Nearby Hospitals & Pharmacies</Text>
                <FlatList data={places} renderItem={renderPlaceItem} keyExtractor={i => i.place_id} />
              </View>
            </BottomSheetComp>
          ) : (
            // fallback: show a white panel anchored at bottom with list
            <View style={styles.fallbackList}>
              <Text style={styles.listHeader}>Nearby Hospitals & Pharmacies</Text>
              <FlatList data={places} renderItem={renderPlaceItem} keyExtractor={i => i.place_id} />
            </View>
          )}
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
  fallbackList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '45%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 12,
  },
});
