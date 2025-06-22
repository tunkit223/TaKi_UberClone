import { icons } from "@/constant";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";

interface MapDriverProps {
  rideId: number;
}

export const MapDriver = ({ rideId }: MapDriverProps) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [origin, setOrigin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pickupRoute, setPickupRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [dropoffRoute, setDropoffRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Ứng dụng cần quyền truy cập vị trí");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const fetchRide = async () => {
    try {
      const res = await fetch(`/(api)/ride/${rideId}`);
      const data = await res.json();
      if (res.ok) {
        setOrigin({
          latitude: parseFloat(data.origin_latitude),
          longitude: parseFloat(data.origin_longitude),
        });
        setDestination({
          latitude: parseFloat(data.destination_latitude),
          longitude: parseFloat(data.destination_longitude),
        });
      }
    } catch (err) {
      console.error("Lỗi khi fetch ride:", err);
    }
  };

  const fetchRoutes = async () => {
    if (!userLocation || !origin || !destination) return;

    try {
      // Route từ tài xế → điểm đón (xanh lá)
      const pickupRes = await fetch(
        `https://rsapi.goong.io/Direction?origin=${userLocation.latitude},${userLocation.longitude}&destination=${origin.latitude},${origin.longitude}&vehicle=car&api_key=${process.env.EXPO_PUBLIC_GOONGMAP_API_KEY}`
      );
      const pickupData = await pickupRes.json();
      const pickupDecoded = polyline.decode(pickupData.routes[0].overview_polyline.points);
      const pickupCoords = pickupDecoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
      setPickupRoute(pickupCoords);

      // Route từ điểm đón → điểm đến (xanh dương)
      const dropoffRes = await fetch(
        `https://rsapi.goong.io/Direction?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&vehicle=car&api_key=${process.env.EXPO_PUBLIC_GOONGMAP_API_KEY}`
      );
      const dropoffData = await dropoffRes.json();
      const dropoffDecoded = polyline.decode(dropoffData.routes[0].overview_polyline.points);
      const dropoffCoords = dropoffDecoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
      setDropoffRoute(dropoffCoords);
    } catch (err) {
      console.error("Goong API error:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCurrentLocation();
      await fetchRide();
    })().finally(() => setLoading(false));
  }, [rideId]);

  useEffect(() => {
    fetchRoutes();
  }, [userLocation, origin, destination]);

  if (loading || !userLocation || !origin || !destination) {
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const region = {
    latitude: (userLocation.latitude + destination.latitude) / 2,
    longitude: (userLocation.longitude + destination.longitude) / 2,
    latitudeDelta: Math.abs(userLocation.latitude - destination.latitude) + 0.02,
    longitudeDelta: Math.abs(userLocation.longitude - destination.longitude) + 0.02,
  };

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ width: "100%", height: "100%", borderRadius: 16 }}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      <Marker coordinate={origin} title="Điểm đón" image={icons.pin} />
      <Marker coordinate={destination} title="Điểm đến" image={icons.pin} />
      <Polyline coordinates={pickupRoute} strokeColor="green" strokeWidth={4} />
      <Polyline coordinates={dropoffRoute} strokeColor="#0286FF" strokeWidth={4} />
    </MapView>
  );
};
