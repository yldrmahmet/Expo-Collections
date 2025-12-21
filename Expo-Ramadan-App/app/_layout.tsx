import '../global.css';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { CityProvider } from '../context';

// Splash screen'i otomatik kapatmayı engelle
SplashScreen.preventAutoHideAsync();

// Splash screen animasyon ayarları (SDK 54 yeni özellik)
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

/**
 * Root Layout
 * - CityProvider: Şehir state'ini tüm uygulamada paylaşır
 * - Stack: Tüm route'ları tanımlar
 * - Yönlendirme: app/index.tsx'de yapılır
 */
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        setIsReady(true);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <CityProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </CityProvider>
  );
}
