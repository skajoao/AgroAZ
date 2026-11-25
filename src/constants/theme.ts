const palette = {
  primary: "#1F4D2B",
  primaryDark: "#16381F",
  secondary: "#5B8C3E",
  accent: "#7FA83F",
  background: "#F3F5F1",
  surface: "#FFFFFF",
  surfaceMuted: "#E8EEE4",
  text: "#1C241E",
  textMuted: "#5C675F",
  border: "#D5DDD2",
  danger: "#C62828",
  success: "#2E7D32",
  warning: "#b65252",
  green: "#5B8C3E",
  greenGray: "#8d9995",
};

export const Colors = {
  ...palette,
  light: palette,
  dark: palette,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Typography = {
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.textMuted,
  },
  section: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  body: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textMuted,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#142018",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};
