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
      />
    </View>
  );
}
