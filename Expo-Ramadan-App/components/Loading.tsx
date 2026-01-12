import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Yükleniyor...' }: LoadingProps) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 justify-center items-center p-8 bg-background"
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size={80} color={colors.primary} />
      <Text className="mt-6 text-2xl text-text-secondary text-center">{message}</Text>
    </View>
  );
}
