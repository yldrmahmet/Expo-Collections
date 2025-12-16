import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DayPrayers } from '../hooks';

interface PrayerTimeCardProps {
  day: DayPrayers;
  showAllPrayers?: boolean;
}

export function PrayerTimeCard({ day, showAllPrayers = false }: PrayerTimeCardProps) {
  // Sahur (İmsak) ve İftar (Akşam) vakitlerini bul
  const sahurTime = day.prayers.find((p) => p.nameEnglish === 'Fajr')?.time || '';
  const iftarTime = day.prayers.find((p) => p.nameEnglish === 'Maghrib')?.time || '';

  const accessibilityLabel = day.isToday
    ? `Bugün, ${day.date}, ${day.hijriDate}. Sahur ${sahurTime}, İftar ${iftarTime}`
    : `${day.weekday}, ${day.date}, ${day.hijriDate}. Sahur ${sahurTime}, İftar ${iftarTime}`;

  // Basit görünüm - Sadece Sahur ve İftar, büyük ve ikonlu
  if (!showAllPrayers) {
    return (
      <View
        className={`flex-row mx-4 my-2 min-h-[120px] rounded-card overflow-hidden bg-surface-elevated shadow-md ${
          day.isToday ? 'border-[3px] border-primary bg-today-bg shadow-lg' : ''
        }`}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}
      >
        {/* Tarih Bölümü */}
        <View
          className={`w-[110px] p-4 justify-center items-center ${
            day.isToday ? 'bg-primary' : 'bg-surface'
          }`}
        >
          <Text
            className={`text-base font-bold uppercase tracking-wide ${
              day.isToday ? 'text-text-on-primary' : 'text-text-secondary'
            }`}
          >
            {day.isToday ? 'BUGÜN' : day.weekday}
          </Text>
          <Text
            className={`text-lg font-bold mt-1 ${
              day.isToday ? 'text-text-on-primary' : 'text-text-primary'
            }`}
          >
            {day.date}
          </Text>
          <Text
            className={`text-base mt-1 text-center ${
              day.isToday ? 'text-white/80' : 'text-text-secondary'
            }`}
          >
            {day.hijriDate}
          </Text>
        </View>

        {/* Sahur ve İftar Bölümü */}
        <View className="flex-1 flex-row items-center justify-evenly py-4 px-2">
          {/* Sahur */}
          <View className="items-center justify-center flex-1">
            <View
              className={`w-12 h-12 rounded-full justify-center items-center mb-1 ${
                day.isToday ? 'bg-primary/15' : 'bg-surface'
              }`}
            >
              <MaterialCommunityIcons
                name="weather-night"
                size={28}
                color={day.isToday ? '#1B5E20' : '#2E7D32'}
              />
            </View>
            <Text
              className={`text-base font-semibold mb-1 ${
                day.isToday ? 'text-primary-dark' : 'text-text-secondary'
              }`}
            >
              Sahur Bitiş
            </Text>
            <Text
              className={`font-bold ${
                day.isToday ? 'text-3xl text-primary-dark' : 'text-2xl text-primary'
              }`}
            >
              {sahurTime}
            </Text>
          </View>

          {/* Ayırıcı */}
          <View className="w-[1px] h-[60%] bg-divider" />

          {/* İftar */}
          <View className="items-center justify-center flex-1">
            <View
              className={`w-12 h-12 rounded-full justify-center items-center mb-1 ${
                day.isToday ? 'bg-primary/15' : 'bg-surface'
              }`}
            >
              <MaterialCommunityIcons
                name="weather-sunset-down"
                size={28}
                color={day.isToday ? '#1B5E20' : '#2E7D32'}
              />
            </View>
            <Text
              className={`text-base font-semibold mb-1 ${
                day.isToday ? 'text-primary-dark' : 'text-text-secondary'
              }`}
            >
              İftar
            </Text>
            <Text
              className={`font-bold ${
                day.isToday ? 'text-3xl text-primary-dark' : 'text-2xl text-primary'
              }`}
            >
              {iftarTime}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Detaylı görünüm - Tüm vakitler
  return (
    <View
      className={`flex-row mx-4 my-1 rounded-card overflow-hidden bg-surface-elevated shadow-sm ${
        day.isToday ? 'border-2 border-primary bg-today-bg shadow-md' : ''
      }`}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Tarih Bölümü */}
      <View
        className={`w-[100px] p-4 justify-center items-center ${
          day.isToday ? 'bg-primary' : 'bg-surface'
        }`}
      >
        <Text
          className={`text-base font-semibold uppercase ${
            day.isToday ? 'text-text-on-primary' : 'text-text-secondary'
          }`}
        >
          {day.isToday ? 'BUGÜN' : day.weekday}
        </Text>
        <Text
          className={`text-lg font-bold mt-1 ${
            day.isToday ? 'text-text-on-primary' : 'text-text-primary'
          }`}
        >
          {day.date}
        </Text>
        <Text
          className={`text-sm mt-1 ${
            day.isToday ? 'text-white/80' : 'text-text-secondary'
          }`}
        >
          {day.hijriDate}
        </Text>
      </View>

      {/* Vakit Bölümü */}
      <View className="flex-1 flex-row flex-wrap p-4 justify-around items-center">
        {day.prayers.map((prayer) => (
          <View key={prayer.nameEnglish} className="items-center min-w-[55px] px-1 py-1">
            <Text
              className={`text-base mb-1 ${
                day.isToday ? 'text-primary-dark' : 'text-text-secondary'
              }`}
            >
              {prayer.name}
            </Text>
            <Text
              className={`text-lg font-bold ${
                day.isToday ? 'text-primary-dark' : 'text-primary'
              }`}
            >
              {prayer.time}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
