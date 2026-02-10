/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const ThemeColors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// 하위 호환성을 위한 별칭 (deprecated - ThemeColors 사용 권장)
export const Colors = ThemeColors;

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Design System - 재사용 가능한 디자인 토큰
export const COLORS = {
  primary: "#FF2D78",
  background: "#FFFFFF",
  text: "#111111",
  textSecondary: "#333333",
  gray: "#888888",
  lightGray: "#F4F4F4",
  imagePlaceholder: "#f0f0f0",
  lightPink: "#FFD6E5",
  paleRose: "#FFF0F5",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.3)",
  overlayDark: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.2)",
  whiteTransparent: "rgba(255, 255, 255, 0.3)",
  whiteAlpha: "rgba(255, 255, 255, 0.9)",
  skeletonBase: "#E0E0E0",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  huge: 40,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 30,
  xxxl: 30,
  round: 999,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 11,
  md: 12,
  base: 13,
  lg: 15,
  xl: 16,
  xxl: 18,
  xxxl: 20,
};

export const FONT_WEIGHT = {
  regular: "400" as const,
  medium: "600" as const,
  semibold: "700" as const,
  bold: "800" as const,
};

export const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  modalIcon: 48,
};

// 공통 스타일 패턴
export const shadowStyle = Platform.select({
  ios: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  android: {
    elevation: 5,
  },
});

export const modalShadowStyle = Platform.select({
  ios: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  android: {
    elevation: 5,
  },
});
