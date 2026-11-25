
import * as SecureStore from "expo-secure-store";

const API_URL = `http://${process.env.EXPO_PUBLIC_MYIP}:3000`;

export async function apiRequest(
  rota: string,
  options: RequestInit = {}
) {
  const token = await SecureStore.getItemAsync("token");

  const response = await fetch(`${API_URL}${rota}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
  });

  return response;
}
