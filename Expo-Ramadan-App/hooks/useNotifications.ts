import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import { getCityCoordinates, PRAYER_NAMES, PRAYER_EMOJIS, STORAGE_KEYS } from '../constants';

// Bildirim ayarları tipi
export interface NotificationSettings {
  enabled: boolean;
  notifyAtPrayerTime: boolean;
  notifyBeforePrayer: boolean;
  fajr: boolean;
  sunrise: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

// Varsayılan ayarlar
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  notifyAtPrayerTime: true,
  notifyBeforePrayer: false,
  fajr: true,
  sunrise: false,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

// 5 dakika önce bildirim sesleri
const BEFORE_PRAYER_SOUNDS: Record<string, string> = {
  fajr: 'sabah5dk.mp3',
  dhuhr: 'ogle5dk.mp3',
  asr: 'ikindi5dk.mp3',
  maghrib: 'aksam5dk.mp3',
  isha: 'yatsi5dk.mp3',
};

// 5 dakika önce kanal eşlemesi
const BEFORE_PRAYER_CHANNELS: Record<string, string> = {
  fajr: 'prayer-5min-sabah',
  dhuhr: 'prayer-5min-ogle',
  asr: 'prayer-5min-ikindi',
  maghrib: 'prayer-5min-aksam',
  isha: 'prayer-5min-yatsi',
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
 * Bildirim için unique identifier oluştur
 * Format: prayer-type-YYYY-MM-DD (örn: fajr-atTime-2026-01-09)
 */
function createNotificationId(prayer: string, type: 'atTime' | 'before', date: Date): string {
  const dateStr = date.toISOString().split('T')[0];
  return `${prayer}-${type}-${dateStr}`;
}

/**
 * Bildirim izni iste ve kanalları oluştur
 */
async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Bildirimler için fiziksel cihaz gerekli');
    return false;
  }

  // Android için kanallar oluştur
  if (Platform.OS === 'android') {
    // Eski kanalları sil
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

    // Ezan vakti kanalları
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Namaz Vakitleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'ezan.mp3',
    });

    await Notifications.setNotificationChannelAsync('prayer-fajr-1', {
      name: 'Sabah Namazı (Ezan 1)',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'sabah.mp3',
    });

    await Notifications.setNotificationChannelAsync('prayer-fajr-2', {
      name: 'Sabah Namazı (Ezan 2)',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'sabah2.mp3',
    });

    // 5 dakika önce kanalları
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
 * Tüm namaz bildirimleri iptal et (test bildirimleri hariç)
 */
async function cancelAllPrayerNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    // Sadece namaz bildirimleri iptal et (test- ile başlamayanlar)
    if (notification.identifier && !notification.identifier.startsWith('test-')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Namaz vakitleri için bildirimleri zamanla
 */
async function schedulePrayerNotifications(
  city: string,
  settings: NotificationSettings
): Promise<void> {
  // Önce mevcut namaz bildirimleri iptal et
  await cancelAllPrayerNotifications();

  if (!settings.enabled) return;
  if (!settings.notifyAtPrayerTime && !settings.notifyBeforePrayer) return;

  const cityData = getCityCoordinates(city);
  if (!cityData) return;

  const coordinates = new Coordinates(cityData.latitude, cityData.longitude);
  const params = CalculationMethod.Turkey();

  // Önümüzdeki 3 gün için bildirimleri zamanla
  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);

    const prayerTimes = new PrayerTimes(coordinates, date, params);

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

      // 5 DAKİKA ÖNCE BİLDİRİM
      if (settings.notifyBeforePrayer && prayer.key !== 'sunrise') {
        const beforeTime = new Date(prayer.time.getTime() - 5 * 60 * 1000);

        if (beforeTime > new Date()) {
          const beforeSound = BEFORE_PRAYER_SOUNDS[prayer.key];
          const beforeChannel = BEFORE_PRAYER_CHANNELS[prayer.key];
          const notificationId = createNotificationId(prayer.key, 'before', date);

          await Notifications.scheduleNotificationAsync({
            identifier: notificationId, // Unique identifier
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

      // EZAN VAKTİ BİLDİRİM
      if (settings.notifyAtPrayerTime) {
        if (prayer.time <= new Date()) continue;

        const useFajrSound1 = Math.random() < 0.5;
        const fajrSound = useFajrSound1 ? 'sabah.mp3' : 'sabah2.mp3';
        const fajrChannel = useFajrSound1 ? 'prayer-fajr-1' : 'prayer-fajr-2';
        const notificationId = createNotificationId(prayer.key, 'atTime', date);

        await Notifications.scheduleNotificationAsync({
          identifier: notificationId, // Unique identifier
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

  // useRef ile scheduling durumunu takip et (React lifecycle'a uyumlu)
  const isSchedulingRef = useRef(false);
  const schedulingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScheduledCityRef = useRef<string | null>(null);
  const lastScheduledSettingsRef = useRef<string | null>(null);

  // Güvenli scheduling fonksiyonu - duplicate çağrıları önler
  const safeScheduleNotifications = useCallback(
    async (targetCity: string, targetSettings: NotificationSettings) => {
      // Aynı ayarlar için tekrar schedule etme
      const settingsKey = JSON.stringify(targetSettings);
      if (
        lastScheduledCityRef.current === targetCity &&
        lastScheduledSettingsRef.current === settingsKey
      ) {
        return;
      }

      // Zaten schedule ediliyorsa bekle
      if (isSchedulingRef.current) {
        return;
      }

      // Önceki timeout varsa iptal et
      if (schedulingTimeoutRef.current) {
        clearTimeout(schedulingTimeoutRef.current);
        schedulingTimeoutRef.current = null;
      }

      isSchedulingRef.current = true;

      try {
        await schedulePrayerNotifications(targetCity, targetSettings);
        // Başarılı olursa son schedule edilen değerleri kaydet
        lastScheduledCityRef.current = targetCity;
        lastScheduledSettingsRef.current = settingsKey;
      } catch (error) {
        console.error('Bildirim planlama hatası:', error);
      } finally {
        isSchedulingRef.current = false;
      }
    },
    []
  );

  // Başlangıçta ayarları yükle (sadece bir kez)
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const loaded = await loadSettings();

      if (!isMounted) return;

      setSettings(loaded);

      if (loaded.enabled) {
        const granted = await requestPermissions();
        if (!isMounted) return;
        setPermissionGranted(granted);
      }

      setIsLoading(false);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Şehir veya izin değişince bildirimleri güncelle (debounced)
  useEffect(() => {
    if (isLoading || !city || !settings.enabled || !permissionGranted) {
      return;
    }

    // Önceki timeout varsa iptal et
    if (schedulingTimeoutRef.current) {
      clearTimeout(schedulingTimeoutRef.current);
    }

    // 1 saniye debounce - StrictMode double-render'ı önler
    schedulingTimeoutRef.current = setTimeout(() => {
      safeScheduleNotifications(city, settings);
    }, 1000);

    return () => {
      if (schedulingTimeoutRef.current) {
        clearTimeout(schedulingTimeoutRef.current);
        schedulingTimeoutRef.current = null;
      }
    };
  }, [city, isLoading, permissionGranted, safeScheduleNotifications]);
  // Not: settings dependency'den çıkarıldı - manuel toggle'lar handle ediyor

  // Bildirimleri aç/kapat
  const toggleNotifications = useCallback(async () => {
    if (!settings.enabled) {
      const granted = await requestPermissions();
      setPermissionGranted(granted);

      if (granted) {
        const newSettings = { ...settings, enabled: true };
        setSettings(newSettings);
        await saveSettings(newSettings);

        if (city) {
          // Cache'i temizle - yeni ayarlar için schedule et
          lastScheduledSettingsRef.current = null;
          await safeScheduleNotifications(city, newSettings);
        }
      }
    } else {
      const newSettings = { ...settings, enabled: false };
      setSettings(newSettings);
      await saveSettings(newSettings);
      await cancelAllPrayerNotifications();
      // Cache'i temizle
      lastScheduledCityRef.current = null;
      lastScheduledSettingsRef.current = null;
    }
  }, [settings, city, safeScheduleNotifications]);

  // Belirli bir vakit için bildirimi aç/kapat
  const togglePrayer = useCallback(
    async (prayer: keyof NotificationSettings) => {
      if (prayer === 'enabled') return;

      const newSettings = { ...settings, [prayer]: !settings[prayer] };
      setSettings(newSettings);
      await saveSettings(newSettings);

      if (newSettings.enabled && city && permissionGranted) {
        lastScheduledSettingsRef.current = null; // Cache'i temizle
        await safeScheduleNotifications(city, newSettings);
      }
    },
    [settings, city, permissionGranted, safeScheduleNotifications]
  );

  // Bildirim zamanlaması ayarını değiştir
  const toggleNotificationTiming = useCallback(
    async (timing: 'notifyAtPrayerTime' | 'notifyBeforePrayer') => {
      const newSettings = { ...settings, [timing]: !settings[timing] };
      setSettings(newSettings);
      await saveSettings(newSettings);

      if (newSettings.enabled && city && permissionGranted) {
        lastScheduledSettingsRef.current = null; // Cache'i temizle
        await safeScheduleNotifications(city, newSettings);
      }
    },
    [settings, city, permissionGranted, safeScheduleNotifications]
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
      const testId = `test-${prayerKey}-${type}-${Date.now()}`;

      if (type === 'atTime') {
        const isFajr = prayerKey === 'fajr';
        const useFajrSound1 = Math.random() < 0.5;
        const sound = isFajr ? (useFajrSound1 ? 'sabah.mp3' : 'sabah2.mp3') : 'ezan.mp3';
        const channelId = isFajr ? (useFajrSound1 ? 'prayer-fajr-1' : 'prayer-fajr-2') : 'prayer-times';

        await Notifications.scheduleNotificationAsync({
          identifier: testId,
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
        const sound = BEFORE_PRAYER_SOUNDS[prayerKey] || 'aksam5dk.mp3';
        const channelId = BEFORE_PRAYER_CHANNELS[prayerKey] || 'prayer-5min-aksam';

        await Notifications.scheduleNotificationAsync({
          identifier: testId,
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
