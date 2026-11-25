import { Colors, Radius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export default function Back() {
  const router = useRouter();
  return (
    <View style={styles.navigation}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <Ionicons name="chevron-back" size={22} color={Colors.primary} />
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
