import { Colors, Spacing } from "@/constants/theme";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  style?: ViewStyle;
};

export default function Screen({
  children,
  scroll = false,
  keyboard = false,
  style,
}: Props) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    flexGrow: 1,
  },
});
