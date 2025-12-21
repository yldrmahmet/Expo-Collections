import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import { getCityCoordinates, PRAYER_NAMES, PRAYER_EMOJIS, STORAGE_KEYS } from '../constants';

// Bildirim ayarları tipi
export interface NotificationSettings {
  enabled: boolean;
  // Bildirim zamanlaması
  notifyAtPrayerTime: boolean; // Ezan vaktinde bildirim
  notifyBeforePrayer: boolean; // 5 dk önce bildirim
  // Hangi vakitlerde bildirim
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
  notifyAtPrayerTime: true, // Ezan vakti açık (varsayılan)
  notifyBeforePrayer: false, // 5 dk önce kapalı (varsayılan)
  fajr: true,
  sunrise: false,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

// 5 dakika önce bildirim sesleri (namaz bazlı)
const BEFORE_PRAYER_SOUNDS: Record<string, string> = {
  fajr: 'sabah5dk.mp3',
  dhuhr: 'ogle5dk.mp3',
  asr: 'ikindi5dk.mp3',
  maghrib: 'aksam5dk.mp3',
  isha: 'yatsi5dk.mp3',
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

  // Android için kanallar oluştur
  if (Platform.OS === 'android') {
    // Eski kanalları sil (ses değişikliği için gerekli)
    const oldChannels = [
      'prayer-times',
      'prayer-fajr',
      'prayer-fajr-1',
      'prayer-fajr-2',
      'prayer-5min-sabah',
      'prayer-5min-ogle',
      'prayer-5min-ikindi',
      'prayer-5min-aksam',
      'prayer-5min-yatsi',
    ];
    for (const channel of oldChannels) {
      await Notifications.deleteNotificationChannelAsync(channel).catch(() => {});
    }

    // === EZAN VAKTİ KANALLARI ===
    // Normal namaz vakitleri kanalı (ezan sesi)
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Namaz Vakitleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'ezan.mp3',
    });

    // Sabah namazı için kanal 1
    await Notifications.setNotificationChannelAsync('prayer-fajr-1', {
      name: 'Sabah Namazı (Ezan 1)',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'sabah.mp3',
    });

    // Sabah namazı için kanal 2
    await Notifications.setNotificationChannelAsync('prayer-fajr-2', {
      name: 'Sabah Namazı (Ezan 2)',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'sabah2.mp3',
    });

    // === 5 DAKİKA ÖNCE KANALLARI ===
    await Notifications.setNotificationChannelAsync('prayer-5min-sabah', {
      name: '5 Dakika Önce - Sabah',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'sabah5dk.mp3',
    });

    await Notifications.setNotificationChannelAsync('prayer-5min-ogle', {
      name: '5 Dakika Önce - Öğle',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'ogle5dk.mp3',
    });

    await Notifications.setNotificationChannelAsync('prayer-5min-ikindi', {
      name: '5 Dakika Önce - İkindi',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'ikindi5dk.mp3',
    });

    await Notifications.setNotificationChannelAsync('prayer-5min-aksam', {
      name: '5 Dakika Önce - Akşam',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'aksam5dk.mp3',
    });

    await Notifications.setNotificationChannelAsync('prayer-5min-yatsi', {
      name: '5 Dakika Önce - Yatsı',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'yatsi5dk.mp3',
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

// 5 dakika önce kanal eşlemesi
const BEFORE_PRAYER_CHANNELS: Record<string, string> = {
  fajr: 'prayer-5min-sabah',
  dhuhr: 'prayer-5min-ogle',
  asr: 'prayer-5min-ikindi',
  maghrib: 'prayer-5min-aksam',
  isha: 'prayer-5min-yatsi',
};

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

  // En az bir bildirim türü açık olmalı
  if (!settings.notifyAtPrayerTime && !settings.notifyBeforePrayer) return;

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
      { key: 'fajr', time: prayerTimes.fajr },
      { key: 'sunrise', time: prayerTimes.sunrise },
      { key: 'dhuhr', time: prayerTimes.dhuhr },
      { key: 'asr', time: prayerTimes.asr },
      { key: 'maghrib', time: prayerTimes.maghrib },
      { key: 'isha', time: prayerTimes.isha },
    ];

    for (const prayer of prayers) {
      const settingKey = prayer.key as keyof NotificationSettings;
      if (!settings[settingKey]) continue;

      const prayerName = PRAYER_NAMES[prayer.key];
      const isIftar = prayer.key === 'maghrib';
      const isFajr = prayer.key === 'fajr';
      const emoji = PRAYER_EMOJIS[prayer.key];

      // === 5 DAKİKA ÖNCE BİLDİRİM ===
      if (settings.notifyBeforePrayer && prayer.key !== 'sunrise') {
        const beforeTime = new Date(prayer.time.getTime() - 5 * 60 * 1000);

        // Geçmiş vakitleri atla
        if (beforeTime > new Date()) {
          const beforeSound = BEFORE_PRAYER_SOUNDS[prayer.key];
          const beforeChannel = BEFORE_PRAYER_CHANNELS[prayer.key];

          await Notifications.scheduleNotificationAsync({
            content: {
              title: isIftar
                ? `⏰ İftara 5 dakika kaldı!`
                : `⏰ ${prayerName} vaktine 5 dakika`,
              body: isIftar
                ? `${city} için iftar vakti yaklaşıyor. Hazırlıklarınızı tamamlayın.`
                : `${city} için ${prayerName} namazı vakti yaklaşıyor.`,
              sound: beforeSound,
              data: { prayer: prayer.key, city, type: 'before' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: beforeTime,
              channelId: beforeChannel,
            },
          });
        }
      }

      // === EZAN VAKTİ BİLDİRİM ===
      if (settings.notifyAtPrayerTime) {
        // Geçmiş vakitleri atla
        if (prayer.time <= new Date()) continue;

        // Sabah namazı için rastgele ses seç
        const useFajrSound1 = Math.random() < 0.5;
        const fajrSound = useFajrSound1 ? 'sabah.mp3' : 'sabah2.mp3';
        const fajrChannel = useFajrSound1 ? 'prayer-fajr-1' : 'prayer-fajr-2';

        await Notifications.scheduleNotificationAsync({
          content: {
            title: isIftar ? `${emoji} İftar Vakti!` : `${emoji} ${prayerName} Vakti`,
            body: isIftar
              ? `Hayırlı iftarlar! ${city} için iftar vakti girdi.`
              : `${city} için ${prayerName} namazı vakti girdi.`,
            sound: isFajr ? fajrSound : 'ezan.mp3',
            data: { prayer: prayer.key, city, type: 'atTime' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: prayer.time,
            channelId: isFajr ? fajrChannel : 'prayer-times',
          },
        });
      }
    }
  }
}

/**
 * Bildirim ayarlarını yükle
 */
async function loadSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
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
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
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

  // Bildirim zamanlaması ayarını değiştir
  const toggleNotificationTiming = useCallback(
    async (timing: 'notifyAtPrayerTime' | 'notifyBeforePrayer') => {
      const newSettings = { ...settings, [timing]: !settings[timing] };
      setSettings(newSettings);
      await saveSettings(newSettings);

      if (newSettings.enabled && city && permissionGranted) {
        await schedulePrayerNotifications(city, newSettings);
      }
    },
    [settings, city, permissionGranted]
  );

  // Test bildirimi gönder
  const sendTestNotification = useCallback(
    async (prayerKey: string, type: 'atTime' | 'before') => {
      const granted = await requestPermissions();
      if (!granted) {
        console.log('Bildirim izni verilmedi');
        return false;
      }

      const prayerName = PRAYER_NAMES[prayerKey] || prayerKey;
      const emoji = PRAYER_EMOJIS[prayerKey] || '🕌';

      if (type === 'atTime') {
        // Ezan vakti test bildirimi
        const isFajr = prayerKey === 'fajr';
        const useFajrSound1 = Math.random() < 0.5;
        const sound = isFajr ? (useFajrSound1 ? 'sabah.mp3' : 'sabah2.mp3') : 'ezan.mp3';
        const channelId = isFajr ? (useFajrSound1 ? 'prayer-fajr-1' : 'prayer-fajr-2') : 'prayer-times';

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${emoji} Test - ${prayerName} Vakti`,
            body: `${prayerName} ezan vakti bildirimi testi.`,
            sound,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2,
            channelId,
          },
        });
      } else {
        // 5 dakika önce test bildirimi
        const sound = BEFORE_PRAYER_SOUNDS[prayerKey] || 'aksam5dk.mp3';
        const channelId = BEFORE_PRAYER_CHANNELS[prayerKey] || 'prayer-5min-aksam';

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Test - ${prayerName} 5dk Önce`,
            body: `${prayerName} için 5 dakika önce bildirimi testi.`,
            sound,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2,
            channelId,
          },
        });
      }

      return true;
    },
    []
  );

  return {
    settings,
    permissionGranted,
    isLoading,
    toggleNotifications,
    togglePrayer,
    toggleNotificationTiming,
    sendTestNotification,
  };
}
