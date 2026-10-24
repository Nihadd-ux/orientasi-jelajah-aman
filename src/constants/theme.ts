/**
 * Palet warna aplikasi Jelajah Aman.
 * Setiap warna punya pasangan pada mode terang dan gelap sehingga seluruh
 * layar dapat berubah tema secara dinamis.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    background: '#F4F7FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E2E8F0',
    card: '#FFFFFF',
    border: '#DCE5EF',
    primary: '#1D6FE0',
    primarySoft: '#E6F1FE',
    primaryStrong: '#1554B0',
    accent: '#F59E0B',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    success: '#0F766E',
    successSoft: '#D1FAE5',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    inputBackground: '#FFFFFF',
    tabBar: '#FFFFFF',
    placeholder: '#94A3B8',
    overlay: 'rgba(15, 23, 42, 0.45)',
    shadow: '#0F172A',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    background: '#0B1220',
    backgroundElement: '#121C2E',
    backgroundSelected: '#1E293B',
    card: '#121C2E',
    border: '#243449',
    primary: '#5EB8FF',
    primarySoft: '#12293F',
    primaryStrong: '#8CCBFF',
    accent: '#FBBF24',
    danger: '#F87171',
    dangerSoft: '#3B1518',
    success: '#34D399',
    successSoft: '#0C2B25',
    warning: '#FBBF24',
    warningSoft: '#3A2A0A',
    inputBackground: '#0F1A2B',
    tabBar: '#0F1A2B',
    placeholder: '#64748B',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
  },
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type PaletteWarna = typeof Colors.light;
export type SkemaWarna = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
