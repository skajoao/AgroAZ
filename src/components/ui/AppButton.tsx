import { Colors, Radius, Spacing } from "@/constants/theme";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        size === "sm" && styles.sm,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "secondary" && styles.textSecondary,
          variant === "ghost" && styles.textGhost,
          size === "sm" && styles.textSm,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  sm: {
    minHeight: 40,
    paddingHorizontal: Spacing.md,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  textSecondary: {
    color: Colors.primary,
  },
  textGhost: {
    color: Colors.primary,
  },
  textSm: {
    fontSize: 14,
  },
});
