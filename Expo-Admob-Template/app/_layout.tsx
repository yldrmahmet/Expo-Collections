import { Stack } from "expo-router";
import { useEffect } from "react";
import mobileAds from "react-native-google-mobile-ads";

// This is the main layout for the app
// It starts when the app opens
export default function RootLayout() {
  // This runs when the app starts
  useEffect(() => {
    // Start AdMob (this is needed for ads to work)
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log("AdMob initialized:", adapterStatuses);
      });
  }, []); // [] means run only once when app starts

  // Return the navigation structure
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#4285F4" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* Home screen */}
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      {/* Banner ad screen */}
      <Stack.Screen
        name="banner-ad-screen"
        options={{
          title: "Banner Ad",
        }}
      />
    </Stack>
  );
}
