import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: 'İftar Vakti - İmsakiye 2026',
  slug: 'ramazan-rehberi',
  version: '1.0.9',
  scheme: 'iftar-vakti',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/acilis-ekrani.png',

  splash: {
    image: './assets/acilis-ekrani.png',
    resizeMode: 'contain',
    backgroundColor: '#2E7D32',
  },

  assetBundlePatterns: ['**/*'],

  ios: {
    bundleIdentifier: 'com.iftarvakti.imsakiye.2026',
    supportsTablet: true,
    infoPlist: {
      CFBundleDisplayName: 'İftar Vakti',
      LSApplicationQueriesSchemes: ['tel', 'mailto'],
    },
  },

  android: {
    package: 'com.iftarvakti.imsakiye',
    adaptiveIcon: {
      foregroundImage: './assets/acilis-ekrani.png',
      backgroundColor: '#2E7D32',
    },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'POST_NOTIFICATIONS',
      'VIBRATE',
    ],
    softwareKeyboardLayoutMode: 'pan',
  },

  web: {
    bundler: 'metro',
    favicon: './assets/acilis-ekrani.png',
  },

  plugins: [
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Konum izni ile bulunduğunuz şehri otomatik tespit ediyoruz.',
      },
    ],
    [
      'expo-notifications',
      {
        sounds: ['./assets/sabah.mp3', './assets/sabah2.mp3', './assets/ezan.mp3'],
        icon: './assets/acilis-ekrani.png',
        color: '#2E7D32',
      },
    ],
    'expo-router',
    'expo-font',
    './plugins/withFixPackageDeclaration',
    // AdMob plugin
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.ADMOB_ANDROID_APP_ID,
        iosAppId: process.env.ADMOB_IOS_APP_ID,
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    remoteBuildCache: true,
  },

  extra: {
    eas: {
      projectId: 'a514ad0b-5287-4618-96a7-74833bc4d23a',
    },
    router: {
      origin: false,
    },
    // AdMob Ad Unit IDs
    admobBannerAdUnitId: process.env.ADMOB_BANNER_AD_UNIT_ID,
    admobInterstitialAdUnitId: process.env.ADMOB_INTERSTITIAL_AD_UNIT_ID,
  },

  updates: {
    url: 'https://u.expo.dev/a514ad0b-5287-4618-96a7-74833bc4d23a',
  },

  runtimeVersion: '1.0.0',
  owner: 'yldrmahmet',
});
