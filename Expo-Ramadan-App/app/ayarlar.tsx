import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from './_layout';

export default function AyarlarScreen() {
  const { cityName } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const openLocationModal = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konum</Text>
          <TouchableOpacity style={styles.settingItem} onPress={openLocationModal}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={24} color="#2E7D32" />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sehir</Text>
                <Text style={styles.settingValue}>{cityName || 'Secilmedi'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color="#2E7D32" />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Namaz Vakti Bildirimleri</Text>
                <Text style={styles.settingDescription}>Her namaz vaktinde bildirim al</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ddd', true: '#81C784' }}
              thumbColor={notificationsEnabled ? '#2E7D32' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkinda</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#2E7D32" />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Uygulama Versiyonu</Text>
                <Text style={styles.settingValue}>1.0.1</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Linking.openURL('mailto:support@ramazanrehberi.com')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={24} color="#2E7D32" />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Geri Bildirim</Text>
                <Text style={styles.settingDescription}>Bize yazin</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ramazan Rehberi</Text>
          <Text style={styles.footerSubtext}>2025 - Tum haklar saklidir</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    paddingVertical: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
