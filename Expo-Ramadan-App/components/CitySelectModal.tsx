import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';

interface CitySelectModalProps {
  visible: boolean;
  onClose: () => void;
  onCitySelect: (city: string) => void;
  onLocationDetect: () => void;
  cities: string[];
}

export default function CitySelectModal({
  visible,
  onClose,
  onCitySelect,
  onLocationDetect,
  cities,
}: CitySelectModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Sehir Seciniz</Text>
        <Text style={styles.modalDescription}>
          Namaz vakitlerini goruntulemek icin sehrinizi secin
        </Text>
        <View style={styles.listContainer}>
          <FlatList
            data={cities}
            renderItem={({ item }) => (
              <Pressable
                style={styles.cityItem}
                onPress={() => onCitySelect(item)}
              >
                <Text style={styles.cityText}>{item}</Text>
              </Pressable>
            )}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.choiceButton} onPress={onLocationDetect}>
            <Text style={styles.choiceButtonText}>
              Konumumu Otomatik Tespit Et
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2E7D32',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    paddingHorizontal: 20,
  },
  listContainer: {
    flex: 1,
    marginBottom: 80,
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
  },
  choiceButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },
  choiceButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
