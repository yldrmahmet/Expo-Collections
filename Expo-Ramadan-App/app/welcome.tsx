import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useCityContext } from '../context';
import { CityPicker, PermissionExplanation, Loading } from '../components';
import { useTheme } from '../hooks';

/**
 * Hoşgeldin Ekranı
 * Şehir seçimi yapılmadan gösterilir, tab bar YOK
 * Şehir seçildiğinde tabs'a yönlendirir
 */
export default function WelcomeScreen() {
  const {
    city,
    showCityPicker,
    isDetecting,
    openCityPicker,
    closeCityPicker,
    selectCity,
    detectLocation,
  } = useCityContext();
  const { colors } = useTheme();

  // Şehir seçildiğinde tabs'a yönlendir
  useEffect(() => {
    if (city) {
      router.replace('/(tabs)');
    }
  }, [city]);

  const [showLocationPermission, setShowLocationPermission] = useState(false);

  const handleDetectLocation = async () => {
    setShowLocationPermission(false);
    await detectLocation();
  };

  // GPS konum tespiti yapılıyor
  if (isDetecting) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <Loading message="Konumunuz tespit ediliyor..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 justify-center items-center p-8">
        <Ionicons name="location" size={64} color={colors.primary} />
        <Text className="text-3xl font-bold text-text-primary mt-6 mb-2">
          Hoş Geldiniz
        </Text>
        <Text className="text-lg text-text-secondary text-center mb-8 leading-7">
          Namaz vakitlerini görebilmek için şehrinizi seçin
        </Text>
        <Pressable
          className="flex-row items-center justify-center gap-2 bg-primary py-4 px-8 rounded-button min-h-touch-comfortable min-w-[200px] active:opacity-80"
          onPress={() => setShowLocationPermission(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Konumumu Tespit Et"
          accessibilityHint="GPS ile şehrinizi otomatik tespit eder"
        >
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
          <Text className="text-lg font-semibold text-text-on-primary">
            Konumumu Tespit Et
          </Text>
        </Pressable>
        <Pressable
          className="mt-4 py-4 px-8 min-h-touch-min active:opacity-60"
          onPress={openCityPicker}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Manuel Seç"
          accessibilityHint="Şehir listesinden manuel seçim yapın"
        >
          <Text className="text-lg text-primary font-medium">Manuel Seç</Text>
        </Pressable>
      </View>

      {/* Konum İzni Açıklama Modal */}
      <PermissionExplanation
        visible={showLocationPermission}
        icon="location"
        title="Konum İzni Gerekli"
        description="Bulunduğunuz şehri otomatik tespit etmek için konum bilginize ihtiyacımız var."
        benefit="Şehrinize özel namaz vakitlerini görebilirsiniz"
        onAllow={handleDetectLocation}
        onCancel={() => setShowLocationPermission(false)}
      />

      {/* Şehir Seçici Modal */}
      <CityPicker
        visible={showCityPicker}
        selectedCity=""
        onSelect={selectCity}
        onClose={closeCityPicker}
      />
    </SafeAreaView>
  );
}
