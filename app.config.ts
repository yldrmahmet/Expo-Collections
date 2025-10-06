// Load environment variables from .env file
import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

// This is the main configuration for the Expo app
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  // App name and basic info
  name: "my-app",
  slug: "my-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  // iOS settings
  ios: {
    supportsTablet: true
  },

  // Android settings
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png"
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.yldrmahmet.myapp" // Your app package name
  },

  // Web settings
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png"
  },

  // Plugins (add extra features to the app)
  plugins: [
    // Navigation plugin
    "expo-router",

    // Splash screen plugin (first screen when app opens)
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000"
        }
      }
    ],

    // AdMob plugin (for showing ads)
    [
      "react-native-google-mobile-ads",
      {
        // Get AdMob app IDs from .env file
        androidAppId: process.env.ADMOB_ANDROID_APP_ID,
        iosAppId: process.env.ADMOB_IOS_APP_ID
      }
    ]
  ],

  // Experimental features
  experiments: {
    typedRoutes: true,
    reactCompiler: true
  },

  // Extra data (can be used in the app)
  extra: {
    router: {},

    // EAS project ID (for building the app)
    eas: {
      projectId: "5790cbf7-342c-47aa-8374-5d26ac55d4a5"
    },

    // Make AdMob ad unit IDs available in the app
    // Get these from .env file
    admobBannerAdUnitId: process.env.ADMOB_BANNER_AD_UNIT_ID,
    admobInterstitialAdUnitId: process.env.ADMOB_INTERSTITIAL_AD_UNIT_ID,
  }
});
