import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

// Get the ad ID
// If testing: use Google test ID
// If real app: use your ID from .env file
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Constants.expoConfig?.extra?.admobInterstitialAdUnitId;

export default function HomePage() {
  // Navigation tool (go to other pages)
  const router = useRouter();

  // Store the ad
  const [interstitialAd, setInterstitialAd] = useState<InterstitialAd | null>(
    null
  );

  // Is the ad ready to show?
  const [adLoaded, setAdLoaded] = useState(false);

  // This runs when the page opens
  useEffect(() => {
    // Create a new interstitial ad
    const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID!, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Listen: when ad is ready
    const loadedListener = ad.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true); // Ad is ready!
    });

    // Listen: when user closes the ad
    const closedListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false); // Ad is not ready anymore
      ad.load(); // Load a new ad
    });

    // Start loading the ad
    ad.load();
    setInterstitialAd(ad);

    // Clean up when page closes
    return () => {
      loadedListener();
      closedListener();
    };
  }, []); // [] means run only once when page opens

  // Function: show the interstitial ad
  const handleShowInterstitial = () => {
    // Only show if ad is ready
    if (adLoaded && interstitialAd) {
      interstitialAd.show();
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 20 }}>
      {/* Title */}
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>
        AdMob Demo
      </Text>

      {/* Button 1: Show interstitial ad */}
      <Button
        title={adLoaded ? "Show Interstitial Ad" : "Loading..."}
        onPress={handleShowInterstitial}
        disabled={!adLoaded} // Disable button if ad is not ready
      />

      {/* Button 2: Go to banner ad page */}
      <Button
        title="Show Banner Ad"
        onPress={() => router.push("/banner-ad-screen")}
      />
    </View>
  );
}
