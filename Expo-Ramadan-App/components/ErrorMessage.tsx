import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View
      className="flex-1 justify-center items-center p-8 bg-white"
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-6">
        <Ionicons
          name="alert-circle"
          size={48}
          color="#D32F2F"
          accessibilityElementsHidden={true}
        />
      </View>

      <Text className="text-xl font-bold text-text-primary mb-2 text-center">
        Bir Hata Oluştu
      </Text>
      <Text className="text-lg text-text-secondary text-center leading-7">
        {message}
      </Text>

      {onRetry && (
        <View className="mt-8 w-full max-w-[200px]">
          <Button
            label="Tekrar Dene"
            onPress={onRetry}
            variant="primary"
            accessibilityHint="Verileri yeniden yüklemeyi dener"
          />
        </View>
      )}
    </View>
  );
}
