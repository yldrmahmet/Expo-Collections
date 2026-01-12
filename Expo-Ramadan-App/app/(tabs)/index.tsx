import { useRef, useEffect, useState } from 'react';
import { View, FlatList, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useCityContext } from '../../context';
import { usePrayerTimes, useMonthNavigation, useTheme, DayPrayers } from '../../hooks';
import {
  Loading,
  ErrorMessage,
  PrayerTimeCard,
  CityPicker,
  BannerAd,
} from '../../components';

type ViewMode = 'simple' | 'detailed';

/**
 * Ana Sayfa - Namaz Vakitleri Takvimi
 * Aylık namaz vakitlerini listeler
 */
export default function HomeScreen() {
  // Şehir yönetimi (Context'ten)
  const {
    city,
    showCityPicker,
    openCityPicker,
    closeCityPicker,
    selectCity,
  } = useCityContext();

  // Tema
  const { colors } = useTheme();

  // Ay navigasyonu
  const {
    selectedMonth,
    isCurrentMonth,
    displayText,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useMonthNavigation();

  // Namaz vakitleri
  const { monthlyPrayers, loading, error, refetch } = usePrayerTimes(city, selectedMonth);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const flatListRef = useRef<FlatList<DayPrayers>>(null);

  // Bugüne scroll yap
  const todayIndex = monthlyPrayers.findIndex((day) => day.isToday);

  useEffect(() => {
    if (isCurrentMonth && todayIndex > 0 && flatListRef.current) {
      const scrollIndex = Math.max(0, todayIndex - 1);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: scrollIndex,
          animated: false,
        });
      }, 100);
    } else if (!isCurrentMonth && flatListRef.current) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [todayIndex, city, isCurrentMonth, selectedMonth]);

  // Yükleniyor
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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

  const onScrollToIndexFailed = (info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Şehir Seçici Header */}
      <Pressable
        onPress={openCityPicker}
        className="flex-row items-center justify-center gap-2 py-3 bg-surface border-b border-divider active:opacity-70"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Şehir: ${city}. Değiştirmek için dokunun`}
      >
        <Ionicons name="location" size={20} color={colors.primary} />
        <Text className="text-lg font-semibold text-text-primary">{city}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      {/* Ay Navigasyonu */}
      <View className="flex-row items-center justify-between bg-background border-b border-divider px-4 py-3">
        <Pressable
          onPress={goToPreviousMonth}
          className="items-center justify-center min-h-touch-min min-w-touch-min rounded-full bg-surface active:opacity-70"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Önceki ay"
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </Pressable>

        {/* Ay/Yıl + Bugüne Dön */}
        <View className="flex-row items-center gap-3">
          <Text className="text-xl font-bold text-text-primary">{displayText}</Text>
          {!isCurrentMonth && (
            <Pressable
              onPress={goToToday}
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-primary active:bg-primary/80"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Bugüne dön"
            >
              <Ionicons name="return-down-back" size={14} color="#FFFFFF" />
              <Text className="text-sm font-medium text-white">Bugün</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={goToNextMonth}
          className="items-center justify-center min-h-touch-min min-w-touch-min rounded-full bg-surface active:opacity-70"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Sonraki ay"
        >
          <Ionicons name="chevron-forward" size={28} color={colors.primary} />
        </Pressable>
      </View>

      {/* Görünüm Modu Seçici */}
      <View className="flex-row p-4 gap-2 bg-surface border-b border-divider">
        <Pressable
          onPress={() => setViewMode('simple')}
          className={`flex-1 flex-row items-center justify-center gap-1 py-2 px-4 rounded-full min-h-touch-min border ${
            viewMode === 'simple'
              ? 'bg-primary border-primary'
              : 'bg-surface-elevated border-primary'
          }`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Basit görünüm"
          accessibilityState={{ selected: viewMode === 'simple' }}
        >
          <Ionicons
            name="list"
            size={20}
            color={viewMode === 'simple' ? '#FFFFFF' : colors.primary}
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
              : 'bg-surface-elevated border-primary'
          }`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Detaylı görünüm"
          accessibilityState={{ selected: viewMode === 'detailed' }}
        >
          <Ionicons
            name="grid"
            size={20}
            color={viewMode === 'detailed' ? '#FFFFFF' : colors.primary}
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

      {/* Namaz Vakitleri Listesi */}
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

      {/* Banner Ad - Tab bar üstünde */}
      <BannerAd />

      {/* Şehir Seçici Modal */}
      <CityPicker
        visible={showCityPicker}
        selectedCity={city}
        onSelect={selectCity}
        onClose={closeCityPicker}
      />
    </SafeAreaView>
  );
}
