import { Colors, Radius, Spacing } from "@/constants/theme";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & { label?: string };

export default function Input({ label, style, onFocus, onBlur, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={Colors.textMuted}
        {...props}
        style={[styles.input, focused && styles.inputFocused, style]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: "100%",
  },
  label: {
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: "600",
    fontSize: 13,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.md,
    fontSize: 15,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: "#FBFDFA",
  },
});
