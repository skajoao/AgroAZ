import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

import * as SecureStore from "expo-secure-store";

import Input from "@/components/Input";

export default function Index() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState<string>("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_MYIP}:3000/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            senha: senha,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync("token", data.token);

        router.replace("/(tabs)");
      } else {
        console.log(data.message);
        setMensagem(data.message);
      }

      console.log(data);
    } catch (err) {
      console.error("Erro ao fazer login", err);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.ilustration} source={require("@/assets/logo.png")} />

      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Acesse sua conta com email e senha.</Text>

      <Text style={styles.mensagem}>{mensagem}</Text>
      <Input
        label="Digite seu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      ></Input>

      <Input
        label="Digite sua senha"
        value={senha}
        onChangeText={setSenha}
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
        <Button onPress={handleLogin} title="Entrar"></Button>
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
    justifyContent: "center",
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
    marginBottom: 10,
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
  mensagem:{
    color: "#eb0a0a"
  }
});
