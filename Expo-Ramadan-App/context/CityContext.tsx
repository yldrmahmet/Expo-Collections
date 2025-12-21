import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cityCoordinates } from '../constants/CityCoordinates';
import { STORAGE_KEYS } from '../constants/storage';

/**
 * İki koordinat arasındaki mesafeyi hesapla (Haversine formülü)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Koordinatlara en yakın şehri bul
 */
function findNearestCity(latitude: number, longitude: number): string | null {
  let nearestCity: string | null = null;
  let minDistance = Infinity;

  for (const [cityName, coords] of Object.entries(cityCoordinates)) {
    const distance = calculateDistance(latitude, longitude, coords.latitude, coords.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = cityName;
    }
  }
  return nearestCity;
}

// Context tipi
interface CityContextType {
  city: string;
  isLoading: boolean;
  isDetecting: boolean;
  showCityPicker: boolean;
  locationError: string | null;
  selectCity: (city: string) => Promise<void>;
  detectLocation: () => Promise<void>;
  openCityPicker: () => void;
  closeCityPicker: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

/**
 * City Context Provider
 * Tüm uygulama genelinde şehir state'ini paylaşır
 */
export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Kayıtlı şehri yükle
  useEffect(() => {
    async function loadSavedCity() {
      try {
        const savedCity = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CITY);
        if (savedCity) {
          setCity(savedCity);
        }
      } catch (error) {
        console.error('Failed to load saved city:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSavedCity();
  }, []);

  // GPS ile konum tespit et
  const detectLocation = useCallback(async () => {
    setIsDetecting(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Konum izni verilmedi');
        setShowCityPicker(true);
        setIsDetecting(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nearestCity = findNearestCity(location.coords.latitude, location.coords.longitude);

      if (nearestCity) {
        setCity(nearestCity);
        await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CITY, nearestCity);
      } else {
        setLocationError('Yakın şehir bulunamadı');
        setShowCityPicker(true);
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationError('Konum alınamadı');
      setShowCityPicker(true);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const selectCity = useCallback(async (newCity: string) => {
    setCity(newCity);
    setShowCityPicker(false);
    setLocationError(null);
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CITY, newCity);
  }, []);

  const openCityPicker = useCallback(() => {
    setShowCityPicker(true);
  }, []);

  const closeCityPicker = useCallback(() => {
    if (!city) return;
    setShowCityPicker(false);
  }, [city]);

  return (
    <CityContext.Provider
      value={{
        city: city || '',
        isLoading,
        isDetecting,
        showCityPicker,
        locationError,
        selectCity,
        detectLocation,
        openCityPicker,
        closeCityPicker,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

/**
 * City Context'i kullanmak için hook
 */
export function useCityContext() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCityContext must be used within CityProvider');
  }
  return context;
}
