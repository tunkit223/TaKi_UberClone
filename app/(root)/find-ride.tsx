import CustomButton from "@/components/CustomButton";
import { GoongTextInput } from "@/components/GoongTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constant";
import { useLocationStore } from "@/store";

import { router } from "expo-router";
import { Alert, Text, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { calculateTripTimeAndFare } from "@/lib/map";
import { fetchAPI, useFetch } from "@/lib/fetch";

const FindRide = () => {
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
    setUserLocation,
    setDestinationLocation
  } = useLocationStore();

  const { user } = useUser()
  
  const handleFindRide = async () => {
    if (!userAddress || !destinationAddress || !user?.id) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn điểm đi và đến.");
      return;
    }

    try {
     
      const result = await calculateTripTimeAndFare({
        userLatitude: userLatitude,
        userLongitude: userLongitude,
        destinationLatitude: destinationLatitude,
        destinationLongitude: destinationLongitude,
      });

      if (!result) throw new Error("Không tính được thời gian hoặc giá tiền");

      const { time, price } = result;
   
      const response = await fetch(`/(api)/user/${user.id}/id`);
      const data = await response.json();

      const res =  await fetchAPI("/(api)/ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         body: JSON.stringify({
          origin_address: userAddress,
          destination_address: destinationAddress,
          origin_latitude: userLatitude,
          origin_longitude: userLongitude,
          destination_latitude: destinationLatitude,
          destination_longitude: destinationLongitude,
          ride_time: time.toFixed(0),
          fare_price: parseInt(price) * 100,
          payment_status: "unpaid",
          status: "waiting",
          user_id: data.id,
        }),
      });
      const rideId = res?.ride?.id;
        if (!rideId) throw new Error("Không lấy được rideId sau khi tạo");

        router.push({
          pathname: "/(root)/confirm-ride",
          params: { rideId: rideId.toString() },
        });
    } catch (err:any) {
      console.error("Lỗi khi tạo ride:", err);
      Alert.alert("Lỗi", err.message || "Không thể tạo chuyến đi");
    }
  };

  return (
    <RideLayout title="Ride">
      <View className="my-1">
        <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>
        <GoongTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor=""
          handlePress={setUserLocation}
        />
      </View>

      <View className="my-1">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>
        <GoongTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor=""
          handlePress={setDestinationLocation}
        />
      </View>

      <CustomButton title="Find Ride" onPress={handleFindRide} className="mt-5" />
    </RideLayout>
  );
};

export default FindRide;