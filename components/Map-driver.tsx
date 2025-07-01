import { icons } from "@/constant";
import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";
import { useLocationStore } from "@/store";

interface MapDriverProps {
  rideId: number;
}

export const MapDriver = ({ rideId }: MapDriverProps) => {
  const [origin, setOrigin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pickupRoute, setPickupRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [dropoffRoute, setDropoffRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const { userLatitude, userLongitude } = useLocationStore();
  const prevUserLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const userLocation =
    userLatitude && userLongitude
      ? { latitude: userLatitude, longitude: userLongitude }
      : null;

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
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    if (!userLocation || !origin || !destination) return;

    try {
      // Vẽ đường từ tài xế → điểm đón
      const pickupRes = await fetch(
        `https://rsapi.goong.io/Direction?origin=${userLocation.latitude},${userLocation.longitude}&destination=${origin.latitude},${origin.longitude}&vehicle=car&api_key=${process.env.EXPO_PUBLIC_GOONGMAP_API_KEY}`
      );
      const pickupData = await pickupRes.json();
      const pickupDecoded = polyline.decode(pickupData.routes[0].overview_polyline.points);
      setPickupRoute(pickupDecoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng })));

      // Vẽ đường từ điểm đón → điểm đến
      const dropoffRes = await fetch(
        `https://rsapi.goong.io/Direction?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&vehicle=car&api_key=${process.env.EXPO_PUBLIC_GOONGMAP_API_KEY}`
      );
      const dropoffData = await dropoffRes.json();
      const dropoffDecoded = polyline.decode(dropoffData.routes[0].overview_polyline.points);
      setDropoffRoute(dropoffDecoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng })));
    } catch (err) {
      console.error("Goong API error:", err);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [rideId]);

  // Tự động vẽ lại route khi userLocation thay đổi (vị trí tài xế thay đổi)
  useEffect(() => {
    if (!userLocation || !origin || !destination) return;

    const prev = prevUserLocationRef.current;
    const hasChanged =
      !prev ||
      Math.abs(prev.latitude - userLocation.latitude) > 0.0001 ||
      Math.abs(prev.longitude - userLocation.longitude) > 0.0001;

    if (hasChanged) {
      prevUserLocationRef.current = userLocation;
      fetchRoutes();
    }
  }, [userLatitude, userLongitude, origin, destination]);

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
