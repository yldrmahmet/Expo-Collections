import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  Pressable,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';

import { useAppContext } from './_layout';
import { turkishCities } from '@/constants/TurkishCities';
import { hijriMonths } from '@/constants/HijriMonths';
import CitySelectModal from '@/components/CitySelectModal';

const { width, height } = Dimensions.get('window');

// Background images
const backgroundImages = [
  require('@/assets/ramadan-bg-1.jpg'),
  require('@/assets/ramadan-bg-2.jpg'),
  require('@/assets/ramadan-bg-3.jpg'),
];

interface NextPrayer {
  name: string;
  time: string;
  remaining: string;
  current: string;
}

export default function HomeScreen() {
  const { prayerTimes, setPrayerTimes, hijriDate, setHijriDate, monthlyPrayers, setMonthlyPrayers, cityName, setCityName } = useAppContext();

  const [modalVisible, setModalVisible] = useState(!cityName);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer>({
    name: '',
    time: '',
    remaining: '',
    current: '',
  });
  const [prayers, setPrayers] = useState<Record<string, string>>({});
  const [backgroundImage, setBackgroundImage] = useState(backgroundImages[0]);
  const [currentTime, setCurrentTime] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');

  // Random background image
  useEffect(() => {
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBackgroundImage(randomImage);
  }, []);

  // Time and date update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setGregorianDate(
        now.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show modal if no city selected
  useEffect(() => {
    if (!cityName) {
      setModalVisible(true);
    }
  }, [cityName]);

  // Calculate next prayer
  const calculateNextPrayer = useCallback((prayersObj: Record<string, string>) => {
    const now = new Date();
    let nextPrayerName = '';
    let nextPrayerTime = '';
    let currentPrayer = '';
    let minDiff = Infinity;

    Object.entries(prayersObj).forEach(([name, time]) => {
      const [hours, minutes] = time.split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(hours), parseInt(minutes), 0);

      let diff = prayerTime.getTime() - now.getTime();
      if (diff < 0) {
        prayerTime.setDate(prayerTime.getDate() + 1);
        diff = prayerTime.getTime() - now.getTime();
      }

      const prevPrayerTime = new Date(prayerTime);
      prevPrayerTime.setDate(prevPrayerTime.getDate() - 1);
      if (now >= prevPrayerTime && now < prayerTime) {
        currentPrayer = name;
      }

      if (diff < minDiff && diff > 0) {
        minDiff = diff;
        nextPrayerName = name;
        nextPrayerTime = time;
      }
    });

    setNextPrayer({
      name: nextPrayerName,
      time: nextPrayerTime,
      remaining: `${Math.floor(minDiff / (1000 * 60 * 60))} saat ${Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60))} dakika`,
      current: currentPrayer,
    });
  }, []);

  // Update prayers when prayerTimes changes
  useEffect(() => {
    if (prayerTimes) {
      const prayerObj: Record<string, string> = {
        'Imsak': prayerTimes.Fajr,
        'Gunes': prayerTimes.Sunrise,
        'Ogle': prayerTimes.Dhuhr,
        'Ikindi': prayerTimes.Asr,
        'Aksam': prayerTimes.Maghrib,
        'Yatsi': prayerTimes.Isha,
      };
      setPrayers(prayerObj);
      calculateNextPrayer(prayerObj);
    }
  }, [prayerTimes, calculateNextPrayer]);

  // Recalculate next prayer every minute
  useEffect(() => {
    if (Object.keys(prayers).length > 0) {
      const interval = setInterval(() => {
        calculateNextPrayer(prayers);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [prayers, calculateNextPrayer]);

  const fetchPrayerTimes = async (city: string, country: string) => {
    try {
      const dailyResponse = await axios.get(
        'https://api.aladhan.com/v1/timingsByCity',
        {
          params: {
            city: city,
            country: country,
            method: 13,
          },
        }
      );

      setPrayerTimes(dailyResponse.data.data.timings);
      const hijriDateStr = dailyResponse.data.data.date.hijri.date;

      const formatHijriDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('-');
        const monthName = hijriMonths[parseInt(month)];
        return `${parseInt(day)} ${monthName} ${year}`;
      };

      setHijriDate(formatHijriDate(hijriDateStr));

      // Monthly prayers
      const today = new Date();
      const monthlyResponse = await axios.get(
        'https://api.aladhan.com/v1/calendarByCity',
        {
          params: {
            city: city,
            country: country,
            method: 13,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          },
        }
      );

      if (monthlyResponse.data?.data) {
        setMonthlyPrayers(monthlyResponse.data.data);
      }
    } catch (e) {
      console.warn('API Error:', e);
      Alert.alert('Hata', 'Namaz vakitleri alinirken bir hata olustu.');
    }
  };

  const handleLocationDetection = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum Izni Gerekli',
          'Otomatik konum tespiti icin konum iznine ihtiyacimiz var.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode[0]) {
        const city = geocode[0].city || geocode[0].subregion;
        if (city) {
          setCityName(city);
          setModalVisible(false);
          await fetchPrayerTimes(city, 'Turkey');
        } else {
          Alert.alert(
            'Hata',
            'Konumunuz tespit edilemedi. Lutfen sehrinizi manuel secin.'
          );
        }
      }
    } catch (error) {
      console.warn(error);
      Alert.alert(
        'Hata',
        'Konum alinirken bir hata olustu. Lutfen sehrinizi manuel secin.'
      );
    }
  };

  const handleCitySelect = async (city: string) => {
    setCityName(city);
    setModalVisible(false);
    await fetchPrayerTimes(city, 'Turkey');
  };

  const navigationItems = [
    { name: 'Takvim', route: '/takvim', icon: require('@/assets/navi-calendar.png') },
    { name: 'Kuran', route: '/kuran', icon: require('@/assets/navi-quran.png') },
    { name: 'Kible', route: '/kible', icon: require('@/assets/navi-kible.png') },
    { name: 'Hadis', route: '/hadis', icon: require('@/assets/navi-hadis.png') },
    { name: 'Dualar', route: '/dualar', icon: require('@/assets/navi-dua.png') },
    { name: 'Ayarlar', route: '/ayarlar', icon: require('@/assets/navi-settings.png') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <CitySelectModal
        visible={modalVisible}
        onClose={() => {
          if (!cityName) {
            Alert.alert('Uyari', 'Lutfen bir sehir secin veya konumunuzu tespit edin.');
            return;
          }
          setModalVisible(false);
        }}
        onCitySelect={handleCitySelect}
        onLocationDetect={handleLocationDetection}
        cities={turkishCities}
      />

      <View style={styles.headerContainer}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.overlay}>
            <Text style={styles.timeText}>{currentTime}</Text>
            <Text style={styles.dateText}>{gregorianDate}</Text>
            <Text style={styles.hijriDateText}>{hijriDate}</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.prayerInfoContainer}>
          <View style={styles.currentPrayerContainer}>
            <Text style={styles.prayerLabel}>Su anki vakit</Text>
            <Text style={styles.prayerName}>{nextPrayer.current || '-'}</Text>
          </View>
          <View style={styles.nextPrayerContainer}>
            <Text style={styles.prayerLabel}>Gelecek vakit</Text>
            <Text style={styles.prayerName}>{nextPrayer.name || '-'}</Text>
          </View>
          {nextPrayer.remaining && (
            <View style={styles.remainingTimeContainer}>
              <View style={styles.remainingTimeBox}>
                <Text style={styles.remainingTimeText}>{nextPrayer.remaining} kaldi</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.prayerTimesGrid}>
          {Object.entries(prayers).map(([name, time]) => (
            <View
              key={name}
              style={[
                styles.prayerTimeItem,
                nextPrayer.current === name && styles.activePrayerTimeItem,
              ]}
            >
              <Text
                style={[
                  styles.prayerTimeText,
                  nextPrayer.current === name && styles.activePrayerTimeText,
                ]}
              >
                {name}
              </Text>
              <Text
                style={[
                  styles.prayerTimeValue,
                  nextPrayer.current === name && styles.activePrayerTimeValue,
                ]}
              >
                {time}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.navigationContainer}>
          {navigationItems.map((item) => (
            <Pressable
              key={item.name}
              style={styles.navButton}
              onPress={() => router.push(item.route as any)}
            >
              <Image source={item.icon} style={styles.navIcon} resizeMode="contain" />
              <Text style={styles.navButtonText}>{item.name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.cityHeader}>
          <View style={styles.cityNameContainer}>
            <Ionicons name="location" size={20} color="#2E7D32" />
            <Text style={styles.cityName} numberOfLines={1}>
              {cityName || 'Sehir secilmedi'}
            </Text>
          </View>
          <Pressable style={styles.locationButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.locationButtonText}>Konum Degistir</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    height: height * 0.28,
    width: '100%',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: Math.min(width * 0.12, 48),
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  dateText: {
    fontSize: Math.min(width * 0.045, 18),
    color: '#fff',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  hijriDateText: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#fff',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -height * 0.03,
    padding: width * 0.03,
  },
  prayerInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 15,
    padding: width * 0.04,
    marginBottom: height * 0.03,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  currentPrayerContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    paddingRight: width * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPrayerContainer: {
    flex: 1,
    paddingLeft: width * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerLabel: {
    fontSize: Math.min(width * 0.035, 14),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  prayerName: {
    fontSize: Math.min(width * 0.055, 22),
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  remainingTimeContainer: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  remainingTimeBox: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: width * 0.04,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  remainingTimeText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  prayerTimeItem: {
    width: '16%',
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: width * 0.015,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  activePrayerTimeItem: {
    backgroundColor: '#2E7D32',
  },
  prayerTimeText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  activePrayerTimeText: {
    color: '#fff',
  },
  prayerTimeValue: {
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  activePrayerTimeValue: {
    color: '#fff',
  },
  navigationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.02,
    marginBottom: height * 0.02,
  },
  navButton: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginBottom: height * 0.015,
  },
  navIcon: {
    width: width * 0.15,
    height: width * 0.15,
    marginBottom: 6,
  },
  navButtonText: {
    fontSize: Math.min(width * 0.035, 12),
    color: '#2E7D32',
    textAlign: 'center',
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: width * 0.03,
    borderRadius: 12,
    marginTop: 'auto',
  },
  cityNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityName: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '500',
    color: '#2E7D32',
    marginLeft: 8,
  },
  locationButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '500',
  },
});
