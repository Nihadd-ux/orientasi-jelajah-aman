/**
 * Hook warna aktif. Sekarang membaca tema dari PenyediaTema sehingga
 * pilihan Terang / Gelap / Ikuti Sistem langsung berlaku di seluruh layar.
 */

import { useTema } from '@/contexts/tema-context';

export function useTheme() {
  return useTema().colors;
}
