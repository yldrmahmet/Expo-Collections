import Constants from "expo-constants";
import { useState } from "react";
import { Text, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

// Get the banner ad ID
// If testing: use Google test ID
// If real app: use your ID from .env file
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Constants.expoConfig?.extra?.admobBannerAdUnitId;

// This is the banner ad page
export default function BannerAdScreen() {
  // Did the ad load successfully?
  const [adLoaded, setAdLoaded] = useState(false);

  // Store error message if ad fails
  const [adError, setAdError] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID!}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        // When ad loads successfully
        onAdLoaded={() => {
          console.log("Banner Ad Loaded!");
          setAdLoaded(true); // Mark as loaded
          setAdError(null); // Clear any error
        }}
        // When ad fails to load
        onAdFailedToLoad={(error) => {
          console.error("Banner Ad Error:", error);
          setAdError(error.message); // Save error message
        }}
      />

      {/* Show status (only in test mode) */}
      {__DEV__ && (
        <Text style={{ fontSize: 10, color: "gray", marginTop: 5 }}>
          {adLoaded
            ? "Ad loaded"
            : adError
            ? `Error: ${adError}`
            : "Loading ad..."}
        </Text>
      )}
    </View>
  );
}
