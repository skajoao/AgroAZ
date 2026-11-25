import { Colors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function EmptyState({
  title,
  description,
  icon = "leaf-outline",
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={Colors.secondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
