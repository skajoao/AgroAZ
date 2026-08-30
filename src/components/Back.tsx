import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View, Text,Image } from "react-native";

import { Colors } from "@/constants/theme";

export default function Back() {
  const router = useRouter();
  return (
    <View style={styles.navigation}>
      <Pressable onPress={() => router.back()} style={styles.button}>
        <Text style={styles.buttonText}><Image source={require("@/assets/voltar.png")} style={styles.icon}/></Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    justifyContent: "flex-start",
    marginTop: 20,
    width: 90,
  },

  button: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary,
    height:30,
    borderWidth:1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  icon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
});
