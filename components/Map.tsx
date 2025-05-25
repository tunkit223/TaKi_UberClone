import { icons } from "@/constant";
import { useFetch } from "@/lib/fetch";
import { calculateDriverTimes, calculateRegion, generateMarkersFromData } from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store"
import { Driver, MarkerData } from "@/type/type";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native"
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from 'react-native-maps'
import polyline from '@mapbox/polyline';

export const Map = () => {
  const { data: drivers, loading, error } = useFetch<Driver>('/(api)/driver')
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver, setDrivers } = useDriverStore();
  const [markers, setmarkers] = useState<MarkerData[]>([])
  const [routeCoords, setRouteCoords] = useState<{ latitude: number, longitude: number }[]>([]);

  const region = calculateRegion({
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });
      setmarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({
        markers,
        userLongitude,
        userLatitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[])
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    if (userLatitude && userLongitude && destinationLatitude && destinationLongitude) {
      const fetchGoongRoute = async () => {
        try {
          const res = await fetch(
            `https://rsapi.goong.io/Direction?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&vehicle=car&api_key=${process.env.EXPO_PUBLIC_GOONGMAP_API_KEY}`
          );
          const data = await res.json();
          const decoded = polyline.decode(data.routes[0].overview_polyline.points);
          const coords = decoded.map(([lat, lng]: [number, number]) => ({ latitude: lat, longitude: lng }));
          setRouteCoords(coords);
        } catch (err) {
          console.error('Goong API error:', err);
        }
      }
      fetchGoongRoute();
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  if (loading || !userLatitude || !userLongitude) {
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ width: '100%', height: '100%', borderRadius: 16 }}
      tintColor="black"
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          title={marker.title}
          image={selectedDriver === +marker.id ? icons.selectedMarker : icons.marker}
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{ latitude: destinationLatitude, longitude: destinationLongitude }}
            title="Destination"
            image={icons.pin}
          />
          <Polyline
            coordinates={routeCoords}
            strokeColor="#0286FF"
            strokeWidth={3}
          />
        </>
      )}
    </MapView>
  );
};
