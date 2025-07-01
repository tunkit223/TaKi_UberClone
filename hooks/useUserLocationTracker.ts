import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { useLocationStore } from "@/store";

// Hàm reverse geocode
const fetchAddressFromCoordsWithGoong = async (latitude: number, longitude: number) => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOONGMAP_API_KEY!;
    const response = await fetch(
      `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`
    );
    const data = await response.json();

    if (data?.results?.length > 0) {
      return data.results[0].formatted_address;
    } else {
      return "Không xác định";
    }
  } catch (error) {
    console.error("Lỗi khi reverse geocode với Goong:", error);
    return "Không xác định";
  }
};

export const useUserLocationTracker = () => {
  const { setUserLocation } = useLocationStore();
  const prevLat = useRef<number | null>(null);
  const prevLng = useRef<number | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Không có quyền truy cập vị trí");
        return;
      }

      // 🚀 Lấy vị trí ban đầu chỉ 1 lần
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = initialLocation.coords;
      prevLat.current = latitude;
      prevLng.current = longitude;

      const address = await fetchAddressFromCoordsWithGoong(latitude, longitude);

      setUserLocation({ latitude, longitude, address });

      // 🚨 Theo dõi vị trí khi di chuyển ≥ 10m
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // chỉ update khi đi được ≥10m
        },
        async (location) => {
          const { latitude, longitude } = location.coords;

          const latDiff = Math.abs(latitude - prevLat.current!);
          const lngDiff = Math.abs(longitude - prevLng.current!);

          if (latDiff > 0.0001 || lngDiff > 0.0001) {
            prevLat.current = latitude;
            prevLng.current = longitude;

            const address = await fetchAddressFromCoordsWithGoong(latitude, longitude);

            setUserLocation({ latitude, longitude, address });
          }
        }
      );
    };

    startTracking();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);
};
