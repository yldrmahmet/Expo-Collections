import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';

const MECCA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.7;

export default function KibleScreen() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [magnetometer, setMagnetometer] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    let magnetometerSub: any;
    let accelerometerSub: any;

    const setup = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni gereklidir');
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        calculateQiblaAngle(loc.coords);
      } catch {
        setErrorMsg('Konum alinamadi');
      }

      magnetometerSub = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x);
        angle = (angle * (180 / Math.PI) + 360) % 360;
        setMagnetometer(angle);
      });
      Magnetometer.setUpdateInterval(100);

      accelerometerSub = Accelerometer.addListener((data) => {
        const isFlat = Math.abs(data.z) > 0.8 && Math.abs(data.x) < 0.2 && Math.abs(data.y) < 0.2;
        setIsStable(isFlat);
      });
      Accelerometer.setUpdateInterval(500);
    };

    setup();

    return () => {
      magnetometerSub?.remove();
      accelerometerSub?.remove();
    };
  }, []);

  const calculateQiblaAngle = (coords: Location.LocationObjectCoords) => {
    const lat1 = coords.latitude * (Math.PI / 180);
    const lon1 = coords.longitude * (Math.PI / 180);
    const lat2 = MECCA_COORDS.latitude * (Math.PI / 180);
    const lon2 = MECCA_COORDS.longitude * (Math.PI / 180);

    const y = Math.sin(lon2 - lon1);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lon2 - lon1);
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    setQiblaAngle(angle);
  };

  const getRotationAngle = () => {
    if (qiblaAngle === null) return '0deg';
    const rotation = (qiblaAngle - magnetometer + 360) % 360;
    return `${rotation}deg`;
  };

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kible</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color="#d32f2f" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Text style={styles.errorSubText}>
              Kible yonunu gosterebilmek icin konum iznine ihtiyacimiz var.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kible</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        <View style={[styles.compassContainer, !isStable && styles.compassContainerUnstable]}>
          <View style={styles.compassCircle}>
            <View style={styles.directionLabels}>
              <Text style={styles.directionText}>K</Text>
              <View style={styles.eastWestContainer}>
                <Text style={styles.directionText}>B</Text>
                <Text style={styles.directionText}>D</Text>
              </View>
              <Text style={styles.directionText}>G</Text>
            </View>
          </View>

          <View style={[styles.arrowContainer, { transform: [{ rotate: getRotationAngle() }] }]}>
            <View style={styles.arrowLine} />
            <View style={styles.arrowHead} />
            <Text style={styles.arrowText}>KIBLE</Text>
          </View>
        </View>

        <View style={styles.stabilityContainer}>
          <Ionicons
            name={isStable ? 'checkmark-circle' : 'warning'}
            size={24}
            color={isStable ? '#2E7D32' : '#FFA000'}
          />
          <Text style={[styles.stabilityText, isStable ? styles.stabilityTextStable : styles.stabilityTextUnstable]}>
            {isStable ? 'Telefon sabit, kible yonu dogru gosteriliyor' : 'Telefonu duz bir zemine koyun'}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Kible Acisi</Text>
          <Text style={styles.infoValue}>{qiblaAngle ? `${Math.round(qiblaAngle)}°` : '--'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  placeholder: {
    width: 32,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: '#f8f8f8',
    elevation: 5,
  },
  compassContainerUnstable: {
    opacity: 0.7,
  },
  compassCircle: {
    width: COMPASS_SIZE - 40,
    height: COMPASS_SIZE - 40,
    borderRadius: (COMPASS_SIZE - 40) / 2,
    borderWidth: 3,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  arrowLine: {
    width: 6,
    height: COMPASS_SIZE * 0.35,
    backgroundColor: '#2E7D32',
    position: 'absolute',
    top: COMPASS_SIZE * 0.15,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2E7D32',
    position: 'absolute',
    top: COMPASS_SIZE * 0.08,
    transform: [{ rotate: '180deg' }],
  },
  arrowText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: COMPASS_SIZE * 0.15,
  },
  directionLabels: {
    width: COMPASS_SIZE - 60,
    height: COMPASS_SIZE - 60,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  directionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  eastWestContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  stabilityText: {
    fontSize: 14,
    flex: 1,
  },
  stabilityTextStable: {
    color: '#2E7D32',
  },
  stabilityTextUnstable: {
    color: '#FFA000',
  },
  infoContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
