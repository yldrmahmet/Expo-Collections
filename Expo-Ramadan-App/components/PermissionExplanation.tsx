import { View, Text, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface PermissionExplanationProps {
  visible: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  benefit: string;
  onAllow: () => void;
  onCancel: () => void;
  allowText?: string;
  cancelText?: string;
}

export function PermissionExplanation({
  visible,
  icon,
  title,
  description,
  benefit,
  onAllow,
  onCancel,
  allowText = 'İzin Ver',
  cancelText = 'Daha Sonra',
}: PermissionExplanationProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
          {/* Icon Header */}
          <View className="bg-primary/10 py-8 items-center">
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center">
              <Ionicons name={icon} size={40} color="#2E7D32" />
            </View>
          </View>

          {/* Content */}
          <View className="p-6">
            <Text
              className="text-2xl font-bold text-text-primary text-center mb-3"
              accessible={true}
              accessibilityRole="header"
            >
              {title}
            </Text>

            <Text className="text-base text-text-secondary text-center mb-4 leading-6">
              {description}
            </Text>

            <View className="flex-row items-start gap-2 bg-primary/5 p-3 rounded-lg mb-6">
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              <Text className="flex-1 text-base text-text-primary">
                {benefit}
              </Text>
            </View>

            {/* Buttons */}
            <Pressable
              onPress={onAllow}
              className="bg-primary py-4 rounded-xl mb-3 active:opacity-80"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={allowText}
            >
              <Text className="text-lg font-bold text-white text-center">
                {allowText}
              </Text>
            </Pressable>

            <Pressable
              onPress={onCancel}
              className="py-4 active:opacity-60"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
            >
              <Text className="text-base text-text-secondary text-center">
                {cancelText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
