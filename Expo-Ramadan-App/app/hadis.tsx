import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Hadith {
  id: number;
  arabic: string;
  turkish: string;
  source: string;
}

// Sample hadiths - in real app this would come from API
const sampleHadiths: Hadith[] = [
  {
    id: 1,
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    turkish: 'Ameller niyetlere goredir.',
    source: 'Buhari, Muslim',
  },
  {
    id: 2,
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    turkish: 'Musluman, elinden ve dilinden diger Muslumanlarin emin oldugu kimsedir.',
    source: 'Buhari, Muslim',
  },
  {
    id: 3,
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    turkish: 'Sizden biriniz, kendisi icin istedigini kardesfi icin de istemedikce gercek mumim olamaz.',
    source: 'Buhari, Muslim',
  },
  {
    id: 4,
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    turkish: "Allah'a ve ahiret gunune inanan kimse ya hayir soylesin ya da sussun.",
    source: 'Buhari, Muslim',
  },
  {
    id: 5,
    arabic: 'الطُّهُورُ شَطْرُ الْإِيمَانِ',
    turkish: 'Temizlik imanin yarisidir.',
    source: 'Muslim',
  },
];

export default function HadisScreen() {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setHadiths(sampleHadiths);
      setLoading(false);
    }, 500);
  }, []);

  const nextHadith = () => {
    setCurrentIndex((prev) => (prev + 1) % hadiths.length);
  };

  const prevHadith = () => {
    setCurrentIndex((prev) => (prev - 1 + hadiths.length) % hadiths.length);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hadis-i Serif</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      </SafeAreaView>
    );
  }

  const currentHadith = hadiths[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hadis-i Serif</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardNumber}>
              {currentIndex + 1} / {hadiths.length}
            </Text>
          </View>

          <Text style={styles.arabicText}>{currentHadith.arabic}</Text>

          <View style={styles.divider} />

          <Text style={styles.turkishText}>{currentHadith.turkish}</Text>

          <View style={styles.sourceContainer}>
            <Ionicons name="book-outline" size={16} color="#666" />
            <Text style={styles.sourceText}>{currentHadith.source}</Text>
          </View>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.navButton} onPress={prevHadith}>
            <Ionicons name="chevron-back" size={24} color="#2E7D32" />
            <Text style={styles.navButtonText}>Onceki</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={nextHadith}>
            <Text style={styles.navButtonText}>Sonraki</Text>
            <Ionicons name="chevron-forward" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f7f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  arabicText: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  turkishText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    textAlign: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
    gap: 8,
  },
  navButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
});
