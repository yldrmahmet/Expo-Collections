import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showLocationButton?: boolean;
  locationName?: string;
  onLocationPress?: () => void;
}

export function Header({
  title,
  subtitle,
  showLocationButton = false,
  locationName,
  onLocationPress,
}: HeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-divider">
      <View className="flex-1">
        <Text
          className="text-xl font-bold text-text-primary"
          accessible={true}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-base text-text-secondary mt-1" accessible={true}>
            {subtitle}
          </Text>
        )}
      </View>

      {showLocationButton && locationName && (
        <Pressable
          onPress={onLocationPress}
          className="flex-row items-center bg-surface px-4 py-2 rounded-full min-h-touch-min gap-1 active:bg-divider"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Şehir: ${locationName}. Değiştirmek için dokunun`}
          accessibilityHint="Şehir seçim ekranını açar"
        >
          <Ionicons
            name="location"
            size={20}
            color="#2E7D32"
            accessibilityElementsHidden={true}
          />
          <Text className="text-base text-text-primary font-medium">{locationName}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color="#424242"
            accessibilityElementsHidden={true}
          />
        </Pressable>
      )}
    </View>
  );
}
