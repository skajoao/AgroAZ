import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { View } from "react-native";

import LoadingState from "@/components/ui/LoadingState";
import { Colors } from "@/constants/theme";

export default function Index() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  const verificarAutenticacao = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        console.log("Token não encontrado");
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401 || response.status === 403) {
          console.log("Token inválido ou expirado");

          await SecureStore.deleteItemAsync("token");
          router.replace("/login");
          return;
        }

        console.log("Servidor disponível ou sessão mantida");
        router.replace("/(tabs)");
      } catch (error) {
        console.log("Servidor indisponível. Entrando no modo offline.");

        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      router.replace("/login");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    verificarAutenticacao();
  }, []);

  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <LoadingState message="Preparando o Talhão360..." />
      </View>
    );
  }

  return null;
}
