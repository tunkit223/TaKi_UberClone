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
  const {data:recentRides,loading} = useFetch(`/(api)/ride/${user?.id}`)
  const [hasPermissions, setHasPermissions] = useState(false)

  const [role, setRole] = useState<string | null>(null);

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

  const handleDestinationPress = (
    location:{
      latitude: number, 
      longitude: number,
      address: string,
    }) =>{
    setDestinationLocation(location);

    router.push("/(root)/find-ride");
    }

  

const fetchAddressFromCoordsWithGoong = async (latitude: number, longitude: number) => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOONGMAP_API_KEY!; // Thay bằng API key thực của bạn
    const response = await fetch(
      `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`
    );
    const data = await response.json();

    if (data?.results?.length > 0) {
      return data.results[0].formatted_address;
    } else {
      return "Không xác định (Goong)";
    }
  } catch (error) {
    console.error("Lỗi khi reverse geocode với Goong:", error);
    return "Không xác định";
  }
};



useEffect(() => {
  (async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermissions(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      if (!location?.coords) return;

      const { latitude, longitude } = location.coords;

      console.log("User location:", latitude, longitude);

     
      const address = await fetchAddressFromCoordsWithGoong(latitude, longitude);

      setUserLocation({
        latitude,
        longitude,
        address,
      });
    } catch (error) {
      console.error("Lỗi khi lấy vị trí:", error);
    }
  })();
}, []);


  
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

             {role === "user" && (
              <GoongTextInput
                icon={icons.search}
                containerStyle="bg-white shadow-sm shadow-neutral-300"
                handlePress={handleDestinationPress}
              />
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