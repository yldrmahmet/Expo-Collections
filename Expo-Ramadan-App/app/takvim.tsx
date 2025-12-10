import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from './_layout';
import { hijriMonths } from '@/constants/HijriMonths';

interface FormattedPrayer {
  date: string;
  hijriDate: string;
  times: {
    imsak: string;
    gunes: string;
    ogle: string;
    ikindi: string;
    aksam: string;
    yatsi: string;
  };
}

const { width } = Dimensions.get('window');

export default function TakvimScreen() {
  const { monthlyPrayers } = useAppContext();
  const [showFullTimes, setShowFullTimes] = useState(false);
  const [formattedPrayers, setFormattedPrayers] = useState<FormattedPrayer[]>([]);

  useEffect(() => {
    if (monthlyPrayers && Array.isArray(monthlyPrayers)) {
      const formatted = monthlyPrayers.map((day: any) => ({
        date: formatGregorianDate(day.date.gregorian.date),
        hijriDate: formatHijriDate(day.date.hijri),
        times: {
          imsak: day.timings.Fajr.split(' ')[0],
          gunes: day.timings.Sunrise.split(' ')[0],
          ogle: day.timings.Dhuhr.split(' ')[0],
          ikindi: day.timings.Asr.split(' ')[0],
          aksam: day.timings.Maghrib.split(' ')[0],
          yatsi: day.timings.Isha.split(' ')[0],
        },
      }));
      setFormattedPrayers(formatted);
    }
  }, [monthlyPrayers]);

  const formatGregorianDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
    });
  };

  const formatHijriDate = (hijri: any) => {
    return `${hijri.day} ${hijriMonths[parseInt(hijri.month.number)]}`;
  };

  const isToday = (dateStr: string) => {
    if (!dateStr) return false;

    const today = new Date();
    const currentDate = today.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
    });

    return dateStr === currentDate;
  };

  const renderTableHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.dateCell]}>Tarih</Text>
      {showFullTimes ? (
        <>
          <Text style={styles.headerCell}>Imsak</Text>
          <Text style={styles.headerCell}>Gunes</Text>
          <Text style={styles.headerCell}>Ogle</Text>
          <Text style={styles.headerCell}>Ikindi</Text>
          <Text style={styles.headerCell}>Aksam</Text>
          <Text style={styles.headerCell}>Yatsi</Text>
        </>
      ) : (
        <>
          <Text style={styles.headerCell}>Imsak</Text>
          <Text style={styles.headerCell}>Iftar</Text>
        </>
      )}
    </View>
  );

  const renderTableRow = (day: FormattedPrayer, index: number) => {
    if (!day || !day.times) return null;

    return (
      <View key={index} style={[styles.tableRow, isToday(day.date) && styles.todayRow]}>
        <View style={[styles.dateCellContainer, isToday(day.date) && styles.todayCell]}>
          <Text style={[styles.dateText, isToday(day.date) && styles.todayText]}>
            {day.date || ''}
          </Text>
          <Text style={[styles.hijriDate, isToday(day.date) && styles.todayText]}>
            {day.hijriDate || ''}
          </Text>
        </View>
        {showFullTimes ? (
          <>
            <Text style={[styles.tableCell, isToday(day.date) && styles.todayText]}>{day.times.imsak}</Text>
            <Text style={[styles.tableCell, isToday(day.date) && styles.todayText]}>{day.times.gunes}</Text>
            <Text style={[styles.tableCell, isToday(day.date) && styles.todayText]}>{day.times.ogle}</Text>
            <Text style={[styles.tableCell, isToday(day.date) && styles.todayText]}>{day.times.ikindi}</Text>
            <Text style={[styles.tableCell, isToday(day.date) && styles.todayText]}>{day.times.aksam}</Text>
            <Text style={[styles.tableCell, isToday(day.date) && styles.todayText]}>{day.times.yatsi}</Text>
          </>
        ) : (
          <>
            <Text style={[styles.tableCell, isToday(day.date) && styles.todayText]}>{day.times.imsak}</Text>
            <Text style={[styles.tableCell, isToday(day.date) && styles.todayText]}>{day.times.aksam}</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Takvim</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewButton, !showFullTimes && styles.activeViewButton]}
            onPress={() => setShowFullTimes(false)}
          >
            <Text style={[styles.viewButtonText, !showFullTimes && styles.activeViewButtonText]}>
              Basit Gorunum
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, showFullTimes && styles.activeViewButton]}
            onPress={() => setShowFullTimes(true)}
          >
            <Text style={[styles.viewButtonText, showFullTimes && styles.activeViewButtonText]}>
              Detayli Gorunum
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {renderTableHeader()}
          {formattedPrayers.length > 0 ? (
            formattedPrayers.map((day, index) => renderTableRow(day, index))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Namaz vakitleri yukleniyor...</Text>
            </View>
          )}
        </ScrollView>
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
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 8,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeViewButton: {
    backgroundColor: '#2E7D32',
  },
  viewButtonText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  activeViewButtonText: {
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2E7D32',
    fontSize: 12,
  },
  dateCell: {
    flex: 2,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  todayRow: {
    backgroundColor: '#E8F5E9',
  },
  dateCellContainer: {
    flex: 2,
  },
  todayCell: {
    backgroundColor: '#2E7D32',
    borderRadius: 4,
    padding: 4,
  },
  dateText: {
    fontWeight: 'bold',
    color: '#2E7D32',
    fontSize: 12,
  },
  todayText: {
    color: '#fff',
  },
  hijriDate: {
    color: '#666',
    fontSize: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});
