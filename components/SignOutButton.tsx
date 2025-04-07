import { icons } from '@/constant'
import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity, Image } from 'react-native'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    try {
      await signOut()
      Linking.openURL(Linking.createURL('/(auth)/sign-in'))
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <TouchableOpacity     
      onPress={handleSignOut}
      className='justify-center items-center w-10 h-10 rounded-full bg-white'
    >
        <Image
          source={icons.out}
          className='w-6 h-6'
        />
    </TouchableOpacity>
  )
}