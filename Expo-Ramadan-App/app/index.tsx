import { useState, useRef, useEffect } from 'react';
import { View, FlatList, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { usePrayerTimes, useCity, DayPrayers, MonthYear } from '../hooks';
import { Header, Loading, ErrorMessage, PrayerTimeCard, CityPicker } from '../components';

type ViewMode = 'simple' | 'detailed';

// Türkçe ay isimleri
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

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

  // Ay seçimi state'i
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<MonthYear>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const { monthlyPrayers, loading, error, refetch } = usePrayerTimes(city, selectedMonth);
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const flatListRef = useRef<FlatList<DayPrayers>>(null);

  // Şu anki ay mı kontrol et
  const isCurrentMonth =
    selectedMonth.year === today.getFullYear() &&
    selectedMonth.month === today.getMonth();

  // Önceki aya git
  const goToPreviousMonth = () => {
    setSelectedMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  // Sonraki aya git
  const goToNextMonth = () => {
    setSelectedMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  // Bugüne dön
  const goToToday = () => {
    setSelectedMonth({
      year: today.getFullYear(),
      month: today.getMonth(),
    });
  };

  // Bugüne scroll yap
  const todayIndex = monthlyPrayers.findIndex((day) => day.isToday);

  useEffect(() => {
    // Sadece şu anki ayda ve bugün varsa scroll yap
    if (isCurrentMonth && todayIndex > 0 && flatListRef.current) {
      // Liste renderdan sonra scroll yap
      // Dün'e scroll yap ki bugün ortada görünsün (1 gün üstte, 1 gün altta)
      const scrollIndex = Math.max(0, todayIndex - 1);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: scrollIndex,
          animated: false,
        });
      }, 100);
    } else if (!isCurrentMonth && flatListRef.current) {
      // Başka aylarda en üste scroll yap
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [todayIndex, city, isCurrentMonth, selectedMonth]);

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

  // Scroll hatası durumunda fallback
  const onScrollToIndexFailed = (info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <Header
        title="Namaz Vakitleri"
        subtitle={`${MONTHS_TR[selectedMonth.month]} ${selectedMonth.year}`}
        showLocationButton
        locationName={city}
        onLocationPress={openCityPicker}
      />

      {/* Month Navigation */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-surface border-b border-divider">
        <Pressable
          onPress={goToPreviousMonth}
          className="flex-row items-center justify-center min-h-touch-min min-w-touch-min rounded-full bg-white border border-divider active:bg-gray-100"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Önceki ay"
        >
          <Ionicons name="chevron-back" size={24} color="#2E7D32" />
        </Pressable>

        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-text-primary">
            {MONTHS_TR[selectedMonth.month]} {selectedMonth.year}
          </Text>
          {!isCurrentMonth && (
            <Pressable
              onPress={goToToday}
              className="px-3 py-1 bg-primary rounded-full active:opacity-80"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Bugüne dön"
            >
              <Text className="text-sm font-semibold text-white">Bugün</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={goToNextMonth}
          className="flex-row items-center justify-center min-h-touch-min min-w-touch-min rounded-full bg-white border border-divider active:bg-gray-100"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Sonraki ay"
        >
          <Ionicons name="chevron-forward" size={24} color="#2E7D32" />
        </Pressable>
      </View>

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
        ref={flatListRef}
        data={monthlyPrayers}
        renderItem={renderDay}
        keyExtractor={(item) => item.date}
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={true}
        onScrollToIndexFailed={onScrollToIndexFailed}
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
