import { Alert, Image, Text, View } from "react-native";
import CustomButton from "./CustomButton";
import { useStripe } from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/type/type";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";
import { images } from "@/constant";
import { router } from "expo-router";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { userId } = useAuth();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
  } = useLocationStore();

  const [success, setSuccess] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const fetchPaymentSheetParams = async () => {
    try {
      const { paymentIntent, customer } = await fetchAPI("/(api)/(stripe)/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName || email.split("@")[0],
          email: email,
          amount: parseInt(amount),
        }),
      });

      console.log("Fetched paymentIntent:", paymentIntent);
      setClientSecret(paymentIntent.client_secret);
      setCustomerId(customer);
    } catch (error) {
      console.error("Failed to fetch payment sheet params", error);
    }
  };

  const initializePaymentSheet = async () => {
    if (!clientSecret) return;

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Ryde Inc.",
      customerId: customerId!,
      paymentIntentClientSecret: clientSecret,
      returnURL: "myapp://book-ride",
    });

    if (error) {
      console.error("Error initializing payment sheet:", error);
      Alert.alert("Error", error.message);
    }
  };

  const openPaymentSheet = async () => {
    if (!clientSecret) {
      Alert.alert("Payment not ready", "Please try again later.");
      return;
    }

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      await createRide();
      setSuccess(true);
    }
  };

  const createRide = async () => {
    try {
      await fetchAPI("/(api)/ride/create", {
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
          ride_time: rideTime.toFixed(0),
          fare_price: parseInt(amount) * 100,
          payment_status: "paid",
          driver_id: driverId,
          user_id: userId,
        }),
      });
    } catch (error) {
      console.error("Failed to create ride", error);
    }
  };

  useEffect(() => {
    // Gọi khi component mount
    fetchPaymentSheetParams();
  }, []);

  useEffect(() => {
    // Khi đã có clientSecret thì mới init
    if (clientSecret) {
      initializePaymentSheet();
    }
  }, [clientSecret]);

  return (
    <>
      <CustomButton title="Confirm Ride" className="my-10" onPress={openPaymentSheet} />

      <ReactNativeModal isVisible={success} onBackdropPress={() => setSuccess(false)}>
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">Ride booked!</Text>

          <Text className="text-md text-general-200 font-JakartaMedium text-center mt-3">
            Thank you for your booking. Your reservation has been placed. Please proceed with your trip!
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
