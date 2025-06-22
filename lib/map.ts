import { Driver, MarkerData } from "@/type/type";

const GOONG_API_KEY = `${process.env.EXPO_PUBLIC_GOONGMAP_API_KEY}`;

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  try {
    const timesPromises = markers.map(async (marker) => {
      // Gọi API Goong Directions từ tài xế tới người dùng
      const resToUser = await fetch(
        `https://rsapi.goong.io/Direction?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&vehicle=car&api_key=${GOONG_API_KEY}`
      );
      const dataToUser = await resToUser.json();
      const timeToUser = dataToUser.routes?.[0]?.legs?.[0]?.duration?.value || 0;

      // Gọi API Goong Directions từ người dùng tới điểm đến
      const resToDestination = await fetch(
        `https://rsapi.goong.io/Direction?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&vehicle=car&api_key=${GOONG_API_KEY}`
      );
      const dataToDestination = await resToDestination.json();
      const timeToDestination =
        dataToDestination.routes?.[0]?.legs?.[0]?.duration?.value || 0;

      const totalTime = (timeToUser + timeToDestination) / 60; // tổng thời gian (phút)
      const price = (totalTime * 0.5).toFixed(2); // đơn giá theo thời gian

      return { ...marker, time: totalTime, price };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
  }
};


export const calculateTripTimeAndFare = async ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  ) return;

  try {
    
    const res = await fetch(
      `https://rsapi.goong.io/Direction?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&vehicle=car&api_key=${GOONG_API_KEY}`
    );

    const data = await res.json();
    const timeInSeconds = data.routes?.[0]?.legs?.[0]?.duration?.value || 0;
    const timeInMinutes = timeInSeconds / 60;
    const price = (timeInMinutes * 0.5).toFixed(2); // có thể tùy chỉnh giá

    return {
      time: timeInMinutes,
      price,
    };
  } catch (error) {
    console.error("Error calculating trip time and fare:", error);
  }
};
