import { icons } from "@/constant";
import { GoogleInputProps } from "@/type/type";
import axios from "axios";
import { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONGMAP_API_KEY!;

export const GoongTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    if (!text) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://rsapi.goong.io/Place/AutoComplete`,
        {
          params: {
            api_key: GOONG_API_KEY,
            input: text,
          },
        }
      );
      setSuggestions(res.data.predictions);
    } catch (error) {
      console.error("Lỗi lấy gợi ý từ Goong:", error);
    }
  };

  const handleSelectPlace = async (placeId: string, description: string) => {
    try {
      const res = await axios.get(
        `https://rsapi.goong.io/Place/Detail`,
        {
          params: {
            api_key: GOONG_API_KEY,
            place_id: placeId,
          },
        }
      );

      const { lat, lng } = res.data.result.geometry.location;
      handlePress({
        latitude: lat,
        longitude: lng,
        address: description,
      });
      setSuggestions([]);
      setQuery(description);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết địa điểm:", error);
    }
  };

  return (
    <View
      className={`relative z-50 rounded-xl ${containerStyle} mb-5`}
    >
      <View className="flex flex-row items-center bg-white px-4 py-2 rounded-full shadow-sm shadow-neutral-300 mx-5">
        <Image
          source={icon ?? icons.search}
          className="w-6 h-6 mr-2"
          resizeMode="contain"
        />
        <TextInput
          className="flex-1 text-base"
          placeholder={initialLocation ?? "Where do you want to go?"}
          value={query}
          onChangeText={fetchSuggestions}
          placeholderTextColor="gray"
          style={{
            backgroundColor: textInputBackgroundColor ?? "white",
          }}
        />
      </View>

      {suggestions.length > 0 && (
        <FlatList
          className="absolute top-14 left-0 right-0 bg-white mx-5 rounded-md shadow"
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-3 border-b border-gray-200"
              onPress={() => handleSelectPlace(item.place_id, item.description)}
            >
              <Text className="text-base">{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};
