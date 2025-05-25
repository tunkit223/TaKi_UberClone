import RideCard from "@/components/RideCard"
import { useFetch } from "@/lib/fetch"
import { useUser } from "@clerk/clerk-expo"
import { ActivityIndicator, FlatList, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "react-native"
import { images } from "@/constant"
import { SignOutButton } from "@/components/SignOutButton"
import { Ride } from "@/type/type"
const Rides = () =>{
   const { user } = useUser()
  const {data:recentRides,loading} = useFetch<Ride[]>(`/(api)/ride/${user?.id}`)
  return (
    <SafeAreaView>
       <FlatList
              data={recentRides}
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
                    <Text className='text-2xl capitalize font-JakartaBold py-5'>All Rides</Text>
                </>
              )}
            />
    </SafeAreaView>
  )
}
export default Rides