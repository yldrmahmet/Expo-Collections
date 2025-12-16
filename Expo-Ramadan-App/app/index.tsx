import { useState } from 'react';
import { View, FlatList, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { usePrayerTimes, useCity, DayPrayers } from '../hooks';
import { Header, Loading, ErrorMessage, PrayerTimeCard, CityPicker } from '../components';

type ViewMode = 'simple' | 'detailed';

export default function CalendarScreen() {
  const {
    city,
    showCityPicker,
    isDetecting,
    openCityPicker,
    closeCityPicker,
    selectCity,
    detectLocation,
  } = useCity();
  const { monthlyPrayers, loading, error, refetch } = usePrayerTimes(city);
  const [viewMode, setViewMode] = useState<ViewMode>('simple');

  // GPS konum tespiti yapılıyor
  if (isDetecting) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <Loading message="Konumunuz tespit ediliyor..." />
      </SafeAreaView>
    );
  }

  // Şehir seçilmemiş - modal göster
  if (!city) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="location" size={64} color="#2E7D32" />
          <Text className="text-3xl font-bold text-text-primary mt-6 mb-2">
            Hoş Geldiniz
          </Text>
          <Text className="text-lg text-text-secondary text-center mb-8 leading-7">
            Namaz vakitlerini görebilmek için şehrinizi seçin
          </Text>
          <Pressable
            className="flex-row items-center justify-center gap-2 bg-primary py-4 px-8 rounded-button min-h-touch-comfortable min-w-[200px] active:opacity-80"
            onPress={detectLocation}
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
        <CityPicker
          visible={showCityPicker}
          selectedCity={city}
          onSelect={selectCity}
          onClose={closeCityPicker}
        />
      </SafeAreaView>
    );
  }

  // Namaz vakitleri yükleniyor
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <Header
          title="Namaz Vakitleri"
          subtitle="Aylık Takvim"
          showLocationButton
          locationName={city}
          onLocationPress={openCityPicker}
        />
        <Loading message="Namaz vakitleri hesaplanıyor..." />
        <CityPicker
          visible={showCityPicker}
          selectedCity={city}
          onSelect={selectCity}
          onClose={closeCityPicker}
        />
      </SafeAreaView>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <Header
          title="Namaz Vakitleri"
          subtitle="Aylık Takvim"
          showLocationButton
          locationName={city}
          onLocationPress={openCityPicker}
        />
        <ErrorMessage message={error} onRetry={refetch} />
        <CityPicker
          visible={showCityPicker}
          selectedCity={city}
          onSelect={selectCity}
          onClose={closeCityPicker}
        />
      </SafeAreaView>
    );
  }

  const renderDay = ({ item }: { item: DayPrayers }) => (
    <PrayerTimeCard day={item} showAllPrayers={viewMode === 'detailed'} />
  );

  const getItemLayout = (_: unknown, index: number) => ({
    length: 88,
    offset: 88 * index,
    index,
  });

  // Bugünün index'ini bul
  const todayIndex = monthlyPrayers.findIndex((day) => day.isToday);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <Header
        title="Namaz Vakitleri"
        subtitle="Aylık Takvim"
        showLocationButton
        locationName={city}
        onLocationPress={openCityPicker}
      />

      {/* View Mode Toggle */}
      <View className="flex-row p-4 gap-2 bg-surface border-b border-divider">
        <Pressable
          onPress={() => setViewMode('simple')}
          className={`flex-1 flex-row items-center justify-center gap-1 py-2 px-4 rounded-full min-h-touch-min border ${
            viewMode === 'simple'
              ? 'bg-primary border-primary'
              : 'bg-white border-primary'
          }`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Basit görünüm"
          accessibilityHint="Sadece imsak ve iftar vakitlerini gösterir"
          accessibilityState={{ selected: viewMode === 'simple' }}
        >
          <Ionicons
            name="list"
            size={20}
            color={viewMode === 'simple' ? '#FFFFFF' : '#2E7D32'}
            accessibilityElementsHidden={true}
          />
          <Text
            className={`text-base font-semibold ${
              viewMode === 'simple' ? 'text-text-on-primary' : 'text-primary'
            }`}
          >
            Basit
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('detailed')}
          className={`flex-1 flex-row items-center justify-center gap-1 py-2 px-4 rounded-full min-h-touch-min border ${
            viewMode === 'detailed'
              ? 'bg-primary border-primary'
              : 'bg-white border-primary'
          }`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Detaylı görünüm"
          accessibilityHint="Tüm namaz vakitlerini gösterir"
          accessibilityState={{ selected: viewMode === 'detailed' }}
        >
          <Ionicons
            name="grid"
            size={20}
            color={viewMode === 'detailed' ? '#FFFFFF' : '#2E7D32'}
            accessibilityElementsHidden={true}
          />
          <Text
            className={`text-base font-semibold ${
              viewMode === 'detailed' ? 'text-text-on-primary' : 'text-primary'
            }`}
          >
            Detaylı
          </Text>
        </Pressable>
      </View>

      {/* Prayer Times List */}
      <FlatList
        data={monthlyPrayers}
        renderItem={renderDay}
        keyExtractor={(item) => item.date}
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={true}
        initialScrollIndex={todayIndex > 0 ? todayIndex : 0}
        getItemLayout={getItemLayout}
        accessible={true}
        accessibilityLabel="Aylık namaz vakitleri listesi"
        accessibilityRole="list"
      />

      {/* City Picker Modal */}
      <CityPicker
        visible={showCityPicker}
        selectedCity={city}
        onSelect={selectCity}
        onClose={closeCityPicker}
      />
    </SafeAreaView>
  );
}
