import { Radius, Spacing } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  color: string;
};

export default function StatusBadge({ label, color }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    alignSelf: "flex-start",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
