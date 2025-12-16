import { View, Text, Pressable, Modal, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationSettings as NotificationSettingsType } from '../hooks';

interface NotificationSettingsProps {
  visible: boolean;
  settings: NotificationSettingsType;
  onClose: () => void;
  onToggleNotifications: () => void;
  onTogglePrayer: (prayer: keyof NotificationSettingsType) => void;
}

// Namaz vakitleri listesi
const PRAYER_OPTIONS: { key: keyof NotificationSettingsType; label: string; emoji: string }[] = [
  { key: 'fajr', label: 'İmsak (Sahur)', emoji: '🌙' },
  { key: 'sunrise', label: 'Güneş', emoji: '🌅' },
  { key: 'dhuhr', label: 'Öğle', emoji: '☀️' },
  { key: 'asr', label: 'İkindi', emoji: '🌤️' },
  { key: 'maghrib', label: 'Akşam (İftar)', emoji: '🍽️' },
  { key: 'isha', label: 'Yatsı', emoji: '🌙' },
];

export function NotificationSettings({
  visible,
  settings,
  onClose,
  onToggleNotifications,
  onTogglePrayer,
}: NotificationSettingsProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-divider">
          <Text className="text-2xl font-bold text-text-primary">Bildirim Ayarları</Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full active:bg-gray-100"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Kapat"
          >
            <Ionicons name="close" size={28} color="#1A1A1A" />
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Ana Toggle */}
          <View className="flex-row items-center justify-between p-4 bg-surface rounded-card mb-6">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                <Ionicons
                  name={settings.enabled ? 'notifications' : 'notifications-off'}
                  size={24}
                  color="#2E7D32"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-text-primary">Bildirimler</Text>
                <Text className="text-base text-text-secondary">
                  {settings.enabled ? 'Açık' : 'Kapalı'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={onToggleNotifications}
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={settings.enabled ? '#2E7D32' : '#BDBDBD'}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Bildirimleri aç/kapat"
              accessibilityState={{ checked: settings.enabled }}
            />
          </View>

          {/* Vakit Seçenekleri */}
          {settings.enabled && (
            <View>
              <Text className="text-lg font-semibold text-text-secondary mb-4 px-2">
                Hangi vakitlerde bildirim istersiniz?
              </Text>

              {PRAYER_OPTIONS.map((prayer) => (
                <Pressable
                  key={prayer.key}
                  onPress={() => onTogglePrayer(prayer.key)}
                  className="flex-row items-center justify-between p-4 bg-surface rounded-card mb-2 active:bg-gray-100"
                  accessible={true}
                  accessibilityRole="switch"
                  accessibilityLabel={`${prayer.label} bildirimi`}
                  accessibilityState={{ checked: settings[prayer.key] as boolean }}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-3xl">{prayer.emoji}</Text>
                    <Text className="text-xl text-text-primary">{prayer.label}</Text>
                  </View>
                  <Switch
                    value={settings[prayer.key] as boolean}
                    onValueChange={() => onTogglePrayer(prayer.key)}
                    trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                    thumbColor={settings[prayer.key] ? '#2E7D32' : '#BDBDBD'}
                  />
                </Pressable>
              ))}
            </View>
          )}

          {/* Bilgi Notu */}
          <View className="mt-6 p-4 bg-primary/5 rounded-card">
            <View className="flex-row items-start gap-2">
              <Ionicons name="information-circle" size={24} color="#2E7D32" />
              <Text className="flex-1 text-base text-text-secondary leading-6">
                Bildirimler, seçtiğiniz vakitlerde size hatırlatma gönderir. Bildirimler
                cihazınızda yerel olarak zamanlanır ve internet gerektirmez.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
