import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

export default function App() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({

    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [insideGeofence, setInsideGeofence] = useState(null); 
  const geofence= {
    latitude: 37.78825,
    longitude: -122.4324,
    radius: 100, 
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setRegion({
        ...region,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    };
    requestLocationPermission();
  }, );
  
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  const checkGeofence = (currentLocation) => {
    const distance= getDistance(
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: geofence.latitude, longitude: geofence.longitude }
    );
    const isInside = distance < geofence.radius;
    if (isInside !== insideGeofence) {
      setInsideGeofence(isInside);
      
      Alert.alert(isInside ? 'You entered the geofence area': 'You exited the geofence area');
    }
  };


  const handleRegionChange= debounce((newRegion) => {
    setRegion(newRegion);
    checkGeofence(newRegion); 
  }, 500); 
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
        )}
      </MapView>
      <Text style={styles.info}>
        Latitude: {region.latitude.toFixed(5)}, Longitude: {region.longitude.toFixed(5)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '90%',
  },
  info: {
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});
