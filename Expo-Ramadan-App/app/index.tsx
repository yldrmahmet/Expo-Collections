import { Redirect } from 'expo-router';
import { useCityContext } from '../context';

/**
 * Giriş Noktası
 * City durumuna göre yönlendirme yapar:
 * - City yok → /welcome (tab bar YOK)
 * - City var → /(tabs) (tab bar VAR)
 */
export default function Index() {
  const { city, isLoading } = useCityContext();

  // Yükleniyor - boş ekran (splash screen görünür)
  if (isLoading) {
    return null;
  }

  // Şehir yoksa welcome'a yönlendir
  if (!city) {
    return <Redirect href="/welcome" />;
  }

  // Şehir varsa tabs'a yönlendir
  return <Redirect href="/(tabs)" />;
}
