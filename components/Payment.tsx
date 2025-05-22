import { Alert, Text, View } from "react-native";
import CustomButton from "./CustomButton";
import { useStripe } from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/type/type";

const Payment =({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}:PaymentProps) => {

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePaymentSheet = async () => {

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration:{
        mode:{
          amount: 1000,
          currencyCode: "USD",
        },
        confirmHandler: confirmHandler,
      }
    });
    if (!error) {

    }
  };


  const confirmHandler =async(
    paymentMethod,
    _,
    intentCreationCallback,
  )=>{
    const {paymentIntent, customer} = await fetchAPI('/(api)/stripe/createt',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
       name: fullName || email.split('@')[0],
       email: email,
       amount: amount,
       paymentMethodId: paymentMethod.id,

      }),
    })

    if(paymentIntent.client_secret){
      const {result} = await fetchAPI('/(api)/(stripe)/pay',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          payment_intent_id: paymentIntent.id,
          customer_id: customer,
        }),
      })
       if(result.client_secret){
       //ride/create
     }
    }

   

    const {clientSecret, error} = await response.json();
    if(clientSecret){
      intentCreationCallback({
        clientSecret})
    }else{
      intentCreationCallback({
        error: new Error("Failed to create payment intent")
    })
  }
}


    

  const openPaymentSheet = async () => {
    await initializePaymentSheet();
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'Your order is confirmed!');
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />
    </>
  );
}
export default Payment;