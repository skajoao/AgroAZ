import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View, Button } from "react-native";
import { useRouter } from "expo-router";

import Input from "@/components/Input";

export default function Index() {
  const [email, setEmail] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        style={styles.ilustration}
        source={require("@/assets/logo.png")}
      />

      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Acesse sua conta com email e senha.</Text>
      <Text style={styles.subtitle}>Apenas ilustrativo (Por enquanto)</Text>

      <Input
        label="Digite seu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      ></Input>

      <Input
        label="Digite sua senha"
        value={pwd}
        onChangeText={setPwd}
        keyboardType="default"
        secureTextEntry={!mostrarSenha}
      ></Input>

      <Text
        onPress={() => {
          setMostrarSenha(!mostrarSenha);
        }}
      >
        {mostrarSenha ? "ocultar senha" : "mostrar senha"}
      </Text>
      <View style={styles.containerSub}>
        <Button onPress={() => {
          //router.push("/DashRoute")
        }} title="Entrar"></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
    padding: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  ilustration: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  title: {
    fontSize: 30,
    fontWeight: 900,
  },
  subtitle: {
    fontWeight: 500,
  },
  inputEmail: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  inputPwd: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  containerSub: {
    marginTop: 15,
    width: "50%",
  },
});
