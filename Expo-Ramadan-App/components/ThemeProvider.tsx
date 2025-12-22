import { View } from 'react-native';
import { vars, useColorScheme } from 'nativewind';
import { ReactNode } from 'react';

/**
 * Light tema CSS değişkenleri
 */
const lightTheme = vars({
  '--color-primary': '#2E7D32',
  '--color-primary-dark': '#1B5E20',
  '--color-primary-light': '#4CAF50',
  '--color-background': '#FFFFFF',
  '--color-surface': '#F5F5F5',
  '--color-surface-elevated': '#FFFFFF',
  '--color-today-bg': '#E8F5E9',
  '--color-text-primary': '#1A1A1A',
  '--color-text-secondary': '#424242',
  '--color-text-muted': '#757575',
  '--color-text-on-primary': '#FFFFFF',
  '--color-divider': '#E0E0E0',
  '--color-border': '#E0E0E0',
  '--color-error': '#D32F2F',
  '--color-success': '#2E7D32',
  '--color-warning': '#FF9800',
});

/**
 * Dark tema CSS değişkenleri
 */
const darkTheme = vars({
  '--color-primary': '#4CAF50',
  '--color-primary-dark': '#2E7D32',
  '--color-primary-light': '#81C784',
  '--color-background': '#121212',
  '--color-surface': '#1E1E1E',
  '--color-surface-elevated': '#2C2C2C',
  '--color-today-bg': '#1B3D1F',
  '--color-text-primary': '#E8E8E8',
  '--color-text-secondary': '#B0B0B0',
  '--color-text-muted': '#808080',
  '--color-text-on-primary': '#FFFFFF',
  '--color-divider': '#333333',
  '--color-border': '#404040',
  '--color-error': '#EF5350',
  '--color-success': '#4CAF50',
  '--color-warning': '#FFB74D',
});

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Tema Provider
 * NativeWind vars() ile CSS değişkenlerini dinamik olarak ayarlar
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[{ flex: 1 }, isDark ? darkTheme : lightTheme]}>
      {children}
    </View>
  );
}
