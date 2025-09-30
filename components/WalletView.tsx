import { View, Text, TextInput, Alert, ActivityIndicator, Image } from "react-native";
import { useEffect, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { fetchAPI } from "@/lib/fetch";
import CustomButton from "./CustomButton";
import ReactNativeModal from "react-native-modal";
import { images } from "@/constant";
import WalletHistoryCard from "./WalletHistoryCard";

const WalletView = ({ userId, email }: { userId: any; email: string }) => {
  const [amount, setAmount] = useState("");
  const [walletMoney, setWalletMoney] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const fetchWalletHistory = async () => {
    try {
      const res = await fetch(`/(api)/wallet/${userId}/history`);
      const data = await res.json();
      if (res.ok) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error fetching wallet history:", err);
    }
  };
   const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const fetchWallet = async () => {
    try {
      const res = await fetch(`/(api)/wallet/${userId}`);
      const data = await res.json();

     
      setWalletMoney(data.money);
    } catch (err) {
      console.error("Error fetching wallet:", err);
      setWalletMoney(0);
    }
  };

  const fetchPaymentSheetParams = async () => {
    try {
      const { paymentIntent, customer } = await fetchAPI("/(api)/(stripe)/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0],
          email: email,
          amount: parseInt(amount),
        }),
      });

      setClientSecret(paymentIntent.client_secret);
      setCustomerId(customer);
    } catch (error) {
      console.error("Failed to fetch payment sheet params", error);
      Alert.alert("Error", "Failed to initialize payment.");
    }
  };

  const initializePaymentSheet = async () => {
    if (!clientSecret) return;

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Ryde Inc.",
      customerId: customerId!,
      paymentIntentClientSecret: clientSecret,
      returnURL: "myapp://book-ride",
    });

    if (error) {
      console.error("Payment sheet init error:", error);
      Alert.alert("Error", error.message);
    }
  };

  const openPaymentSheet = async () => {
    if (!clientSecret) {
      Alert.alert("Payment not ready", "Please try again later.");
      return;
    }
      
    const { error } = await presentPaymentSheet();
     
    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      await topUpWallet();
      setSuccess(true);
    }
  };

  const topUpWallet = async () => {
    try {
      const res = await fetch("/(api)/wallet/topup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: parseInt(amount),
        }),
      });

      if (res.ok) {
         fetchWallet();
        fetchWalletHistory();
        setAmount("");
      } else {
        Alert.alert("Error", "Failed to top up wallet.");
      }
    } catch (err) {
      console.error("Top-up error:", err);
      Alert.alert("Error", "An error occurred while updating your wallet.");
    }
  };

  const handleTopUp = async () => {
    if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {

      await fetchPaymentSheetParams();
   
      await initializePaymentSheet();
    
      await openPaymentSheet();
    } catch (err) {
      console.error("Top-up flow error:", err);
      Alert.alert("Error", "Could not complete payment.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWallet();
    fetchWalletHistory();
  }, []);

  return (
    <View className="px-5 mt-5">
      <Text className="text-xl font-JakartaBold mb-2">Your Wallet</Text>
      {walletMoney === null ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text className="text-lg mb-4">Balance: ${walletMoney} USD</Text>
      )}

      <TextInput
        placeholder="Enter amount to top up (USD)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        className="border border-gray-300 px-4 py-2 rounded-lg mb-3 bg-white"
      />

      <CustomButton title="Top Up Wallet" onPress={handleTopUp} disabled={loading} />
      <Text className="text-lg font-JakartaSemiBold mt-6 mb-2">Wallet History</Text>
      {history.length === 0 ? (
        <Text className="text-sm text-gray-500">No history available</Text>
      ) : (
        history.map((item, index) => (
          <WalletHistoryCard
            key={index}
            changeAmount={item.change_amount}
            changedAt={item.changed_at}
          />
        ))
      )}
      <ReactNativeModal isVisible={success} onBackdropPress={() => setSuccess(false)}>
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />
          <Text className="text-2xl text-center font-JakartaBold mt-5">Top-up successful!</Text>
          <Text className="text-md text-general-200 font-JakartaMedium text-center mt-3">
            Funds have been added to your wallet.
          </Text>
          <CustomButton
            title="Close"
            onPress={() => setSuccess(false)}
            className="mt-5"
          />

        </View>
      </ReactNativeModal>
    </View>
  );
};

export default WalletView;
