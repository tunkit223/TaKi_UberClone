import { GoogleInputProps } from "@/type/type";
import { Text, View } from "react-native";

export const GoogleTextInput = ({
  icon, 
  initialLocation, 
  containerStyle, 
  textInputBackgroundColor, 
  handlePress,
}: GoogleInputProps) =>(
  <View className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle} mb-5`}>
    <Text>
      Search
    </Text>
  </View>
)