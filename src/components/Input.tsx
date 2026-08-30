import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Text,
} from "react-native";

type Props = TextInputProps & { label?: string };

export default function Input({ label, ...props }: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholderTextColor="#999"
        {...props}
      ></TextInput>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    alignItems:"center",
  },
  label: { color: "#353535", marginBottom: 4, fontWeight: "bold" },
  input: {
    width: 300,
    borderWidth: 2,
    borderColor: "#ccc",
    color: "#000000",
    backgroundColor: "#ffff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
