import { Colors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

export default function Division() {
  return <View style={styles.division} />;
}

const styles = StyleSheet.create({
  division: {
    height: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.border,
  },
});
