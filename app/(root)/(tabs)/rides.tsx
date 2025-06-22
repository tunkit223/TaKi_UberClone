import { useUser } from "@clerk/clerk-expo"
import { ActivityIndicator, FlatList, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useEffect, useState } from "react"
import { useFetch } from "@/lib/fetch"
import { Image } from "react-native"
import { images } from "@/constant"
import RideCard from "@/components/RideCard"
import BookingCard from "@/components/BookingCard"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { router } from "expo-router"
const Rides = () => {
  const { user } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!user?.id) return;
        const response = await fetch(`/(api)/user/${user.id}/role`);
        const data = await response.json();
        if (response.ok && data?.role) {
          setRole(data.role);
        }
      } catch (err) {
        console.error("Lỗi khi fetch role:", err);
      }
    };
    fetchUserRole();
  }, [user?.id]);

    const fetchBookings = async () => {
    if (role !== "driver") return;
    setLoadingBookings(true);
    try {
      const res = await fetch("/(api)/booking/unconfirm");
      const data = await res.json();
      if (res.ok) {
        setBookings(
          data.sort(
            (a: any, b: any) =>
              new Date(b.ride.created_at).getTime() -
              new Date(a.ride.created_at).getTime()
          )
        );
      }
    } catch (err) {
      console.error("Lỗi khi load bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };
    useEffect(() => {
    fetchBookings();
  }, [role]);
  const confirmBooking = async (bookingId: number) => {
  try {
    const res = await fetch(`/(api)/booking/${bookingId}/confirm`, {
      method: "PUT",
      body: JSON.stringify({ clerk_id: user?.id }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      const data = await res.json(); // <-- lấy rideId từ đây
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      router.push(`/(root)/driver-riding?rideId=${data.rideId}`);
    }
  } catch (err) {
    console.error("Lỗi khi confirm:", err);
  }
};

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      {role === "user" && (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={() => (
            <View className="items-center justify-center p-10">
              <Image source={images.noResult} className="w-40 h-40" resizeMode="contain" />
              <Text className="text-sm mt-3">No recent rides found</Text>
            </View>
          )}
        />
      )}

      {role === "driver" && (
        <>
          <View className="flex flex-row items-center justify-between px-5 mt-5 mb-3">
            <Text className="text-2xl font-JakartaBold">Unconfirmed Bookings</Text>
            <Ionicons
              name="reload"
              size={24}
              color="#000"
              onPress={fetchBookings}
              style={{ padding: 5 }}
            />
            
          </View>


          {loadingBookings ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <BookingCard
                  booking={item}
                  onConfirm={() => confirmBooking(item.id)}
                />
              )}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={() => (
                <View className="items-center justify-center mt-10">
                  <Image source={images.noResult} className="w-40 h-40" resizeMode="contain" />
                  <Text className="text-sm mt-3">No unconfirmed bookings</Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default Rides;
