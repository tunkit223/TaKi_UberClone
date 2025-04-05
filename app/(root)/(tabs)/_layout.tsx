import { icons } from "@/constant";
import { Tabs } from "expo-router";
import { ImageSourcePropType } from "react-native";
import { Image, View } from "react-native";
const TabIcon = ({
  source,
  focused,
}:{
  source:ImageSourcePropType,
  focused:boolean
})=>(
  <View className={`flex flex-row justify-center items-center rounded-full ${focused ? 'bg-general-300':''}`}>
    <View className={`rounded-[15px] w-12 h-12 items-center justify-center ${focused?'bg-general-400':''}`}>
      <Image 
        source={source} 
        tintColor="white"
        resizeMode="contain"
        className="w-7 h-7"
      />
    </View>
  </View>
)
const Layout = () =>(
  <Tabs initialRouteName="home" screenOptions={{
    tabBarActiveTintColor : 'white',
    tabBarInactiveTintColor: "white",
    tabBarShowLabel: false,
    tabBarStyle:{
      backgroundColor:"#333333",
      borderRadius: 50,
      paddingBottom:24,
      overflow:"hidden",
      marginHorizontal:20,
      marginBottom:15,
      height:66,
      display:"flex",
      justifyContent: "center", 
      alignItems: "center",
      flexDirection:"row",
      position:"absolute"
    },
    tabBarItemStyle: {
      justifyContent: "center",
      alignItems: "center",
    }
  }}>
    <Tabs.Screen
      name="home"
      options={{
        title:"Home",
        headerShown: false,
        tabBarIcon: ({focused}) => <TabIcon focused = {focused} source={icons.home}/>
      }}
    />
    <Tabs.Screen
      name="rides"
      options={{
        title:"Rides",
        headerShown: false,
        tabBarIcon: ({focused}) => <TabIcon focused = {focused} source={icons.list}/>
      }}
    />
    <Tabs.Screen
      name="chat"
      options={{
        title:"Chat",
        headerShown: false,
        tabBarIcon: ({focused}) => <TabIcon focused = {focused} source={icons.chat}/>
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title:"Profile",
        headerShown: false,
        tabBarIcon: ({focused}) => <TabIcon focused = {focused} source={icons.profile}/>
      }}
    />
  </Tabs>
)
export default Layout