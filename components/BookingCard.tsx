import { View, Text } from "react-native"
import CustomButton from "./CustomButton"

type BookingCardProps = {
  booking: {
    id: number;
    ride: {
      origin_address: string;
      destination_address: string;
      fare_price: number;
      ride_time: number;
      created_at: string;
    };
  };
  onConfirm: () => void;
};

const BookingCard = ({ booking, onConfirm }: BookingCardProps) => {
  return (
    <View className="bg-white rounded-2xl shadow-md shadow-neutral-300 p-4 mb-4 mx-5">
      <Text className="text-lg font-JakartaBold mb-2">Booking #{booking.id}</Text>
      <Text className="text-sm mb-1">🛫 From: {booking.ride.origin_address}</Text>
      <Text className="text-sm mb-1">🛬 To: {booking.ride.destination_address}</Text>
      <Text className="text-sm mb-1">💰 Price: ${booking.ride.fare_price}</Text>
      <Text className="text-sm mb-1">⏱️ Time: {booking.ride.ride_time} minutes</Text>
      <Text className="text-xs text-gray-500 mb-3">
        📅 Requested at: {new Date(booking.ride.created_at).toLocaleString()}
      </Text>

      <CustomButton
        title="Confirm"
        bgVariant="success"
        textVariant="primary"
        onPress={onConfirm}
      />
    </View>
  );
};

export default BookingCard;
