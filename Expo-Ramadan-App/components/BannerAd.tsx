import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Constants from 'expo-constants';

let GoogleBannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let isAdMobAvailable = false;

try {
  const ads = require('react-native-google-mobile-ads');
  GoogleBannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
  isAdMobAvailable = true;
} catch {
  // AdMob not available (Expo Go)
}

function getAdUnitId(): string | undefined {
  if (!isAdMobAvailable || !TestIds) return undefined;
  return __DEV__
    ? TestIds.BANNER
    : Constants.expoConfig?.extra?.admobBannerAdUnitId;
}

export function BannerAd() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adUnitId = getAdUnitId();

  if (!isAdMobAvailable || !adUnitId || !GoogleBannerAd) {
    if (__DEV__) {
      return (
        <View className="items-center bg-surface border-t border-divider py-3">
          <Text className="text-xs text-text-secondary">
            AdMob: Expo Go'da kullanılamaz
          </Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View className="items-center bg-surface border-t border-divider">
      <GoogleBannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setIsLoaded(true);
          setError(null);
        }}
        onAdFailedToLoad={(err: any) => {
          setError(err.message);
        }}
      />

      {__DEV__ && (
        <Text className="text-xs text-text-secondary py-1">
          {isLoaded ? 'Reklam yüklendi' : error ? `Hata: ${error}` : 'Reklam yükleniyor...'}
        </Text>
      )}
    </View>
  );
}
