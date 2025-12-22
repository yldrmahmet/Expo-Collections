import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Yükleniyor...' }: LoadingProps) {
  const { isDark } = useTheme();
  const primaryColor = isDark ? '#4CAF50' : '#2E7D32';

  return (
    <View
      className="flex-1 justify-center items-center p-8 bg-background"
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size={80} color={primaryColor} />
      <Text className="mt-6 text-2xl text-text-secondary text-center">{message}</Text>
    </View>
  );
}
