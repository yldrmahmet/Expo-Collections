import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Yükleniyor...' }: LoadingProps) {
  return (
    <View
      className="flex-1 justify-center items-center p-8 bg-white"
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text className="mt-4 text-lg text-text-secondary text-center">{message}</Text>
    </View>
  );
}
