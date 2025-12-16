import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import { getCityCoordinates } from '../constants/CityCoordinates';

// Storage key
const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

// Bildirim ayarları tipi
export interface NotificationSettings {
  enabled: boolean;
  fajr: boolean; // İmsak
  sunrise: boolean; // Güneş
  dhuhr: boolean; // Öğle
  asr: boolean; // İkindi
  maghrib: boolean; // Akşam (İftar)
  isha: boolean; // Yatsı
}

// Varsayılan ayarlar
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  fajr: true, // İmsak açık
  sunrise: false,
  dhuhr: true, // Öğle açık
  asr: true, // İkindi açık
  maghrib: true, // Akşam/İftar açık
  isha: true, // Yatsı açık
};

// Namaz isimleri
const PRAYER_NAMES: Record<string, string> = {
  fajr: 'İmsak',
  sunrise: 'Güneş',
  dhuhr: 'Öğle',
  asr: 'İkindi',
  maghrib: 'Akşam',
  isha: 'Yatsı',
};

// Notification handler ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Bildirim izni iste
 */
async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Bildirimler için fiziksel cihaz gerekli');
    return false;
  }

  // Android için kanal oluştur
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Namaz Vakitleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Tüm zamanlanmış bildirimleri iptal et
 */
async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Namaz vakitleri için bildirimleri zamanla
 */
async function schedulePrayerNotifications(
  city: string,
  settings: NotificationSettings
): Promise<void> {
  // Önce mevcut bildirimleri iptal et
  await cancelAllNotifications();

  if (!settings.enabled) return;

  const cityData = getCityCoordinates(city);
  if (!cityData) return;

  const coordinates = new Coordinates(cityData.latitude, cityData.longitude);
  const params = CalculationMethod.Turkey();

  // Önümüzdeki 7 gün için bildirimleri zamanla
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);

    const prayerTimes = new PrayerTimes(coordinates, date, params);

    // Her namaz vakti için bildirim zamanla
    const prayers = [
      { key: 'fajr', time: prayerTimes.fajr, emoji: '🌙' },
      { key: 'sunrise', time: prayerTimes.sunrise, emoji: '🌅' },
      { key: 'dhuhr', time: prayerTimes.dhuhr, emoji: '☀️' },
      { key: 'asr', time: prayerTimes.asr, emoji: '🌤️' },
      { key: 'maghrib', time: prayerTimes.maghrib, emoji: '🍽️' },
      { key: 'isha', time: prayerTimes.isha, emoji: '🌙' },
    ];

    for (const prayer of prayers) {
      const settingKey = prayer.key as keyof NotificationSettings;
      if (!settings[settingKey]) continue;

      // Geçmiş vakitleri atla
      if (prayer.time <= new Date()) continue;

      const prayerName = PRAYER_NAMES[prayer.key];
      const isIftar = prayer.key === 'maghrib';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: isIftar ? `${prayer.emoji} İftar Vakti!` : `${prayer.emoji} ${prayerName} Vakti`,
          body: isIftar
            ? `Hayırlı iftarlar! ${city} için iftar vakti girdi.`
            : `${city} için ${prayerName} namazı vakti girdi.`,
          sound: 'default',
          data: { prayer: prayer.key, city },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: prayer.time,
          channelId: 'prayer-times',
        },
      });
    }
  }
}

/**
 * Bildirim ayarlarını yükle
 */
async function loadSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Bildirim ayarları yüklenemedi:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Bildirim ayarlarını kaydet
 */
async function saveSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Bildirim ayarları kaydedilemedi:', error);
  }
}

/**
 * Bildirim hook'u
 */
export function useNotifications(city: string) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Başlangıçta ayarları yükle
  useEffect(() => {
    async function init() {
      const loaded = await loadSettings();
      setSettings(loaded);

      if (loaded.enabled) {
        const granted = await requestPermissions();
        setPermissionGranted(granted);
      }

      setIsLoading(false);
    }
    init();
  }, []);

  // Şehir veya ayarlar değişince bildirimleri güncelle
  useEffect(() => {
    if (!isLoading && city && settings.enabled && permissionGranted) {
      schedulePrayerNotifications(city, settings);
    }
  }, [city, settings, isLoading, permissionGranted]);

  // Bildirimleri aç/kapat
  const toggleNotifications = useCallback(async () => {
    if (!settings.enabled) {
      // Açmak istiyoruz - izin iste
      const granted = await requestPermissions();
      setPermissionGranted(granted);

      if (granted) {
        const newSettings = { ...settings, enabled: true };
        setSettings(newSettings);
        await saveSettings(newSettings);
        if (city) {
          await schedulePrayerNotifications(city, newSettings);
        }
      }
    } else {
      // Kapatmak istiyoruz
      const newSettings = { ...settings, enabled: false };
      setSettings(newSettings);
      await saveSettings(newSettings);
      await cancelAllNotifications();
    }
  }, [settings, city]);

  // Belirli bir vakit için bildirimi aç/kapat
  const togglePrayer = useCallback(
    async (prayer: keyof NotificationSettings) => {
      if (prayer === 'enabled') return;

      const newSettings = { ...settings, [prayer]: !settings[prayer] };
      setSettings(newSettings);
      await saveSettings(newSettings);

      if (newSettings.enabled && city && permissionGranted) {
        await schedulePrayerNotifications(city, newSettings);
      }
    },
    [settings, city, permissionGranted]
  );

  // Test bildirimi gönder
  const sendTestNotification = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) {
      console.log('Bildirim izni verilmedi');
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🕌 Test Bildirimi',
        body: 'Bildirimler düzgün çalışıyor! İftar Vakti uygulaması hazır.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });

    return true;
  }, []);

  return {
    settings,
    permissionGranted,
    isLoading,
    toggleNotifications,
    togglePrayer,
    sendTestNotification,
  };
}
