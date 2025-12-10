import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';

import { prayerCategories, prayers } from '@/constants/PrayerData';

interface Prayer {
  id: number;
  name: string;
  arabic: string;
  turkish: string;
  meaning: string;
  audioUrl?: any;
}

export default function DualarScreen() {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [categoryPrayers, setCategoryPrayers] = useState<Prayer[]>(prayers[1] || []);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const playerRef = useRef<any>(null);

  const selectCategory = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCategoryPrayers(prayers[categoryId] || []);
  };

  const playAudio = async (audioUrl: any, prayerId: number) => {
    try {
      if (playingId === prayerId) {
        playerRef.current?.pause();
        setPlayingId(null);
        return;
      }

      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'duckOthers',
      });

      const player = createAudioPlayer(audioUrl);
      playerRef.current = player;

      player.addListener('playbackStatusUpdate', (status: any) => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });

      player.play();
      setPlayingId(prayerId);
    } catch (error) {
      console.error('Ses oynatma hatasi:', error);
      Alert.alert('Hata', 'Ses dosyasi oynatilamadi');
    }
  };

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.remove();
      }
    };
  }, []);

  const renderPrayerCard = ({ item }: { item: Prayer }) => (
    <View style={[styles.prayerCard, playingId === item.id && styles.playingCard]}>
      <View style={styles.prayerHeader}>
        <Text style={[styles.prayerName, playingId === item.id && styles.playingText]}>{item.name}</Text>
        {item.audioUrl && (
          <Pressable style={styles.audioButton} onPress={() => playAudio(item.audioUrl, item.id)}>
            <Ionicons
              name={playingId === item.id ? 'pause-circle' : 'play-circle'}
              size={32}
              color={playingId === item.id ? '#1B5E20' : '#2E7D32'}
            />
          </Pressable>
        )}
      </View>
      <Text style={styles.arabicText}>{item.arabic}</Text>
      <Text style={[styles.turkishText, playingId === item.id && styles.playingText]}>{item.turkish}</Text>
      <Text style={[styles.meaningText, playingId === item.id && styles.playingText]}>{item.meaning}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dualar</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        <View style={styles.categoryContainer}>
          {prayerCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.categoryCard, selectedCategory === category.id && styles.selectedCategory]}
              onPress={() => selectCategory(category.id)}
            >
              <Text style={[styles.categoryTitle, selectedCategory === category.id && styles.selectedCategoryTitle]}>
                {category.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={categoryPrayers}
          renderItem={renderPrayerCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.prayerList}
        />
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
  categoryContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategory: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2E7D32',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedCategoryTitle: {
    color: '#2E7D32',
  },
  prayerList: {
    padding: 16,
  },
  prayerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playingCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
    borderWidth: 1,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  audioButton: {
    padding: 4,
  },
  arabicText: {
    fontSize: 22,
    color: '#333',
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 36,
  },
  turkishText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  meaningText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  playingText: {
    color: '#1B5E20',
  },
});
