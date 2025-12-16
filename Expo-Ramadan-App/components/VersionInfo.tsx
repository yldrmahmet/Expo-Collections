import { Text, View } from 'react-native';
import Constants from 'expo-constants';

/**
 * Uygulama versiyonunu gösteren component
 * Version app.json'dan okunur (expo-constants ile)
 * Her commit'te otomatik artırılır (git pre-commit hook)
 */
export function VersionInfo() {
  const version = Constants.expoConfig?.version || '1.0.0';

  return (
    <View className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded">
      <Text className="text-xs text-white">v{version}</Text>
    </View>
  );
}
