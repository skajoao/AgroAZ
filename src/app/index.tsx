import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        console.log("token não encontrado")
        router.replace("/login");
        return;
      }

      const response = await fetch(`http://${process.env.EXPO_PUBLIC_MYIP}:3000/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("token valido")
        router.replace("/(tabs)");
      } else {
        console.log("token invalido")
        await SecureStore.deleteItemAsync("token");
        router.replace("/login");
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);

      router.replace("/login");
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}