import { Colors, Radius, Shadows, Spacing } from "@/constants/theme";
import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export default function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
});
