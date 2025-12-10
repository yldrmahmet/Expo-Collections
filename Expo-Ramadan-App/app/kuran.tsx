import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { surahNames } from '@/constants/SurahNames';

interface Surah {
  number: number;
  name: string;
  numberOfAyahs: number;
}

interface Verse {
  number: number;
  numberInSurah: number;
  text: string;
  translation?: string;
}

export default function KuranScreen() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [surahVerses, setSurahVerses] = useState<Verse[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);
  const [reciterModalVisible, setReciterModalVisible] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(20);
  const [selectedReciter, setSelectedReciter] = useState('ar.mahermuaiqly');
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const isPlayingAllRef = useRef(false);
  const playerRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const reciters = [
    { id: 'ar.mahermuaiqly', name: 'Mahir El-Muaykli' },
    { id: 'ar.alafasy', name: 'El-Afasi' },
    { id: 'ar.minshawi', name: 'El-Minsevi' },
  ];

  useEffect(() => {
    fetchSurahs();
    return () => {
      isPlayingAllRef.current = false;
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = async () => {
    try {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
      setCurrentVerse(null);
    } catch (error) {
      console.error('Ses temizleme hatasi:', error);
    }
  };

  const fetchSurahs = async () => {
    try {
      const response = await axios.get('https://api.alquran.cloud/v1/surah');
      setSurahs(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Sureler yuklenirken hata:', error);
      Alert.alert('Hata', 'Sureler yuklenirken bir sorun olustu.');
      setLoading(false);
    }
  };

  const fetchSurahVerses = async (surahNumber: number) => {
    try {
      setVersesLoading(true);
      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
      await cleanupAudio();

      const [arabicResponse, translationResponse] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
        axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/tr.diyanet`),
      ]);

      const verses = arabicResponse.data.data.ayahs.map((ayah: any, index: number) => ({
        ...ayah,
        translation: translationResponse.data.data.ayahs[index].text,
      }));

      setSurahVerses(verses);
      setVersesLoading(false);
    } catch (error) {
      console.error('Ayetler yuklenirken hata:', error);
      Alert.alert('Hata', 'Ayetler yuklenirken bir sorun olustu.');
      setVersesLoading(false);
    }
  };

  const playVerse = async (verseNumber: number) => {
    try {
      if (currentVerse === verseNumber) {
        isPlayingAllRef.current = false;
        setIsPlayingAll(false);
        await cleanupAudio();
        return;
      }

      if (isPlayingAllRef.current) {
        isPlayingAllRef.current = false;
        setIsPlayingAll(false);
      }

      await cleanupAudio();

      const verse = surahVerses.find((v) => v.numberInSurah === verseNumber);
      if (!verse) return;

      const audioUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${verse.number}.mp3`;

      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'duckOthers',
      });

      const player = createAudioPlayer(audioUrl);
      playerRef.current = player;

      player.addListener('playbackStatusUpdate', (status: any) => {
        if (status.didJustFinish) {
          cleanupAudio();
        }
      });

      player.play();
      setCurrentVerse(verseNumber);
      scrollToVerse(verseNumber);
    } catch (error) {
      console.error('Ses calma hatasi:', error);
    }
  };

  const playAllVerses = async () => {
    if (isPlayingAllRef.current) {
      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
      await cleanupAudio();
      return;
    }

    if (!selectedSurah || !surahVerses.length) {
      Alert.alert('Hata', 'Lutfen bir sure secin.');
      return;
    }

    isPlayingAllRef.current = true;
    setIsPlayingAll(true);

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'duckOthers',
      });

      for (const verse of surahVerses) {
        if (!isPlayingAllRef.current) break;

        await cleanupAudio();

        const audioUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${verse.number}.mp3`;

        const player = createAudioPlayer(audioUrl);
        playerRef.current = player;

        setCurrentVerse(verse.numberInSurah);
        scrollToVerse(verse.numberInSurah);

        await new Promise<void>((resolve) => {
          player.addListener('playbackStatusUpdate', (status: any) => {
            if (status.didJustFinish) {
              resolve();
            }
          });
          player.play();
        });
      }
    } catch (error) {
      console.error('Ses calma hatasi:', error);
      Alert.alert('Hata', 'Ses calma sirasinda bir hata olustu.');
    } finally {
      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
      await cleanupAudio();
    }
  };

  const scrollToVerse = (verseNumber: number) => {
    const index = surahVerses.findIndex((v) => v.numberInSurah === verseNumber);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.3,
      });
    }
  };

  const handleReciterChange = async (reciterId: string) => {
    await cleanupAudio();
    setSelectedReciter(reciterId);
    setReciterModalVisible(false);
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={styles.surahCard}
      onPress={() => {
        setSelectedSurah(item);
        setIsModalVisible(true);
        fetchSurahVerses(item.number);
      }}
    >
      <View style={styles.surahInfo}>
        <View style={styles.surahNumberContainer}>
          <Text style={styles.surahNumber}>{item.number}</Text>
        </View>
        <View style={styles.surahDetails}>
          <Text style={styles.surahName}>{surahNames[item.number] || item.name}</Text>
          <Text style={styles.surahSubtitle}>
            {item.name} - {item.numberOfAyahs} Ayet
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderVerse = ({ item }: { item: Verse }) => (
    <View style={[styles.verseContainer, currentVerse === item.numberInSurah && styles.activeVerse]}>
      <View style={styles.verseHeader}>
        <TouchableOpacity style={styles.playButton} onPress={() => playVerse(item.numberInSurah)}>
          <Ionicons
            name={currentVerse === item.numberInSurah ? 'stop-circle' : 'play-circle'}
            size={32}
            color="#2E7D32"
          />
        </TouchableOpacity>
        <Text style={styles.verseNumber}>{item.numberInSurah}</Text>
      </View>
      <Text style={[styles.verseText, { fontSize }]}>{item.text}</Text>
      {showTranslation && (
        <Text style={[styles.translationText, { fontSize: fontSize * 0.8 }]}>{item.translation}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kuran-i Kerim</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
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
        <Text style={styles.headerTitle}>Kuran-i Kerim</Text>
        <TouchableOpacity onPress={() => setReciterModalVisible(true)} style={styles.reciterBtn}>
          <Ionicons name="person" size={20} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <FlatList data={surahs} renderItem={renderSurahItem} keyExtractor={(item) => item.number.toString()} />
      </View>

      {/* Surah Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setIsModalVisible(false);
          cleanupAudio();
        }}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
                cleanupAudio();
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#2E7D32" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>{surahNames[selectedSurah?.number || 1]}</Text>
              <Text style={styles.arabicTitle}>{selectedSurah?.name}</Text>
            </View>

            <View style={styles.controlsContainer}>
              <View style={styles.controlRow}>
                <TouchableOpacity style={styles.playAllButton} onPress={playAllVerses}>
                  <Ionicons name={isPlayingAll ? 'stop-circle' : 'play-circle'} size={24} color="#fff" />
                  <Text style={styles.playAllButtonText}>{isPlayingAll ? 'Durdur' : 'Tumunu Oynat'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reciterButton}
                  onPress={() => setReciterModalVisible(true)}
                >
                  <Ionicons name="person" size={20} color="#2E7D32" />
                  <Text style={styles.buttonText}>
                    {reciters.find((r) => r.id === selectedReciter)?.name}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.controlRow}>
                <View style={styles.fontControls}>
                  <TouchableOpacity
                    style={styles.fontButton}
                    onPress={() => setFontSize((prev) => Math.max(16, prev - 2))}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color="#2E7D32" />
                  </TouchableOpacity>
                  <Text style={styles.buttonText}>{fontSize}</Text>
                  <TouchableOpacity
                    style={styles.fontButton}
                    onPress={() => setFontSize((prev) => Math.min(32, prev + 2))}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#2E7D32" />
                  </TouchableOpacity>
                </View>

                <Pressable style={styles.translationToggle} onPress={() => setShowTranslation(!showTranslation)}>
                  <View style={[styles.checkbox, showTranslation && styles.checkboxChecked]}>
                    {showTranslation && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.buttonText}>Meal</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {versesLoading ? (
            <ActivityIndicator size="large" color="#2E7D32" />
          ) : (
            <FlatList
              data={surahVerses}
              renderItem={renderVerse}
              keyExtractor={(item) => item.numberInSurah.toString()}
              contentContainerStyle={styles.versesContainer}
              ref={flatListRef}
              onScrollToIndexFailed={() => {}}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Reciter Modal */}
      <Modal visible={reciterModalVisible} animationType="slide" transparent onRequestClose={() => setReciterModalVisible(false)}>
        <View style={styles.reciterModalContainer}>
          <View style={styles.reciterModalContent}>
            <View style={styles.reciterModalHeader}>
              <Text style={styles.reciterModalTitle}>Hafiz Secimi</Text>
              <Pressable onPress={() => setReciterModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#2E7D32" />
              </Pressable>
            </View>
            {reciters.map((reciter) => (
              <Pressable
                key={reciter.id}
                style={[styles.reciterItem, selectedReciter === reciter.id && styles.selectedReciter]}
                onPress={() => handleReciterChange(reciter.id)}
              >
                <Text style={[styles.reciterName, selectedReciter === reciter.id && styles.selectedReciterText]}>
                  {reciter.name}
                </Text>
                {selectedReciter === reciter.id && <Ionicons name="checkmark" size={24} color="#2E7D32" />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
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
  reciterBtn: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahCard: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 12,
  },
  surahInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  surahNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  surahDetails: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  surahSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  arabicTitle: {
    fontSize: 18,
    color: '#666',
  },
  controlsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
    marginRight: 8,
  },
  playAllButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  reciterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  fontControls: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f7f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    marginRight: 8,
  },
  fontButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  translationToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2E7D32',
  },
  versesContainer: {
    padding: 16,
  },
  verseContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeVerse: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playButton: {
    padding: 4,
  },
  verseNumber: {
    fontSize: 14,
    color: '#666',
  },
  verseText: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    color: '#000',
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginTop: 8,
  },
  reciterModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reciterModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  reciterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reciterModalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  reciterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedReciter: {
    backgroundColor: '#e8f5e9',
  },
  reciterName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedReciterText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});
