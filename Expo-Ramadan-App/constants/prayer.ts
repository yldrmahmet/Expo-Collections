/**
 * Namaz vakitleri ile ilgili sabitler
 */

// Namaz vakti isimleri (İngilizce → Türkçe)
export const PRAYER_NAMES: Record<string, string> = {
  fajr: 'İmsak',
  sunrise: 'Güneş',
  dhuhr: 'Öğle',
  asr: 'İkindi',
  maghrib: 'Akşam',
  isha: 'Yatsı',
};

// Namaz vakitleri için emojiler
export const PRAYER_EMOJIS: Record<string, string> = {
  fajr: '🌙',
  sunrise: '🌅',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🍽️',
  isha: '🌙',
};

// İftar için dönen yemek emojileri
export const IFTAR_EMOJIS = ['🍲', '🥘', '🍛', '🥗', '🍜', '🍵', '🥙', '🧆'] as const;

// Namaz vakti seçenekleri (bildirim ayarları için)
export const PRAYER_OPTIONS = [
  { key: 'fajr', label: 'İmsak (Sahur)', emoji: '🌙' },
  { key: 'sunrise', label: 'Güneş', emoji: '🌅' },
  { key: 'dhuhr', label: 'Öğle', emoji: '☀️' },
  { key: 'asr', label: 'İkindi', emoji: '🌤️' },
  { key: 'maghrib', label: 'Akşam (İftar)', emoji: '🍽️' },
  { key: 'isha', label: 'Yatsı', emoji: '🌙' },
] as const;
