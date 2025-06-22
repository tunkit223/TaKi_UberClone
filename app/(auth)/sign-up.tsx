import CustomButton from "@/components/CustomButton"
import InputField from "@/components/InputField"
import OAuth from "@/components/OAuth"
import { icons, images } from "@/constant"
import { Link, router, useRouter  } from "expo-router"
import { useState } from "react"
import { Image, ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from "react-native"
import * as React from 'react'
import { useSignUp } from '@clerk/clerk-expo'
import {ReactNativeModal} from "react-native-modal"
import { fetchAPI } from "@/lib/fetch"
const Signup = () =>{
  const [form, setForm] = useState({
    name:"",
    email:"",
    password:"",
    role: "user",
  })
  const { isLoaded, signUp, setActive } = useSignUp()
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  })

  const onSignUpPress = async () => {
    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      setVerification({
        ... verification,

        state: "pending"
      })
    } catch (err:any) {
    
      Alert.alert("Error", err.errors[0].longMessage)
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
    
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code
      })

     
      if (signUpAttempt.status === 'complete') {
        await fetchAPI('/(api)/user',{
          method:"POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: signUpAttempt.createdUserId,
            role: form.role,
          })
        })
        await setActive({ session: signUpAttempt.createdSessionId })
        setVerification({
          ...verification,
          state: "success"
        })
      } else {
        setVerification({
          ...verification,
          error: 'Verification failed.',
          state: "failed"
        })
      }
    } catch (err:any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed"
      })
    }
  }
  
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image
            source={images.signUpCar} className="z-0 w-full h-[250px]"
          />
          <Text className="text-2xl text-black 
            font-JakartaSemiBold absolute bottom-5  left-5">
              Create Your Account
            </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value)=>setForm({...form,
              name:value,
            })}
          />
          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value)=>setForm({...form,
              email:value,
            })}
          />
          <InputField
            label="Password"
            placeholder="Enter your password"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value)=>setForm({...form,
              password:value,
            })}
          />
          <View className="flex-row justify-center space-x-5 mt-4">
            <TouchableOpacity
              onPress={() => setForm({ ...form, role: "user" })}
              className="flex-row items-center space-x-2 mr-10"
            >
              <View className={`w-5 h-5 rounded-full border ${form.role === 'user' ? 'bg-primary-500 border-gray-400' : 'border-gray-400'}`} />
              <Text className="text-base">User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setForm({ ...form, role: "driver" })}
              className="flex-row items-center space-x-2"
            >
              <View className={`w-5 h-5 rounded-full border ${form.role === 'driver' ? 'bg-primary-500 border-gray-400' : 'border-gray-400'}`} />
              <Text className="text-base">Driver</Text>
            </TouchableOpacity>
          </View>
          <CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6"/>
        <OAuth/>
        <Link href="/sign-in" className="text-lg text-center text-general-200 mt-10">
            <Text>Already have an account? </Text>
            <Text className="text-primary-500">Sign In</Text>
        </Link>
        </View>
        
        <ReactNativeModal 
          isVisible={verification.state === "pending"}
          onModalHide={()=>
            setVerification({...verification, state:"success"})
          }
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="text-2xl font-JakartaExtraBold mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}
            </Text>

            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code)=> 
                setVerification({...verification, code})
              }
            />
            {verification.error &&(
                <Text className="text-red-500 text-sm mt-1">
                  {verification.error}
                </Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onVerifyPress}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>

       <ReactNativeModal isVisible={verification.state === "success"}>
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
              <Image source={images.check} className="w-[110px] h-[110px] mx-auto my-5"/>
              <Text className="text-3xl font-JakartaBold text-center">
                Verified
              </Text>
              <Text className="text-base text-gray-400 font-Jakarta text-center">
                
                You have successfully verified your account.
              </Text>

              <CustomButton 
                title="Browse Home" 
                onPress={()=>router.push("/(root)/(tabs)/home")}
                className="mt-5"/>
            </View>
       </ReactNativeModal>
      </View>
    </ScrollView>
  )
}
export default Signup