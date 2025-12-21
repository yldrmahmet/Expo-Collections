import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { useCityContext } from '../../context';
import { useNotifications } from '../../hooks';
import { PermissionExplanation, BannerAd } from '../../components';
import { PRAYER_OPTIONS } from '../../constants';
import type { NotificationSettings } from '../../hooks';

/**
 * Ayarlar Sayfası
 * Bildirim ayarları ve uygulama bilgilerini gösterir
 */
// Test için namaz listesi (güneş hariç)
const TEST_PRAYERS = [
  { key: 'fajr', label: 'Sabah', emoji: '🌙' },
  { key: 'dhuhr', label: 'Öğle', emoji: '☀️' },
  { key: 'asr', label: 'İkindi', emoji: '🌤️' },
  { key: 'maghrib', label: 'Akşam', emoji: '🌅' },
  { key: 'isha', label: 'Yatsı', emoji: '🌙' },
];

export default function SettingsScreen() {
  const { city } = useCityContext();
  const {
    settings,
    toggleNotifications,
    togglePrayer,
    toggleNotificationTiming,
    sendTestNotification,
  } = useNotifications(city);

  const [showNotificationPermission, setShowNotificationPermission] = useState(false);

  // Bildirim toggle - önce açıklama göster
  const handleToggleNotifications = () => {
    if (!settings.enabled) {
      setShowNotificationPermission(true);
    } else {
      toggleNotifications();
    }
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
        {/* Bildirim Ayarları Bölümü */}
        <View>
          <Text className="text-base font-semibold text-text-secondary px-4 mb-2">
            BİLDİRİMLER
          </Text>

          <View className="bg-surface mx-4 rounded-xl overflow-hidden">
            {/* Ana Bildirim Toggle */}
            <View className="flex-row items-center justify-between p-4 border-b border-divider">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Ionicons name="notifications" size={22} color="#2E7D32" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-text-primary">
                    Namaz Vakti Bildirimleri
                  </Text>
                  <Text className="text-sm text-text-secondary mt-0.5">
                    {settings.enabled ? 'Açık' : 'Kapalı'}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                thumbColor={settings.enabled ? '#2E7D32' : '#BDBDBD'}
                accessible={true}
                accessibilityLabel="Bildirimleri aç/kapat"
                accessibilityRole="switch"
              />
            </View>

            {/* Bildirim Zamanlaması - Sadece bildirimler açıksa göster */}
            {settings.enabled && (
              <View className="border-b border-divider">
                <Text className="text-sm font-medium text-text-secondary px-4 pt-4 pb-2">
                  Ne zaman bildirim alayım?
                </Text>

                {/* Ezan Vakti Toggle */}
                <Pressable
                  onPress={() => toggleNotificationTiming('notifyAtPrayerTime')}
                  className="flex-row items-center justify-between px-4 py-3 active:bg-gray-100"
                  accessible={true}
                  accessibilityRole="switch"
                  accessibilityLabel="Ezan vaktinde bildirim"
                  accessibilityState={{ checked: settings.notifyAtPrayerTime }}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="time" size={24} color="#2E7D32" />
                    <View>
                      <Text className="text-base text-text-primary">Ezan Vaktinde</Text>
                      <Text className="text-xs text-text-secondary">Ezan sesi ile bildirim</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.notifyAtPrayerTime}
                    onValueChange={() => toggleNotificationTiming('notifyAtPrayerTime')}
                    trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                    thumbColor={settings.notifyAtPrayerTime ? '#2E7D32' : '#BDBDBD'}
                  />
                </Pressable>

                {/* 5 Dakika Önce Toggle */}
                <Pressable
                  onPress={() => toggleNotificationTiming('notifyBeforePrayer')}
                  className="flex-row items-center justify-between px-4 py-3 active:bg-gray-100"
                  accessible={true}
                  accessibilityRole="switch"
                  accessibilityLabel="5 dakika önce bildirim"
                  accessibilityState={{ checked: settings.notifyBeforePrayer }}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="alarm" size={24} color="#FF9800" />
                    <View>
                      <Text className="text-base text-text-primary">5 Dakika Önce</Text>
                      <Text className="text-xs text-text-secondary">Hatırlatma sesi ile bildirim</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.notifyBeforePrayer}
                    onValueChange={() => toggleNotificationTiming('notifyBeforePrayer')}
                    trackColor={{ false: '#E0E0E0', true: '#FFB74D' }}
                    thumbColor={settings.notifyBeforePrayer ? '#FF9800' : '#BDBDBD'}
                  />
                </Pressable>
              </View>
            )}

            {/* Vakit Seçenekleri - Sadece bildirimler açıksa göster */}
            {settings.enabled && (
              <View className="py-2">
                <Text className="text-sm font-medium text-text-secondary px-4 pt-2 pb-2">
                  Hangi vakitlerde?
                </Text>
                {PRAYER_OPTIONS.map((prayer) => {
                  const prayerKey = prayer.key as keyof NotificationSettings;
                  const isEnabled = settings[prayerKey] as boolean;

                  return (
                    <Pressable
                      key={prayer.key}
                      onPress={() => togglePrayer(prayerKey)}
                      className="flex-row items-center justify-between px-4 py-3 active:bg-gray-100"
                      accessible={true}
                      accessibilityRole="switch"
                      accessibilityLabel={`${prayer.label} bildirimi`}
                      accessibilityState={{ checked: isEnabled }}
                    >
                      <View className="flex-row items-center gap-3">
                        <Text className="text-2xl">{prayer.emoji}</Text>
                        <Text className="text-base text-text-primary">
                          {prayer.label}
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center ${
                          isEnabled ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      >
                        {isEnabled && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Test Bildirimi Butonları */}
          {settings.enabled && (
            <View className="mx-4 mt-4">
              <Text className="text-sm font-medium text-text-secondary mb-2">
                Test Bildirimleri
              </Text>

              <View className="bg-surface rounded-xl overflow-hidden">
                {TEST_PRAYERS.map((prayer, index) => (
                  <View
                    key={prayer.key}
                    className={`flex-row items-center justify-between p-3 ${
                      index < TEST_PRAYERS.length - 1 ? 'border-b border-divider' : ''
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg">{prayer.emoji}</Text>
                      <Text className="text-base text-text-primary">{prayer.label}</Text>
                    </View>

                    <View className="flex-row gap-2">
                      {/* Ezan Vakti Test */}
                      <Pressable
                        onPress={() => sendTestNotification(prayer.key, 'atTime')}
                        className="flex-row items-center gap-1 px-3 py-2 bg-primary/10 rounded-lg active:bg-primary/20"
                        accessible={true}
                        accessibilityLabel={`${prayer.label} ezan vakti testi`}
                      >
                        <Ionicons name="volume-high" size={16} color="#2E7D32" />
                        <Text className="text-sm font-medium text-primary">Ezan</Text>
                      </Pressable>

                      {/* 5 Dakika Önce Test */}
                      <Pressable
                        onPress={() => sendTestNotification(prayer.key, 'before')}
                        className="flex-row items-center gap-1 px-3 py-2 bg-orange-100 rounded-lg active:bg-orange-200"
                        accessible={true}
                        accessibilityLabel={`${prayer.label} 5 dakika önce testi`}
                      >
                        <Ionicons name="alarm" size={16} color="#FF9800" />
                        <Text className="text-sm font-medium text-[#FF9800]">5dk</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Uygulama Bilgisi Bölümü */}
        <View className="mt-8">
          <Text className="text-base font-semibold text-text-secondary px-4 mb-2">
            UYGULAMA
          </Text>

          <View className="bg-surface mx-4 rounded-xl overflow-hidden">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Ionicons name="information-circle" size={22} color="#2E7D32" />
                </View>
                <Text className="text-base text-text-primary">Versiyon</Text>
              </View>
              <Text className="text-base text-text-secondary">{appVersion}</Text>
            </View>
          </View>
        </View>

        {/* Alt Bilgi */}
        <View className="mt-8 px-4 items-center">
          <Text className="text-sm text-text-secondary text-center">
            İftar Vakti - İmsakiye 2026
          </Text>
          <Text className="text-xs text-text-secondary text-center mt-1">
            Namaz vakitleri Diyanet hesaplama yöntemiyle hesaplanmaktadır
          </Text>
        </View>
      </ScrollView>

      {/* Banner Ad - Tab bar üstünde */}
      <BannerAd />

      {/* Bildirim İzni Açıklama Modal */}
      <PermissionExplanation
        visible={showNotificationPermission}
        icon="notifications"
        title="Bildirim İzni Gerekli"
        description="Namaz vakitlerinde sizi uyarabilmemiz için bildirim iznine ihtiyacımız var."
        benefit="Hiçbir namaz vaktini kaçırmazsınız"
        onAllow={() => {
          setShowNotificationPermission(false);
          toggleNotifications();
        }}
        onCancel={() => setShowNotificationPermission(false)}
      />
    </SafeAreaView>
  );
}
