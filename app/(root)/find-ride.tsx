import CustomButton from "@/components/CustomButton";
import { GoongTextInput } from "@/components/GoongTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constant";
import { useLocationStore } from "@/store";
import { router } from "expo-router";
import { Text, View } from "react-native"

const findRide = () => {

  const { 
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore()

  return (
    <RideLayout title="Ride">
      <View className="my-1">
        <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>
        <GoongTextInput 
          icon={icons.target} 
          initialLocation={userAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor=""
          handlePress={(location) => {
            setUserLocation(
              location
            )
          }}
          />
      </View>
      <View className="my-1">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>
        <GoongTextInput 
          icon={icons.map} 
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor=""
          handlePress={(location) => {
            setDestinationLocation(
              location
            )
          }}
          />
      </View>

      <CustomButton
        title="Find Ride"
        onPress={() => router.push("/(root)/confirm-ride")}
        className="mt-5"
      />
    </RideLayout>
  );
}

export default findRide;