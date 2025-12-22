import { useMemo } from 'react';
import { Modal, View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCityNames } from '../constants/CityCoordinates';
import { useTheme } from '../hooks';

interface CityPickerProps {
  visible: boolean;
  selectedCity: string;
  onSelect: (city: string) => void;
  onClose: () => void;
}

export function CityPicker({ visible, selectedCity, onSelect, onClose }: CityPickerProps) {
  const cities = useMemo(() => getCityNames(), []);
  const { isDark } = useTheme();

  // Tema bazlı renkler
  const colors = {
    primary: isDark ? '#4CAF50' : '#2E7D32',
    text: isDark ? '#E8E8E8' : '#1A1A1A',
  };

  const renderCity = ({ item }: { item: string }) => {
    const isSelected = item === selectedCity;

    return (
      <Pressable
        onPress={() => onSelect(item)}
        className={`flex-row justify-between items-center px-4 py-4 min-h-touch-comfortable border-b border-divider ${
          isSelected ? 'bg-today-bg' : ''
        } active:bg-surface`}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item}${isSelected ? ', seçili' : ''}`}
        accessibilityHint="Bu şehri seçmek için dokunun"
        accessibilityState={{ selected: isSelected }}
      >
        <Text
          className={`text-lg ${
            isSelected ? 'font-bold text-primary' : 'text-text-primary'
          }`}
        >
          {item}
        </Text>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={colors.primary}
            accessibilityElementsHidden={true}
          />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-4 border-b border-divider">
          <Text
            className="text-xl font-bold text-text-primary"
            accessible={true}
            accessibilityRole="header"
          >
            Şehir Seçin
          </Text>
          <Pressable
            onPress={onClose}
            className="flex-row items-center p-2 rounded min-h-touch-min gap-1 active:bg-surface"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            accessibilityHint="Şehir seçimini kapatır"
          >
            <Ionicons name="close" size={28} color={colors.text} />
            <Text className="text-base text-text-primary font-medium">Kapat</Text>
          </Pressable>
        </View>

        {/* Açıklama */}
        <Text className="text-base text-text-secondary px-4 py-4 bg-surface">
          Namaz vakitlerini görmek istediğiniz şehri seçin
        </Text>

        {/* Şehir Listesi */}
        <FlatList
          data={cities}
          renderItem={renderCity}
          keyExtractor={(item) => item}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={true}
          accessibilityLabel="Şehir listesi"
          accessibilityRole="list"
        />
      </SafeAreaView>
    </Modal>
  );
}
