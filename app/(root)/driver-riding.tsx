import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, Linking, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapDriver } from '@/components/Map-driver';
import { icons } from '@/constant';

const DriverRiding = () => {
  const router = useRouter();
  const { rideId } = useLocalSearchParams();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRideDetails = async () => {
    try {
     
        const res = await fetch(`/(api)/ride/${rideId}/ride_user`);
      const data = await res.json();
  
      if (res.ok) {
        setRide(data);
      } else {
        Alert.alert('Lỗi', data.error || 'Không tìm thấy chuyến đi');
      }
    } catch (err) {
      console.error('Lỗi khi fetch ride:', err);
      Alert.alert('Lỗi', 'Không thể lấy thông tin chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRide = async () => {
    try {
      const res = await fetch(`/api/ride/${rideId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'cash' }),
      });

      if (res.ok) {
        Alert.alert('Thành công', 'Chuyến đi đã được hoàn thành');
        // router.replace("/(root)/driver-home");
      } else {
        const err = await res.json();
        Alert.alert('Lỗi', err.message || 'Không thể hoàn thành chuyến đi');
      }
    } catch (err) {
      console.error('Lỗi khi hoàn thành chuyến đi:', err);
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  useEffect(() => {
    if (rideId) fetchRideDetails();
  }, [rideId]);

  if (!rideId) return <Text className="text-center mt-10">Không có rideId</Text>;
  if (loading || !ride) return <ActivityIndicator className="mt-10" size="large" color="#00cc99" />;

  return (
     <SafeAreaView className="flex-1 bg-white">
      <View className="flex-[8]">
        <MapDriver rideId={+rideId} />
      </View>

      {/* Thông tin người dùng & chuyến đi */}
      <ScrollView className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center gap-4 mb-4">
          <Image
            source={
              ride.profile_image_url
                ? { uri: ride.profile_image_url }
                : icons.person
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
          <Text className="text-base text-gray-700">🏁 <Text className="font-semibold">Điểm đón:</Text> {ride.origin_address}</Text>
          <Text className="text-base text-gray-700">📍 <Text className="font-semibold">Điểm đến:</Text> {ride.destination_address}</Text>
          <Text className="text-base text-gray-700">💵 <Text className="font-semibold">Giá:</Text> {ride.fare_price?.toLocaleString()}$</Text>
          <Text className="text-base text-gray-700">🚦 <Text className="font-semibold">Trạng thái:</Text> {ride.status === 'ongoing' ? 'Đang di chuyển' : ride.status}</Text>
        </View>
      </ScrollView>

      {/* Nút kết thúc chuyến đi */}
      <View className="bg-white p-5 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleFinishRide}
          className="bg-green-600 py-4 rounded-full items-center justify-center shadow-md"
        >
          <Text className="text-white font-bold text-lg">
            ✅ Kết thúc & thu tiền mặt
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DriverRiding;