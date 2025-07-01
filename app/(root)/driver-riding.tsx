import { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapDriver } from '@/components/Map-driver';
import { icons } from '@/constant';
import { useLocationStore } from '@/store';
import { getDistance } from 'geolib';
export interface Ride {
  id: number;
  user_id: number;
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number | null;
  fare_price: number;
  payment_status: 'unpaid' | 'paid';
  status: 'waiting' | 'ongoing' | 'done';
  created_at: string; 
}
export interface RideWithUser extends Ride {
  user_name: string;
  user_phone: string;
  profile_image_url?: string | null;
}
const DriverRiding = () => {
  const router = useRouter();
  const { rideId } = useLocalSearchParams();

  const [ride, setRide] = useState<RideWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStartedRide, setHasStartedRide] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [canFinish, setCanFinish] = useState(false);
  const { userLatitude, userLongitude } = useLocationStore(); 
  useEffect(() => {
  if (!ride || !userLatitude || !userLongitude) return;

  const driverCoords = {
    latitude: userLatitude,
    longitude: userLongitude,
  };

  if (!hasStartedRide) {
    const pickupCoords = {
      latitude: ride.origin_latitude,
      longitude: ride.origin_longitude,
    };
    const distance = getDistance(driverCoords, pickupCoords);
    console.log('Distance to pickup:', distance);
    setCanStart(distance <= 50);
  } else {
    const destinationCoords = {
      latitude: ride.destination_latitude,
      longitude: ride.destination_longitude,
    };
    const distance = getDistance(driverCoords, destinationCoords);
    console.log('Distance to destination:', distance);
    setCanFinish(distance <= 70);
  }
}, [userLatitude,userLongitude, ride, hasStartedRide]);
  const fetchRideDetails = async () => {
    try {
      const res = await fetch(`/(api)/ride/${rideId}/ride_user`);
      const data = await res.json();

      if (res.ok) {
        setRide(data);
        setHasStartedRide(data.status === 'ongoing');
      } else {
        Alert.alert('Error', data.error || 'Ride not found');
      }
    } catch (err) {
      console.error('Error fetching ride:', err);
      Alert.alert('Error', 'Failed to retrieve ride information');
    } finally {
      setLoading(false);
    }
  };
  const handleCancelRide = () => {
  if (!ride) {
    Alert.alert("Cannot cancel", "No ride information available");
    return;
  }

  const fee = ride.status === "ongoing" ? 30000 : 0;

  Alert.alert(
    "Confirm cancellation",
    fee > 0
      ? `You will be charged ${fee.toLocaleString()}đ and your rating will be reduced. Are you sure?`
      : "Are you sure to cancel this ride?",
    [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`/(api)/ride/${rideId}/cancel`, {
              method: "DELETE",
            });
            const data = await res.json();

            if (res.ok) {
              Alert.alert(
                "Canceled successfully",
                fee > 0
                  ? `You are charged ${fee.toLocaleString()}đ`
                  : "Ride canceled"
              );
              router.replace("/(root)/(tabs)/home");
            } else {
              Alert.alert("Error", data.error || "Cannot cancel ride");
            }
          } catch (err) {
            console.error("Cancel ride error:", err);
            Alert.alert("Error", "Something went wrong when cancelling ride");
          }
        },
      },
    ]
  );
};

  const handleStartRide = async () => {
    try {
      const res = await fetch(`/(api)/ride/${rideId}/ongoing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId }),
      });

      if (res.ok) {
        Alert.alert('Ride Started', 'You have picked up the passenger and started the trip');
        setHasStartedRide(true);
      } else {
        const data = await res.json();
        Alert.alert('Error', data.error || 'Unable to start the ride');
      }
    } catch (err) {
      console.error('Error starting ride:', err);
      Alert.alert('Error', 'Something went wrong, please try again');
    }
  };

  const handleFinishRide = async () => {
    try {
      const res = await fetch(`/(api)/ride/${rideId}/complete_ride`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId }),
      });

      if (res.ok) {
        Alert.alert('Success', 'Ride has been completed');
        router.push('/(root)/(tabs)/home');
      } else {
        Alert.alert('Error', 'Unable to complete the ride');
      }
    } catch (err) {
      console.error('Error finishing ride:', err);
      Alert.alert('Error', 'Something went wrong, please try again');
    }
  };

  useEffect(() => {
    if (rideId) fetchRideDetails();
  }, [rideId]);

  if (!rideId) return <Text className="text-center mt-10">Missing rideId</Text>;
  if (loading || !ride)
    return <ActivityIndicator className="mt-10" size="large" color="#00cc99" />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-[8]">
        <MapDriver rideId={+rideId} />
      </View>

      <ScrollView className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center gap-4 mb-4">
          <Image
            source={
              ride.profile_image_url ? { uri: ride.profile_image_url } : icons.person
            }
            className="w-14 h-14 rounded-full border border-gray-300"
          />
          <View className="flex-1">
            <Text className="font-bold text-xl text-gray-800">{ride.user_name}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${ride.user_phone}`)}>
              <Text className="text-blue-500 text-base mt-1">📞 {ride.user_phone}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="space-y-1">
          <Text className="text-base text-gray-700">
            🏁 <Text className="font-semibold">Pickup:</Text> {ride.origin_address}
          </Text>
          <Text className="text-base text-gray-700">
            📍 <Text className="font-semibold">Destination:</Text> {ride.destination_address}
          </Text>
          <Text className="text-base text-gray-700">
            💵 <Text className="font-semibold">Fare:</Text> {ride.fare_price?.toLocaleString()}$
          </Text>
          <Text className="text-base text-gray-700">
            🚦 <Text className="font-semibold">Status:</Text>{' '}
            {ride.status === 'ongoing' ? 'In Progress' : ride.status}
          </Text>
        </View>
      </ScrollView>

      {/* Ride action buttons */}
      <View className="bg-white p-5 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleCancelRide}
          className="mt-4 bg-red-600 py-4 rounded-full items-center justify-center shadow-md mb-3"
        >
          <Text className="text-white font-bold text-lg">❌ Cancel Ride</Text>
        </TouchableOpacity>
        {!hasStartedRide ? (
          <TouchableOpacity
            onPress={handleStartRide}
            disabled={!canStart}
            className={`py-4 rounded-full items-center justify-center shadow-md ${
              canStart ? 'bg-blue-600' : 'bg-gray-400'
            }`}
          >
            <Text className="text-white font-bold text-lg">
              🚗 Start Ride {canStart ? '' : '(Get closer to pickup)'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleFinishRide}
            disabled={!canFinish}
            className={`py-4 rounded-full items-center justify-center shadow-md ${
              canFinish ? 'bg-green-600' : 'bg-gray-400'
            }`}
          >
            <Text className="text-white font-bold text-lg">
              ✅ Finish Ride {canFinish ? '' : '(Get closer to destination)'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default DriverRiding;
