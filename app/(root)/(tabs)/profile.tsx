import { useUser } from "@clerk/clerk-expo";
import { ActivityIndicator, Alert, Button, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";
import { useFetch } from "@/lib/fetch";
import { useEffect, useState } from "react";

const Profile = () => {
  const { user } = useUser();
   const userId = user?.id;
  console.log("User ID:", userId);
  const { data: userData, loading, error } = useFetch<any>(`/(api)/user/${user?.id}`);
       console.log("User Data:", userData);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  // Driver-specific
  const [carSeats, setCarSeats] = useState('');
  const [carImageUrl, setCarImageUrl] = useState('');
  const [rating, setRating] = useState('');

   useEffect(() => {
    if (userData) {
      const user = userData;

      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setProfileImageUrl(user.profile_image_url || '');

      if (user.role === 'driver' && user.driver) {
        setCarSeats(user.driver.car_seats?.toString() || '');
        setCarImageUrl(user.driver.car_image_url || '');
        setRating(user.driver.rating?.toString() || '');
      }
    }
  }, [userData]);
   const handleSave = async () => {
    try {
      const body: any = {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        profile_image_url: profileImageUrl,
      };

      if (userData?.role === 'driver') {
        body.driver = {
          car_seats: parseInt(carSeats),
          car_image_url: carImageUrl,
        };
      }

      const res = await fetch(`/(api)/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0000ff" />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text>Error loading profile.</Text>
    </SafeAreaView>
  );
   return (
    <SafeAreaView className="flex-1">
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-2xl font-JakartaBold my-5">My profile</Text>

        <View className="flex items-center justify-center my-5">
          <Image
            source={{ uri: profileImageUrl || user?.externalAccounts[0]?.imageUrl || user?.imageUrl }}
            style={{ width: 110, height: 110, borderRadius: 55 }}
            className="rounded-full border-[3px] border-white shadow-sm"
          />
        </View>

        <View className="bg-white rounded-lg shadow-sm px-5 py-3">
          <InputField label="First Name" value={firstName} onChangeText={setFirstName} />
          <InputField label="Last Name" value={lastName} onChangeText={setLastName} />
          <InputField label="Phone" value={phone} onChangeText={setPhone} />
          <InputField label="Profile Image URL" value={profileImageUrl} onChangeText={setProfileImageUrl} />

          {userData?.role === 'driver' && (
            <>
              <InputField label="Car Seats" value={carSeats} onChangeText={setCarSeats} keyboardType="numeric" />
              <InputField label="Car Image URL" value={carImageUrl} onChangeText={setCarImageUrl} />
              <InputField label="Rating" value={rating} editable={false} />
            </>
          )}

          <View className="mt-5">
            <Button title="Save" onPress={handleSave} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;