import { useEffect, useState, createContext, useContext } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

// Global state context for app-wide data
interface AppContextType {
  prayerTimes: Record<string, string> | null;
  setPrayerTimes: (times: Record<string, string> | null) => void;
  hijriDate: string | null;
  setHijriDate: (date: string | null) => void;
  monthlyPrayers: any[] | null;
  setMonthlyPrayers: (prayers: any[] | null) => void;
  cityName: string;
  setCityName: (name: string) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContext.Provider');
  }
  return context;
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string> | null>(null);
  const [hijriDate, setHijriDate] = useState<string | null>(null);
  const [monthlyPrayers, setMonthlyPrayers] = useState<any[] | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize app
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
    <SafeAreaProvider>
      <AppContext.Provider
        value={{
          prayerTimes,
          setPrayerTimes,
          hijriDate,
          setHijriDate,
          monthlyPrayers,
          setMonthlyPrayers,
          cityName,
          setCityName,
        }}
      >
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f5f5f5' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="takvim" />
          <Stack.Screen name="kuran" />
          <Stack.Screen name="kible" />
          <Stack.Screen name="dualar" />
          <Stack.Screen name="hadis" />
          <Stack.Screen name="ayarlar" />
          <Stack.Screen
            name="city-select"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
