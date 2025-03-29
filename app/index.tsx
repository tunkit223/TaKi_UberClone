import { Redirect } from "expo-router"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import "@/global.css"; 

const Home = () =>{
  return <Redirect href="/(auth)/welcome"/>
  
}
export default Home