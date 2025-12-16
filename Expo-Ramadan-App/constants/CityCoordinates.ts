/**
 * Türkiye 81 İl Koordinatları
 * Namaz vakti hesaplaması için enlem/boylam değerleri
 */

export interface CityCoordinate {
  name: string;
  latitude: number;
  longitude: number;
}

export const cityCoordinates: Record<string, CityCoordinate> = {
  "Adana": { name: "Adana", latitude: 37.0000, longitude: 35.3213 },
  "Adıyaman": { name: "Adıyaman", latitude: 37.7648, longitude: 38.2786 },
  "Afyonkarahisar": { name: "Afyonkarahisar", latitude: 38.7507, longitude: 30.5567 },
  "Ağrı": { name: "Ağrı", latitude: 39.7191, longitude: 43.0503 },
  "Aksaray": { name: "Aksaray", latitude: 38.3687, longitude: 34.0370 },
  "Amasya": { name: "Amasya", latitude: 40.6499, longitude: 35.8353 },
  "Ankara": { name: "Ankara", latitude: 39.9334, longitude: 32.8597 },
  "Antalya": { name: "Antalya", latitude: 36.8969, longitude: 30.7133 },
  "Ardahan": { name: "Ardahan", latitude: 41.1105, longitude: 42.7022 },
  "Artvin": { name: "Artvin", latitude: 41.1828, longitude: 41.8183 },
  "Aydın": { name: "Aydın", latitude: 37.8560, longitude: 27.8416 },
  "Balıkesir": { name: "Balıkesir", latitude: 39.6484, longitude: 27.8826 },
  "Bartın": { name: "Bartın", latitude: 41.6344, longitude: 32.3375 },
  "Batman": { name: "Batman", latitude: 37.8812, longitude: 41.1351 },
  "Bayburt": { name: "Bayburt", latitude: 40.2552, longitude: 40.2249 },
  "Bilecik": { name: "Bilecik", latitude: 40.0567, longitude: 30.0665 },
  "Bingöl": { name: "Bingöl", latitude: 38.8854, longitude: 40.4966 },
  "Bitlis": { name: "Bitlis", latitude: 38.4004, longitude: 42.1095 },
  "Bolu": { name: "Bolu", latitude: 40.7360, longitude: 31.6061 },
  "Burdur": { name: "Burdur", latitude: 37.7203, longitude: 30.2906 },
  "Bursa": { name: "Bursa", latitude: 40.1885, longitude: 29.0610 },
  "Çanakkale": { name: "Çanakkale", latitude: 40.1553, longitude: 26.4142 },
  "Çankırı": { name: "Çankırı", latitude: 40.6013, longitude: 33.6134 },
  "Çorum": { name: "Çorum", latitude: 40.5506, longitude: 34.9556 },
  "Denizli": { name: "Denizli", latitude: 37.7765, longitude: 29.0864 },
  "Diyarbakır": { name: "Diyarbakır", latitude: 37.9144, longitude: 40.2306 },
  "Düzce": { name: "Düzce", latitude: 40.8438, longitude: 31.1565 },
  "Edirne": { name: "Edirne", latitude: 41.6818, longitude: 26.5623 },
  "Elazığ": { name: "Elazığ", latitude: 38.6810, longitude: 39.2264 },
  "Erzincan": { name: "Erzincan", latitude: 39.7500, longitude: 39.5000 },
  "Erzurum": { name: "Erzurum", latitude: 39.9000, longitude: 41.2700 },
  "Eskişehir": { name: "Eskişehir", latitude: 39.7767, longitude: 30.5206 },
  "Gaziantep": { name: "Gaziantep", latitude: 37.0662, longitude: 37.3833 },
  "Giresun": { name: "Giresun", latitude: 40.9128, longitude: 38.3895 },
  "Gümüşhane": { name: "Gümüşhane", latitude: 40.4386, longitude: 39.5086 },
  "Hakkari": { name: "Hakkari", latitude: 37.5833, longitude: 43.7333 },
  "Hatay": { name: "Hatay", latitude: 36.4018, longitude: 36.3498 },
  "Iğdır": { name: "Iğdır", latitude: 39.9167, longitude: 44.0333 },
  "Isparta": { name: "Isparta", latitude: 37.7648, longitude: 30.5566 },
  "İstanbul": { name: "İstanbul", latitude: 41.0082, longitude: 28.9784 },
  "İzmir": { name: "İzmir", latitude: 38.4237, longitude: 27.1428 },
  "Kahramanmaraş": { name: "Kahramanmaraş", latitude: 37.5858, longitude: 36.9371 },
  "Karabük": { name: "Karabük", latitude: 41.2061, longitude: 32.6204 },
  "Karaman": { name: "Karaman", latitude: 37.1759, longitude: 33.2287 },
  "Kars": { name: "Kars", latitude: 40.6167, longitude: 43.1000 },
  "Kastamonu": { name: "Kastamonu", latitude: 41.3887, longitude: 33.7827 },
  "Kayseri": { name: "Kayseri", latitude: 38.7312, longitude: 35.4787 },
  "Kilis": { name: "Kilis", latitude: 36.7184, longitude: 37.1212 },
  "Kırıkkale": { name: "Kırıkkale", latitude: 39.8468, longitude: 33.5153 },
  "Kırklareli": { name: "Kırklareli", latitude: 41.7333, longitude: 27.2167 },
  "Kırşehir": { name: "Kırşehir", latitude: 39.1425, longitude: 34.1709 },
  "Kocaeli": { name: "Kocaeli", latitude: 40.8533, longitude: 29.8815 },
  "Konya": { name: "Konya", latitude: 37.8667, longitude: 32.4833 },
  "Kütahya": { name: "Kütahya", latitude: 39.4167, longitude: 29.9833 },
  "Malatya": { name: "Malatya", latitude: 38.3552, longitude: 38.3095 },
  "Manisa": { name: "Manisa", latitude: 38.6191, longitude: 27.4289 },
  "Mardin": { name: "Mardin", latitude: 37.3212, longitude: 40.7245 },
  "Mersin": { name: "Mersin", latitude: 36.8000, longitude: 34.6333 },
  "Muğla": { name: "Muğla", latitude: 37.2153, longitude: 28.3636 },
  "Muş": { name: "Muş", latitude: 38.9462, longitude: 41.7539 },
  "Nevşehir": { name: "Nevşehir", latitude: 38.6939, longitude: 34.6857 },
  "Niğde": { name: "Niğde", latitude: 37.9667, longitude: 34.6833 },
  "Ordu": { name: "Ordu", latitude: 40.9839, longitude: 37.8764 },
  "Osmaniye": { name: "Osmaniye", latitude: 37.0742, longitude: 36.2478 },
  "Rize": { name: "Rize", latitude: 41.0201, longitude: 40.5234 },
  "Sakarya": { name: "Sakarya", latitude: 40.6940, longitude: 30.4358 },
  "Samsun": { name: "Samsun", latitude: 41.2928, longitude: 36.3313 },
  "Şanlıurfa": { name: "Şanlıurfa", latitude: 37.1591, longitude: 38.7969 },
  "Siirt": { name: "Siirt", latitude: 37.9333, longitude: 41.9500 },
  "Sinop": { name: "Sinop", latitude: 42.0231, longitude: 35.1531 },
  "Şırnak": { name: "Şırnak", latitude: 37.4187, longitude: 42.4918 },
  "Sivas": { name: "Sivas", latitude: 39.7477, longitude: 37.0179 },
  "Tekirdağ": { name: "Tekirdağ", latitude: 40.9833, longitude: 27.5167 },
  "Tokat": { name: "Tokat", latitude: 40.3167, longitude: 36.5500 },
  "Trabzon": { name: "Trabzon", latitude: 41.0015, longitude: 39.7178 },
  "Tunceli": { name: "Tunceli", latitude: 39.1079, longitude: 39.5401 },
  "Uşak": { name: "Uşak", latitude: 38.6823, longitude: 29.4082 },
  "Van": { name: "Van", latitude: 38.4891, longitude: 43.4089 },
  "Yalova": { name: "Yalova", latitude: 40.6500, longitude: 29.2667 },
  "Yozgat": { name: "Yozgat", latitude: 39.8181, longitude: 34.8147 },
  "Zonguldak": { name: "Zonguldak", latitude: 41.4564, longitude: 31.7987 },
};

/**
 * Şehir adına göre koordinat getir
 */
export function getCityCoordinates(cityName: string): CityCoordinate | null {
  return cityCoordinates[cityName] || null;
}

// Öncelikli şehirler (en üstte gösterilecek)
const PRIORITY_CITIES = ['İstanbul', 'Ankara', 'İzmir'];

/**
 * Tüm şehir isimlerini getir
 * İstanbul, Ankara, İzmir en üstte, sonra alfabetik
 */
export function getCityNames(): string[] {
  const allCities = Object.keys(cityCoordinates);
  const otherCities = allCities
    .filter((city) => !PRIORITY_CITIES.includes(city))
    .sort((a, b) => a.localeCompare(b, 'tr'));

  return [...PRIORITY_CITIES, ...otherCities];
}
