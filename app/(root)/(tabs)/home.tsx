import { GoogleTextInput } from '@/components/GoogleTextInput'
import { Map } from '@/components/Map'
import RideCard from '@/components/RideCard'
import { SignOutButton } from '@/components/SignOutButton'
import { icons, images } from '@/constant'
import { useLocationStore } from '@/store'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from "expo-location"
import { GoongTextInput } from '@/components/GoongTextInput'
import { Router } from 'expo-router'
import { useFetch } from '@/lib/fetch'


export default function Page() {
  const {setUserLocation, setDestinationLocation} = useLocationStore()
  const { user } = useUser()

  const [hasPermissions, setHasPermissions] = useState(false)
  const [role, setRole] = useState<string | null>(null);
  const [ongoingRide, setOngoingRide] = useState<any>(null);
  const apiRide = role === 'driver' ? `/(api)/ride/${user?.id}/getRideFromDriver` : `/(api)/ride/${user?.id}/getRideFromUser`
  const {data:recentRides,loading} = useFetch(apiRide)
  const [revenueToday, setRevenueToday] = useState<number>(0);
  const [revenueMonth, setRevenueMonth] = useState<number>(0);
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        if (role !== "driver" || !user?.id) return;

        const res = await fetch(`/(api)/user/${user.id}/revenueToday`);
         const data = await res.json();

        if (res.ok) {
          setRevenueToday(data.revenueToday || 0);
          setRevenueMonth(data.revenueMonth || 0);
        }
      } catch (err) {
        console.error("Lỗi khi lấy revenueToday:", err);
      }
    };

    fetchRevenue();
  }, [role, user?.id]);
    useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!user?.id) return;

        const response = await fetch(`/(api)/user/${user.id}/role`);
        const data = await response.json();

        if (response.ok && data?.role) {
          setRole(data.role);
        } else {
          console.warn("Không tìm thấy role của người dùng.");
        }
      } catch (err) {
        console.error("Lỗi khi fetch role:", err);
      }
    };

    fetchUserRole();
  }, [user?.id]);
    useEffect(() => {
      const fetchOngoingRide = async () => {
        try {
          if (!user?.id) return;
          const apiRes = role === 'driver' ? `/(api)/ride/${user?.id}/driverOngoing`: `/(api)/ride/${user?.id}/ongoing`
  
           const res = await fetch(apiRes);
          const data = await res.json();
          setOngoingRide(data.rideId);
        } catch (err) {
          console.error("Lỗi khi kiểm tra ride đang ongoing:", err);
        }
      };

      fetchOngoingRide();
    }, [user?.id]);


  const handleDestinationPress = (
    location:{
      latitude: number, 
      longitude: number,
      address: string,
    }) =>{
    setDestinationLocation(location);

    router.push("/(root)/find-ride");
    }

    if (role === 'admin') {
  return (
    <SafeAreaView className="bg-general-500 flex-1 px-5 pt-5">
      <Text className="text-2xl font-JakartaBold mb-4">
        Welcome, Admin {user?.firstName || user?.emailAddresses[0].emailAddress.split('@')[0]}
      </Text>

      {/* Tổng quan */}
      <View className="mb-5 bg-white p-4 rounded-xl shadow">
        <Text className="text-lg font-JakartaBold mb-2">System Overview</Text>
        <Text>Total Users: 3</Text>
        <Text>Total Drivers: 1</Text>
        <Text>Revenue Today: 50000 USD</Text>
        <Text>Revenue This Month: 1350000 USD</Text>
      </View>

      {/* Điều hướng nhanh */}
      <View className="mb-5">
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-xl mb-3"
          onPress={() => router.push('/')}
        >
          <Text className="text-white font-bold text-center">👤 Manage Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-orange-500 p-4 rounded-xl mb-3"
          onPress={() => router.push('/')}
        >
          <Text className="text-white font-bold text-center">🚗 Manage Drivers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-600 p-4 rounded-xl"
          onPress={() => router.push('/')}
        >
          <Text className="text-white font-bold text-center">📋 View All Rides</Text>
        </TouchableOpacity>
      </View>

      <SignOutButton />
    </SafeAreaView>
  );
}
  return (
    <SafeAreaView className='bg-general-500'>
      <FlatList
         data={(recentRides as any[] || []).slice(0, 5)}
        renderItem={({item})=><RideCard ride={item}/>}
        className='px-5'
        contentContainerStyle={{
          paddingBottom:100
        }
        }
        ListEmptyComponent={()=>(
          <View className='flex flex-col items-center justify-center'>
            {!loading ?(
              <>
                <Image 
                  source={images.noResult} 
                  className='w-40 h-40'
                  alt="No reent rides found"
                  resizeMode='contain'
                  />
                  <Text className='text-sm'>No recent rides found</Text>
              </> 
            ):(
                 <ActivityIndicator size="large" color="#000"/>
            )}
          </View>
        )}
        ListHeaderComponent={()=>(
          <>
            <View className='flex flex-row items-center justify-between my-5'>
              <Text className='text-xl capitalize font-JakartaExtraBold'>Welcome {user?.firstName || user?.emailAddresses[0].emailAddress.split('@')[0]}</Text>
               <SignOutButton />
            </View>
            {role === "driver" && (<>
              <Text className='text-lg text-green-600 font-semibold mb-2'>
                Revenue today: {revenueToday.toLocaleString()}đ
              </Text>
              <Text className='text-lg text-green-600 font-semibold mb-2'>
                Revenue this month: {revenueMonth.toLocaleString()}đ
              </Text>
              </>
            )}
             {role === "user" && (
              <GoongTextInput
                icon={icons.search}
                containerStyle="bg-white shadow-sm shadow-neutral-300"
                handlePress={handleDestinationPress}
              />
            )}
            {ongoingRide && (
              <TouchableOpacity
                onPress={() =>
                {role === "driver" ? router.push(`/(root)/driver-riding?rideId=${ongoingRide}`):
                  router.push({
                    pathname: "/(root)/confirm-ride",
                    params: { rideId: ongoingRide },
                  })
                }
                }
                className="bg-green-600 p-4 rounded-xl shadow mb-4"
              >
                <Text className="text-white text-lg font-bold">
                  🚕 Your ride is ongoing, click here to come back
                </Text>
              </TouchableOpacity>
            )}
            
             <>
              <Text className='text-xl font-JakartaBold mt-5 mb-3'>
                Your Current Location
              </Text>
              <View className='bg-transparent h-[300px]'>
              <Map/>
              </View>
              
             </>
             <Text className='text-xl font-JakartaBold mt-5 mb-3'>
                Recent Rides
              </Text>
          </>
        )}
      />
      
    </SafeAreaView>
  ) 
}