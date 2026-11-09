# Expo Collections

Mobile apps I built with React Native and Expo.

## Apps

### Ramadan App (`Expo-Ramadan-App`)

A mobile app for daily worship in Ramadan. The app is in Turkish.

- Prayer times for your city, found from your location
- Time left until the next prayer
- Hijri and Gregorian dates
- The Quran with Turkish translation and audio, verse by verse, with three reciters
- A prayer direction (Qibla) finder that uses GPS and the phone compass
- A Ramadan calendar with daily imsak and iftar times
- Hadith and dua pages

Built with Expo Router, expo-location, expo-sensors, expo-audio, AsyncStorage and axios.

### AdMob Template (`Expo-Admob-Template`)

A starter app that shows how to add Google AdMob ads to an Expo app.

- A banner ad at the bottom of the screen
- A full-screen ad that opens when you tap a button
- Google test ads in development
- AdMob IDs kept in environment variables

Built with Expo Router, react-native-google-mobile-ads and expo-dev-client.

### Movie App (`Expo-Movie-App`)

Work in progress. The tab layout and the home screen are ready. Search, saved movies and movie details are not finished yet.

Built with Expo Router and NativeWind (Tailwind CSS).

## Run an app

```bash
cd Expo-Ramadan-App
npm install
npx expo start
```

Each app has its own README with more details. The AdMob template needs a development build, because AdMob ads do not work in Expo Go.
