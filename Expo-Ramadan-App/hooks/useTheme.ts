import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'nativewind';
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
 * Tema hook'u
 * Kullanıcının tema tercihini yönetir ve AsyncStorage'da saklar
 */
export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

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
   * Temayı uygula
   */
  const applyTheme = useCallback((pref: ThemePreference) => {
    if (pref === 'system') {
      setColorScheme('system');
    } else {
      setColorScheme(pref);
    }
  }, [setColorScheme]);

  /**
   * Tema tercihini değiştir ve kaydet
   * Not: setColorScheme senkron çalışır, loading gerekmez
   */
  const setThemePreference = useCallback(async (newPreference: ThemePreference) => {
    if (newPreference === preference) return;

    setPreference(newPreference);
    applyTheme(newPreference);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, newPreference);
    } catch (error) {
      console.error('Tema tercihi kaydedilemedi:', error);
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

  return {
    preference,
    activeTheme,
    isDark,
    isLoading,
    setThemePreference,
  };
}
