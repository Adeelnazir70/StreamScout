import { Platform } from 'react-native';

export const isTV = Platform.isTV;

export const colors = {
  background: '#0E1116',
  surface: '#181C24',
  surfaceFocused: '#262C3A',
  border: '#2A3040',
  text: '#F2F4F8',
  textMuted: '#9AA3B2',
  accent: '#F5B82E',
  danger: '#E5484D',
};

// TV is viewed from a couch, so everything gets bigger.
const scale = isTV ? 1.5 : 1;

export const spacing = {
  xs: 4 * scale,
  sm: 8 * scale,
  md: 12 * scale,
  lg: 16 * scale,
  xl: 24 * scale,
};

export const fontSize = {
  sm: 12 * scale,
  md: 14 * scale,
  lg: 18 * scale,
  xl: 24 * scale,
  xxl: 30 * scale,
};
