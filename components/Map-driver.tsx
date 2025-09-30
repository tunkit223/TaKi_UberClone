import { icons } from "@/constant";
import { useEffect, useRef, useState } from "react";
import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
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
  const [remainingPickup, setRemainingPickup] = useState<{ latitude: number; longitude: number }[]>([]);
  const [remainingDropoff, setRemainingDropoff] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const { userLatitude, userLongitude, setUserLocation } = useLocationStore();
  const prevUserLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIndexRef = useRef(0);
  const simulationRouteRef = useRef<{ latitude: number; longitude: number }[]>([]);
  const simulationPhaseRef = useRef<"pickup" | "dropoff">("pickup");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userLocation =
    userLatitude && userLongitude
      ? { latitude: userLatitude, longitude: userLongitude }
      : null;

  const startSimulation = () => {
    if (!pickupRoute.length || !dropoffRoute.length) return;

    simulationRouteRef.current = [...pickupRoute];
    simulationPhaseRef.current = "pickup";
    simulationIndexRef.current = 0;
    setIsSimulating(true);
    setRemainingPickup([...pickupRoute]);
    setRemainingDropoff([...dropoffRoute]);

    intervalRef.current = setInterval(() => {
      const route = simulationRouteRef.current;
      const index = simulationIndexRef.current;

      if (index >= route.length) {
        if (simulationPhaseRef.current === "pickup") {
          simulationRouteRef.current = [...dropoffRoute];
          simulationPhaseRef.current = "dropoff";
          simulationIndexRef.current = 0;
          return;
        } else {
          stopSimulation();
          return;
        }
      }

      const nextCoord = route[index];
      setUserLocation({ latitude: nextCoord.latitude, longitude: nextCoord.longitude, address: "" });

      if (simulationPhaseRef.current === "pickup") {
        setRemainingPickup(route.slice(index + 1));
      } else {
        setRemainingDropoff(route.slice(index + 1));
      }

      simulationIndexRef.current += 1;
    }, 1000);
  };

  const stopSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsSimulating(false);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    if (!userLocation || !origin || !destination) return;

    try {
      // Route từ tài xế → điểm đón
      const pickupRes = await fetch(
        `https://rsapi.goong.io/Direction?origin=${userLocation.latitude},${userLocation.longitude}&destination=${origin.latitude},${origin.longitude}&vehicle=car&api_key=${process.env.EXPO_PUBLIC_GOONGMAP_API_KEY}`
      );
      const pickupData = await pickupRes.json();
      const pickupDecoded = polyline.decode(pickupData.routes[0].overview_polyline.points);
      const fullPickup = pickupDecoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
      setPickupRoute(fullPickup);
      setRemainingPickup(fullPickup);

      // Route từ điểm đón → điểm đến
      const dropoffRes = await fetch(
        `https://rsapi.goong.io/Direction?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&vehicle=car&api_key=${process.env.EXPO_PUBLIC_GOONGMAP_API_KEY}`
      );
      const dropoffData = await dropoffRes.json();
      const dropoffDecoded = polyline.decode(dropoffData.routes[0].overview_polyline.points);
      const fullDropoff = dropoffDecoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
      setDropoffRoute(fullDropoff);
      setRemainingDropoff(fullDropoff);
    } catch (err) {
      // console.error("Goong API error:", err);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [rideId]);

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
    <>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ width: "100%", height: "100%", borderRadius: 16 }}
        initialRegion={region}
        showsUserLocation={false}
        userInterfaceStyle="light"
      >
        {/* Marker: Điểm đón và điểm đến */}
        <Marker coordinate={origin} title="Điểm đón" image={icons.pin} />
        <Marker coordinate={destination} title="Điểm đến" image={icons.pin} />

        {/* Marker: Tài xế */}
        {userLocation && (
          <Marker coordinate={userLocation} image={icons.marker} title="Tài xế" />
        )}

        {/* Polyline: phần còn lại */}
        {remainingPickup.length > 1 && (
          <Polyline coordinates={remainingPickup} strokeColor="green" strokeWidth={4} />
        )}
        {remainingDropoff.length > 1 && (
          <Polyline coordinates={remainingDropoff} strokeColor="#0286FF" strokeWidth={4} />
        )}
      </MapView>

      {/* Nút Run/Stop */}
      <View style={{ position: 'absolute', top: 10, right: 10 }}>
        {!isSimulating ? (
          <TouchableOpacity
            onPress={startSimulation}
            style={{ backgroundColor: 'green', padding: 10, borderRadius: 8 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Run as Virtual</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={stopSimulation}
            style={{ backgroundColor: 'red', padding: 10, borderRadius: 8 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};
