import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { CityProvider } from '../context';
import { ThemeProvider } from '../components';
import { useTheme } from '../hooks';

// Splash screen'i otomatik kapatmayı engelle
SplashScreen.preventAutoHideAsync();

// Splash screen animasyon ayarları (SDK 54 yeni özellik)
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

/**
 * Inner Layout - Theme yüklendikten sonra render edilir
 */
function InnerLayout() {
  const { isDark, isLoading } = useTheme();

  useEffect(() => {
    // Tema yüklendikten sonra splash screen'i kapat
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Tema yüklenene kadar bekle (splash screen görünür kalır)
  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <CityProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <InnerLayout />
        </ThemeProvider>
      </SafeAreaProvider>
    </CityProvider>
  );
}
