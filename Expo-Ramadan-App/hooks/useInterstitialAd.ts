import { useEffect, useState, useCallback } from 'react';
import Constants from 'expo-constants';

let AdEventType: any = null;
let InterstitialAd: any = null;
let TestIds: any = null;
let isAdMobAvailable = false;

try {
  const ads = require('react-native-google-mobile-ads');
  AdEventType = ads.AdEventType;
  InterstitialAd = ads.InterstitialAd;
  TestIds = ads.TestIds;
  isAdMobAvailable = true;
} catch {
  // AdMob not available (Expo Go)
}

function getAdUnitId(): string | undefined {
  if (!isAdMobAvailable || !TestIds) return undefined;
  return __DEV__
    ? TestIds.INTERSTITIAL
    : Constants.expoConfig?.extra?.admobInterstitialAdUnitId;
}

interface UseInterstitialAdReturn {
  isLoaded: boolean;
  isAvailable: boolean;
  showAd: () => void;
}

export function useInterstitialAd(): UseInterstitialAdReturn {
  const [interstitialAd, setInterstitialAd] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const adUnitId = getAdUnitId();

  useEffect(() => {
    if (!isAdMobAvailable || !adUnitId || !InterstitialAd) {
      return;
    }

    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const loadedListener = ad.addAdEventListener(AdEventType.LOADED, () => {
      setIsLoaded(true);
    });

    const closedListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setIsLoaded(false);
      ad.load();
    });

    ad.load();
    setInterstitialAd(ad);

    return () => {
      loadedListener();
      closedListener();
    };
  }, [adUnitId]);

  const showAd = useCallback(() => {
    if (isLoaded && interstitialAd) {
      interstitialAd.show();
    }
  }, [isLoaded, interstitialAd]);

  return { isLoaded, isAvailable: isAdMobAvailable, showAd };
}
