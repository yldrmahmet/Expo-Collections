import { useState, useEffect, useMemo } from 'react';
import {
  Coordinates,
  PrayerTimes,
  CalculationMethod,
  Prayer,
  CalculationParameters,
} from 'adhan';
import { getCityCoordinates } from '../constants/CityCoordinates';

export interface PrayerTime {
  name: string;
  time: string;
  nameEnglish: string;
}

export interface DayPrayers {
  date: string;
  hijriDate: string;
  weekday: string;
  isToday: boolean;
  prayers: PrayerTime[];
}

// Türkçe gün isimleri
const WEEKDAYS_TR = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

// Türkçe ay isimleri
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

/**
 * Diyanet hesaplama parametreleri
 * Fajr: 18°, Isha: 17°
 */
function getDiyanetParams(): CalculationParameters {
  const params = CalculationMethod.Turkey();
  return params;
}

/**
 * Date objesini "HH:mm" formatına çevir
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Tarihi "1 Ocak" formatına çevir
 */
function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_TR[date.getMonth()]}`;
}

/**
 * Miladi tarihi Hicri tarihe çevir (yaklaşık hesaplama)
 * Not: Gerçek Hicri takvim için ay gözlemi gerekir
 */
function toHijriDate(date: Date): string {
  // Hicri takvim başlangıcı: 16 Temmuz 622
  const hijriEpoch = new Date(622, 6, 16);
  const diffDays = Math.floor((date.getTime() - hijriEpoch.getTime()) / (1000 * 60 * 60 * 24));

  // Hicri yıl yaklaşık 354.36667 gün
  const hijriYear = Math.floor(diffDays / 354.36667) + 1;
  const daysInYear = diffDays % 354.36667;

  // Hicri ay yaklaşık 29.53 gün
  const hijriMonth = Math.floor(daysInYear / 29.53) + 1;
  const hijriDay = Math.floor(daysInYear % 29.53) + 1;

  const HIJRI_MONTHS = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
    'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce',
  ];

  const monthName = HIJRI_MONTHS[(hijriMonth - 1) % 12];
  return `${hijriDay} ${monthName}`;
}

/**
 * İki tarihin aynı gün olup olmadığını kontrol et
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Bir gün için namaz vakitlerini hesapla
 */
function calculateDayPrayers(
  coordinates: Coordinates,
  date: Date,
  params: CalculationParameters,
  today: Date
): DayPrayers {
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  return {
    date: formatDate(date),
    hijriDate: toHijriDate(date),
    weekday: WEEKDAYS_TR[date.getDay()],
    isToday: isSameDay(date, today),
    prayers: [
      { name: 'İmsak', nameEnglish: 'Fajr', time: formatTime(prayerTimes.fajr) },
      { name: 'Güneş', nameEnglish: 'Sunrise', time: formatTime(prayerTimes.sunrise) },
      { name: 'Öğle', nameEnglish: 'Dhuhr', time: formatTime(prayerTimes.dhuhr) },
      { name: 'İkindi', nameEnglish: 'Asr', time: formatTime(prayerTimes.asr) },
      { name: 'Akşam', nameEnglish: 'Maghrib', time: formatTime(prayerTimes.maghrib) },
      { name: 'Yatsı', nameEnglish: 'Isha', time: formatTime(prayerTimes.isha) },
    ],
  };
}

/**
 * Offline namaz vakitleri hook'u
 * adhan-js ile yerel hesaplama yapar - internet gerektirmez
 */
export function usePrayerTimes(city: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Şehir koordinatlarını al
  const cityData = useMemo(() => getCityCoordinates(city), [city]);

  // Aylık namaz vakitlerini hesapla
  const monthlyPrayers = useMemo(() => {
    if (!cityData) {
      return [];
    }

    try {
      const coordinates = new Coordinates(cityData.latitude, cityData.longitude);
      const params = getDiyanetParams();
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      // Ayın gün sayısını bul
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Her gün için hesapla
      const prayers: DayPrayers[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        prayers.push(calculateDayPrayers(coordinates, date, params, today));
      }

      return prayers;
    } catch (err) {
      console.error('Prayer calculation error:', err);
      return [];
    }
  }, [cityData]);

  // Loading ve error state'lerini güncelle
  useEffect(() => {
    if (!city) {
      setError('Şehir seçilmedi');
      setLoading(false);
      return;
    }

    if (!cityData) {
      setError(`"${city}" şehri bulunamadı`);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(false);
  }, [city, cityData]);

  // Yeniden hesaplama fonksiyonu (aslında gerekmiyor ama API uyumluluğu için)
  const refetch = () => {
    setLoading(true);
    // useMemo zaten yeniden hesaplayacak
    setTimeout(() => setLoading(false), 100);
  };

  return {
    monthlyPrayers,
    loading,
    error,
    refetch,
  };
}

/**
 * Anlık namaz vakti bilgisi için hook
 */
export function useCurrentPrayer(city: string) {
  const cityData = getCityCoordinates(city);

  return useMemo(() => {
    if (!cityData) return null;

    const coordinates = new Coordinates(cityData.latitude, cityData.longitude);
    const params = getDiyanetParams();
    const now = new Date();
    const prayerTimes = new PrayerTimes(coordinates, now, params);

    const current = prayerTimes.currentPrayer();
    const next = prayerTimes.nextPrayer();

    const prayerNames: Record<string, string> = {
      [Prayer.Fajr]: 'İmsak',
      [Prayer.Sunrise]: 'Güneş',
      [Prayer.Dhuhr]: 'Öğle',
      [Prayer.Asr]: 'İkindi',
      [Prayer.Maghrib]: 'Akşam',
      [Prayer.Isha]: 'Yatsı',
      [Prayer.None]: '',
    };

    const nextPrayerTime = prayerTimes.timeForPrayer(next);
    const remaining = nextPrayerTime
      ? Math.max(0, nextPrayerTime.getTime() - now.getTime())
      : 0;

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return {
      current: prayerNames[current] || '',
      next: prayerNames[next] || '',
      nextTime: nextPrayerTime ? formatTime(nextPrayerTime) : '',
      remaining: `${hours} saat ${minutes} dakika`,
    };
  }, [cityData]);
}
