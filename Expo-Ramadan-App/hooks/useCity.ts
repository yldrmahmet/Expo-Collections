import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { cityCoordinates } from '../constants/CityCoordinates';

/**
 * İki koordinat arasındaki mesafeyi hesapla (Haversine formülü)
 * Sonuç kilometre cinsinden
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Dünya'nın yarıçapı (km)
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
    const distance = calculateDistance(
      latitude,
      longitude,
      coords.latitude,
      coords.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = cityName;
    }
  }

  return nearestCity;
}

export function useCity() {
  const [city, setCity] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Uygulama açıldığında otomatik konum tespiti
  useEffect(() => {
    detectLocation();
  }, []);

  // GPS ile konum tespit et
  const detectLocation = useCallback(async () => {
    setIsDetecting(true);
    setLocationError(null);

    try {
      // Konum izni iste
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Konum izni verilmedi');
        setShowCityPicker(true);
        setIsDetecting(false);
        return;
      }

      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // En yakın şehri bul
      const nearestCity = findNearestCity(
        location.coords.latitude,
        location.coords.longitude
      );

      if (nearestCity) {
        setCity(nearestCity);
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

  const openCityPicker = useCallback(() => {
    setShowCityPicker(true);
  }, []);

  const closeCityPicker = useCallback(() => {
    // Şehir seçilmeden kapatmaya çalışırsa
    if (!city) {
      return; // Kapatma, şehir seçmeli
    }
    setShowCityPicker(false);
  }, [city]);

  const selectCity = useCallback((newCity: string) => {
    setCity(newCity);
    setShowCityPicker(false);
    setLocationError(null);
  }, []);

  return {
    city: city || '',
    showCityPicker,
    isDetecting,
    locationError,
    openCityPicker,
    closeCityPicker,
    selectCity,
    detectLocation,
  };
}
