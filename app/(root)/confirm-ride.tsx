import { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RideLayout from "@/components/RideLayout";
import { MapDriver } from "@/components/Map-driver";
import { icons } from "@/constant";
import LottieView from "lottie-react-native";

const ConfirmRide = () => {
  const { rideId } = useLocalSearchParams();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hủy chuyến đi
  const handleCancelRide = () => {
    if (!ride) {
      Alert.alert("Không thể hủy", "Chưa có thông tin chuyến đi");
      return;
    }

    const fee = ride.status === "ongoing" ? 30000 : 0;

    Alert.alert(
      "Confirm for cancelling ride",
      fee > 0
        ? `You will be charged ${fee.toLocaleString()}đ. Are you sure?`
        : "Are you sure to cancel this ride?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Cancel Ride",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`/(api)/ride/${rideId}/cancel`, {
                method: "DELETE",
              });

              const data = await res.json();

              if (res.ok) {
                Alert.alert("Cancel successfully", fee > 0 ? `You are charged ${fee.toLocaleString()}đ` : "You are not charged");
                router.replace("/(root)/(tabs)/home");
              } else {
                Alert.alert("Error", data.error || "Cannot cancel ride");
              }
            } catch (err) {
              console.error("Lỗi khi hủy chuyến đi:", err);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi hủy chuyến đi");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (!rideId) return;

    const poll = setInterval(async () => {
      try {
        // Lấy thông tin booking
        const resBooking = await fetch(`/(api)/booking/${rideId}/get`);
        const bookingData = await resBooking.json();

        if (resBooking.ok) {
          setBooking(bookingData.data);
        }

        // Nếu đã confirm, lấy ride
        if (bookingData?.data?.status === "confirm") {
          const resRide = await fetch(`/(api)/ride/${rideId}/ride_user`);
          const rideData = await resRide.json();

          if (resRide.ok) {
            setRide(rideData);
            if (rideData.status === "done") {
              clearInterval(poll);
              Alert.alert("Ride was finished", "Thank you for using our service", [
                {
                  text: "OK",
                  onPress: () => router.replace("/(root)/(tabs)/home"),
                },
              ]);
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      } finally {
        setLoading(false);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [rideId]);

  if (!rideId) {
    return <Text className="text-center mt-10">No rideId</Text>;
  }

  if (loading) {
    return (
      <RideLayout title="Đang tìm tài xế...">
        <View className="flex-1 items-center justify-center">
          <LottieView
            source={require("@/assets/animations/radar.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
          <Text className="mt-5 text-lg font-semibold text-gray-700">
            Looking for a driver...
          </Text>

          {/* Nút hủy luôn hiển thị */}
          <TouchableOpacity
            onPress={handleCancelRide}
            className="mt-6 bg-red-600 px-6 py-3 rounded-full shadow items-center"
          >
            <Text className="text-white text-lg font-semibold">❌ Cancel ride</Text>
          </TouchableOpacity>
        </View>
      </RideLayout>
    );
  }

  if (booking?.status === "confirm") {
    return (
      <RideLayout title="Driver is conming">
        <View className="flex-1">
          <ScrollView className="p-4 bg-white border-t border-gray-200">
            <View className="flex-row items-center gap-4 mb-4">
              <Image
                source={
                  booking.profile_image_url
                    ? { uri: booking.profile_image_url }
                    : icons.person
                }
                className="w-16 h-16 rounded-full border border-gray-300"
              />
              <View className="flex-1">
                <Text className="font-bold text-lg text-gray-800">
                  {booking.driver_name}
                </Text>
                {booking.driver_phone && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${booking.driver_phone}`)}
                  >
                    <Text className="text-blue-500 text-base mt-1">
                      📞 {booking.driver_phone}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View className="space-y-1">
              <Text className="text-base text-gray-700">
                🚗 <Text className="font-semibold">Car:</Text>{" "}
                {booking.car_seats || "Không rõ"} seats
              </Text>
              <Text className="text-base text-gray-700">
                ⭐ <Text className="font-semibold">Rating:</Text>{" "}
                {booking.rating || "Chưa có"}
              </Text>
              <Text className="text-base text-gray-700">
                💬 <Text className="font-semibold">Note:</Text>{" "}
                {booking.note || "Không có"}
              </Text>
            </View>

            {/* Nút hủy luôn hiển thị */}
            <TouchableOpacity
              onPress={handleCancelRide}
              className="mt-6 bg-red-600 px-6 py-3 rounded-full shadow items-center"
            >
              <Text className="text-white text-lg font-semibold">❌ Cancel Ride</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </RideLayout>
    );
  }

  // Trạng thái chưa có tài xế
  return (
    <RideLayout title="Looking for a driver...">
      <View className="flex-1 items-center justify-center">
        <LottieView
          source={require("@/assets/animations/radar.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
        <Text className="mt-5 text-lg font-semibold text-gray-700">
          Looking for a driver...
        </Text>

        <TouchableOpacity
          onPress={handleCancelRide}
          className="mt-6 bg-red-600 px-6 py-3 rounded-full shadow items-center"
        >
          <Text className="text-white text-lg font-semibold">❌ Cancel ride</Text>
        </TouchableOpacity>
      </View>
    </RideLayout>
  );
};

export default ConfirmRide;
