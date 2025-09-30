// components/WalletHistoryCard.tsx
import { View, Text } from "react-native";

const WalletHistoryCard = ({
  changeAmount,
  changedAt,
}: {
  changeAmount: number;
  changedAt: string;
}) => {
  const isPositive = changeAmount > 0;

  return (
    <View className="bg-white px-4 py-3 rounded-lg mb-2 shadow-sm border border-gray-200">
      <Text className="text-sm text-gray-400">{new Date(changedAt).toLocaleString()}</Text>
      <Text
        className={`text-lg font-JakartaBold ${isPositive ? "text-green-600" : "text-red-600"}`}
      >
        {isPositive ? "+" : ""}
        {changeAmount} USD
      </Text>
    </View>
  );
};

export default WalletHistoryCard;
