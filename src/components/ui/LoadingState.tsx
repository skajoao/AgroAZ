import { Colors, Spacing } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Props = {
  message?: string;
};

export default function LoadingState({ message = "Carregando..." }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  message: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
});
