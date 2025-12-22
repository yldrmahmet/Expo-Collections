import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';

// Tab bar içerik yüksekliği (sabit)
const TAB_BAR_CONTENT_HEIGHT = 64;

/**
 * Tab Navigator Layout
 * İki sekme: Ana Sayfa (namaz vakitleri) ve Ayarlar
 * SafeArea: Bottom inset otomatik eklenir
 * Dark mode destekli
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  // Tema bazlı renkler
  const colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    border: isDark ? '#333333' : '#E0E0E0',
    active: isDark ? '#4CAF50' : '#2E7D32',
    inactive: isDark ? '#808080' : '#757575',
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Ana Sayfa sekmesi',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Ayarlar sekmesi',
        }}
      />
    </Tabs>
  );
}
