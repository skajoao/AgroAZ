import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
} from "react-native";

import { db } from "@/database/database";

import Back from "../components/Back";

import Input from "../components/Input";

import * as SecureStore from "expo-secure-store";

import { apiRequest } from "@/services/api";
import AppButton from "@/components/ui/AppButton";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import Screen from "@/components/ui/Screen";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { Spacing } from "@/constants/theme";

export default function AddInsumo() {
  const [nome, setNome] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [recomend, setRecomend] = useState<string>("");
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();

  const addInsumo = async () => {
    if (!nome.trim() || !tipo.trim() || !recomend.trim()) {
      Alert.alert("Campo vazio", "Favor, preencha todos os campos.");
      return;
    }

    const recomendacao = Number(recomend);

    if (!Number.isFinite(recomendacao) || recomendacao < 0) {
      Alert.alert(
        "Erro",
        "A recomendação deve ser um número válido e não negativo.",
      );
      return;
    }

    const usuarioId = await SecureStore.getItemAsync("usuarioId");

    if (!usuarioId) {
      Alert.alert("Erro", "Não foi possível identificar o usuário.");
      return;
    }

    const id = Date.now().toString();

    try {
      // 1. Salva primeiro no SQLite
      await db.runAsync(
        `INSERT INTO insumos
       (_id, usuario_id, nomeIns, tipoIns, recomendIns, sincronizado)
       VALUES (?, ?, ?, ?, ?, 0)`,
        id,
        usuarioId,
        nome.trim(),
        tipo.trim(),
        recomendacao,
      );
    } catch (error) {
      console.log("Erro ao salvar insumo localmente:", error);

      Alert.alert("Erro", "Não foi possível salvar o insumo no celular.");
      return;
    }

    // 2. Tenta enviar o insumo para a API
    try {
      setCarregando(true);
      const response = await apiRequest("/insumos", {
        method: "POST",
        body: JSON.stringify({
          _id: id,
          nomeIns: nome.trim(),
          tipoIns: tipo.trim(),
          recomendIns: recomendacao,
        }),
      });

      if (response.ok) {
        // 3. Marca como sincronizado após a confirmação da API
        await db.runAsync(
          "UPDATE insumos SET sincronizado = 1, servidor_id = ? WHERE _id = ?",
          id,
          id,
        );

        Alert.alert("Sucesso", "Insumo cadastrado");
      } else {
        Alert.alert(
          "Salvo localmente",
          "O insumo foi salvo no celular, mas ainda não foi sincronizado.",
        );
      }
    } catch (error) {
      console.log("Erro ao sincronizar insumo:", error);

      Alert.alert(
        "Salvo localmente",
        "Sem conexão com o servidor. O insumo ficou salvo no celular para sincronização posterior.",
      );
    } finally {
      setCarregando(false);
    }

    setNome("");
    setTipo("");
    setRecomend("");
  };

  return (
    <Screen keyboard>
      <ScreenHeader
        title="Adicionar Insumo"
        subtitle="Cadastre o produto e a recomendação de uso"
        icon={require("@/assets/insumos.png")}
        left={<Back />}
      />
      <Card>
        <View style={styles.content}>
          <Input label="Nome:" value={nome} onChangeText={setNome} />
          <Input
            label="Tipo:"
            placeholder="ex: pós emergente"
            value={tipo}
            onChangeText={setTipo}
          />
          <Input
            label="Recomendação:"
            placeholder="(Kg ou L/Ha)"
            value={recomend}
            onChangeText={setRecomend}
          />
          {carregando && <LoadingState message="Carregando..." />}
          <View style={styles.submit}>
            <AppButton title="Adicionar insumo" onPress={addInsumo} />
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
  },
  submit: {
    marginTop: Spacing.sm,
  },
});
