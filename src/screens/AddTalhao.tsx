import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Back from "@/components/Back";

import { db } from "@/database/database";

import Input from "@/components/Input";
import AppButton from "@/components/ui/AppButton";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import Screen from "@/components/ui/Screen";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { Spacing } from "@/constants/theme";

import { apiRequest } from "@/services/api";
import * as SecureStore from "expo-secure-store";

export default function AddTalhao() {
  const [numeroTalhao, setNumero] = useState<any>(null);
  const [areaTalhao, setArea] = useState<any>(null);
  const [projeto, setProjeto] = useState<string>("");
  const [res, setRes] = useState<string>("");
  const [carregando, setCarregando] = useState(false);

  const addTalhao = async () => {
    if (!projeto || !numeroTalhao || !areaTalhao) {
      Alert.alert("Campo vazio", "Favor, preencha todos os campos");
      return;
    }

    if (
      isNaN(Number(numeroTalhao)) ||
      isNaN(Number(areaTalhao)) ||
      Number(areaTalhao) <= 0
    ) {
      Alert.alert("Erro", "Informe números válidos e uma área maior que zero");
      return;
    }

    const usuarioId = await SecureStore.getItemAsync("usuarioId");

    if (!usuarioId) {
      Alert.alert("Erro", "Faça login novamente para cadastrar o talhão.");
      return;
    }

    const id = Date.now().toString();
    const dataCriacao = new Date().toISOString();

    try {
      //Salva primeiro no SQLite.
      await db.runAsync(
        `INSERT INTO talhoes
      (_id, usuario_id, projetoTalhao, numeroTalhao,
       areaTalhao, status, dataCriacao, sincronizado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        usuarioId,
        projeto,
        String(numeroTalhao),
        Number(areaTalhao),
        "Em andamento",
        dataCriacao,
        0,
      );

      //Tenta enviar ao servidor.
      try {
        setCarregando(true);
        const response = await apiRequest("/talhoes", {
          method: "POST",
          body: JSON.stringify({
            _id: id,
            projetoTalhao: projeto,
            numeroTalhao: String(numeroTalhao),
            areaTalhao: Number(areaTalhao),
            status: "Em andamento",
            dataCriacao,
          }),
        });

        if (response.ok) {
          //Marca como sincronizado.
          await db.runAsync(
            "UPDATE talhoes SET sincronizado = 1 WHERE _id = ? AND usuario_id = ?",
            id,
            usuarioId,
          );
        } else {
          const erro = await response.text();
          console.error("Erro ao sincronizar talhão:", response.status, erro);
        }
      } catch (erro) {
        // Sem conexão: o talhão continua salvo no SQLite.
        console.log("Talhão salvo localmente. Sincronização pendente:", erro);
      } finally {
        setCarregando(false);
      }

      setProjeto("");
      setNumero("");
      setArea("");

      Alert.alert(
        "Sucesso",
        "Talhão cadastrado",
      );
    } catch (erro) {
      console.error("Erro ao salvar talhão:", erro);
      Alert.alert("Erro", "Não foi possível salvar o talhão no dispositivo.");
    }
  };
  return (
    <Screen keyboard>
      <ScreenHeader
        title="Adicionar talhão"
        subtitle="Informe o projeto, o número e a área"
        icon={require("@/assets/talhao.png")}
        left={<Back />}
      />
      <Card>
        <View style={styles.content}>
          <Input
            label="Projeto:"
            placeholder="ex: Fazenda Santa Bárbara"
            value={projeto}
            onChangeText={setProjeto}
          />
          <Input
            label="Talhão:"
            placeholder="ex: 1023"
            value={numeroTalhao}
            onChangeText={setNumero}
          />
          <Input
            label="Área em Há:"
            placeholder="ex: 15.22"
            value={areaTalhao}
            onChangeText={setArea}
          />
          {res ? <Text>{res}</Text> : null}
          {carregando && <LoadingState message="Carregando..." />}
          <View style={styles.submit}>
            <AppButton title="Adicionar" onPress={addTalhao} />
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
