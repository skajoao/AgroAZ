import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import * as SecureStore from "expo-secure-store";

import Input from "@/components/Input";
import AppButton from "@/components/ui/AppButton";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import { Colors, Spacing } from "@/constants/theme";

export default function Index() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState<string>("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      setMensagem("Preencha o email e a senha.");
      return;
    }

    setCarregando(true);
    setMensagem("");

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            senha,
          }),
        },
      );

      const data: {
        token?: string;
        message?: string;
        usuario?: {
          id: number;
          nome: string;
          email: string;
        };
      } = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMensagem(data.message || "Email ou senha inválidos.");
        return;
      }

      if (!data.token) {
        setMensagem("O servidor não retornou o token.");
        return;
      }

      if (!data.usuario?.id) {
        setMensagem("O servidor não retornou os dados do usuário.");
        return;
      }

      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync("usuarioId", String(data.usuario.id));

      router.replace("/(tabs)");

      router.replace("/(tabs)");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setMensagem("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Screen keyboard>
      <View style={styles.container}>
        <Image style={styles.ilustration} source={require("@/assets/logo.png")} />
        <Text style={styles.brand}>Talhão360</Text>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Acesse sua conta com email e senha.</Text>

        <Card style={styles.card}>
          {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}

          <Input
            label="Digite seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            keyboardType="default"
            secureTextEntry={!mostrarSenha}
          />

          <Pressable
            onPress={() => {
              setMostrarSenha(!mostrarSenha);
            }}
            style={styles.mostrarSenha}
          >
            <Text style={styles.mostrarSenhaText}>
              {mostrarSenha ? "ocultar senha" : "mostrar senha"}
            </Text>
          </Pressable>

          <View style={styles.containerSub}>
            <AppButton
              onPress={handleLogin}
              title={carregando ? "Entrando..." : "Entrar"}
            />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop:30
  },
  ilustration: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: Spacing.sm,
  },
  brand: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: Colors.secondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    fontWeight: "500",
    marginBottom: Spacing.lg,
    color: Colors.textMuted,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
  },
  containerSub: {
    marginTop: Spacing.sm,
    width: "100%",
  },
  mensagem: {
    color: Colors.danger,
    fontWeight: "600",
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  mostrarSenha: {
    alignSelf: "flex-end",
    marginBottom: Spacing.md,
    marginTop: -4,
  },
  mostrarSenhaText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
});
