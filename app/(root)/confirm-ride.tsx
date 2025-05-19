import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore } from "@/store";
import { router } from "expo-router";
import { View,Text, FlatList } from "react-native";


const ConfirmRide = () => {

  const {drivers, selectedDriver, setSelectedDriver} = useDriverStore();

  return(
    <RideLayout title="Choose a driver">
      <FlatList 
        data={drivers}
        renderItem={({item}) => <DriverCard 
                                  selected={selectedDriver!} 
                                  item={item} 
                                  setSelected={()=>setSelectedDriver(Number(item.id)!)}/>}
        ListFooterComponent={() => 
        <View className="mx-5 mt-10 " >
          <CustomButton title="Select Driver" onPress={() => router.push("/(root)/book-ride")}/>
        </View>
      }
      />
        
 
    </RideLayout>
  )
}

export default ConfirmRide;