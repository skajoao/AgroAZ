import { Colors, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

interface PressableProps {
  onPress: () => void;
}

export default function Back({ onPress }: PressableProps) {
  return (
    <View style={styles.navigation}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Sair"
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    justifyContent: "flex-start",
  },
  button: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    height: 40,
    width: 40,
    borderWidth: 1,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
