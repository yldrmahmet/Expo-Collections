import { useState, useCallback, useMemo } from 'react';
import { MONTHS_TR } from '../constants';
import type { MonthYear } from './usePrayerTimes';

/**
 * Ay navigasyonu için hook
 * Önceki/sonraki ay geçişleri ve bugüne dönüş işlemlerini yönetir
 */
export function useMonthNavigation() {
  const today = useMemo(() => new Date(), []);

  const [selectedMonth, setSelectedMonth] = useState<MonthYear>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  // Şu anki ay mı kontrol et
  const isCurrentMonth = useMemo(() => {
    return (
      selectedMonth.year === today.getFullYear() &&
      selectedMonth.month === today.getMonth()
    );
  }, [selectedMonth, today]);

  // Görüntülenen ay/yıl metni
  const displayText = useMemo(() => {
    return `${MONTHS_TR[selectedMonth.month]} ${selectedMonth.year}`;
  }, [selectedMonth]);

  // Önceki aya git
  const goToPreviousMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  }, []);

  // Sonraki aya git
  const goToNextMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  }, []);

  // Bugüne dön
  const goToToday = useCallback(() => {
    const now = new Date();
    setSelectedMonth({
      year: now.getFullYear(),
      month: now.getMonth(),
    });
  }, []);

  return {
    selectedMonth,
    isCurrentMonth,
    displayText,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  };
}
