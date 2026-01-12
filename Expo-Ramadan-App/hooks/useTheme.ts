import { useState, useEffect, useCallback, useMemo } from 'react';
import { colorScheme as nativeWindColorScheme, useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

/**
 * Tema tercihi tipleri
 * - system: Cihaz ayarını takip et
 * - light: Her zaman açık tema
 * - dark: Her zaman koyu tema
 */
export type ThemePreference = 'system' | 'light' | 'dark';

/**
 * Aktif tema (gerçekte uygulanan)
 */
export type ActiveTheme = 'light' | 'dark';

/**
 * Tema renkleri - Merkezi tanım
 * Tüm componentler bu renkleri useTheme'den almalı
 */
const THEME_COLORS = {
  light: {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryLight: '#4CAF50',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A1A',
    textSecondary: '#424242',
    textMuted: '#757575',
    error: '#D32F2F',
    warning: '#FF9800',
    border: '#E0E0E0',
  },
  dark: {
    primary: '#4CAF50',
    primaryDark: '#2E7D32',
    primaryLight: '#81C784',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#E8E8E8',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    error: '#EF5350',
    warning: '#FFB74D',
    border: '#333333',
  },
} as const;

export type ThemeColors = typeof THEME_COLORS.light;

/**
 * Tema hook'u
 * Kullanıcının tema tercihini yönetir ve AsyncStorage'da saklar
 * NativeWind colorScheme.set() kullanır (docs önerisi)
 */
export function useTheme() {
  const { colorScheme } = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  // Başlangıçta kayıtlı tercihi yükle
  useEffect(() => {
    loadPreference();
  }, []);

  /**
   * Kayıtlı tema tercihini yükle
   */
  const loadPreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
      if (stored) {
        const pref = stored as ThemePreference;
        setPreference(pref);
        applyTheme(pref);
      }
    } catch (error) {
      console.error('Tema tercihi yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Temayı uygula - NativeWind colorScheme.set() kullanır
   */
  const applyTheme = useCallback((pref: ThemePreference) => {
    if (pref === 'system') {
      nativeWindColorScheme.set('system');
    } else {
      nativeWindColorScheme.set(pref);
    }
  }, []);

  /**
   * Tema tercihini değiştir ve kaydet
   * isChanging: Tema geçişi sırasında loading göstermek için
   */
  const setThemePreference = useCallback(async (newPreference: ThemePreference) => {
    if (newPreference === preference) return;

    setIsChanging(true);
    setPreference(newPreference);
    applyTheme(newPreference);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, newPreference);
    } catch (error) {
      console.error('Tema tercihi kaydedilemedi:', error);
    } finally {
      // Kısa bir gecikme ile UI güncellemesini bekle
      setTimeout(() => setIsChanging(false), 300);
    }
  }, [applyTheme, preference]);

  /**
   * Aktif tema (light veya dark)
   */
  const activeTheme: ActiveTheme = colorScheme === 'dark' ? 'dark' : 'light';

  /**
   * Koyu tema mı?
   */
  const isDark = activeTheme === 'dark';

  /**
   * Aktif tema renkleri
   * Memoized - sadece tema değişince yeniden hesaplanır
   */
  const colors = useMemo(() => THEME_COLORS[activeTheme], [activeTheme]);

  return {
    preference,
    activeTheme,
    isDark,
    isLoading,
    isChanging,
    colors,
    setThemePreference,
  };
}
