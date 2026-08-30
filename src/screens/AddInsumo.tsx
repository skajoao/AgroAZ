import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

import { db } from "@/database/database";

import Back from "../components/Back";

import Input from "../components/Input";

import { Colors } from "@/constants/theme";

export default function AddInsumo() {
  const [nome, setNome] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [recomend, setRecomend] = useState<string>("");

  const router = useRouter();

  const addInsumo = async () => {
    if (!nome || !tipo || !recomend) {
      Alert.alert("Campo vazio", "Favor, preencha todos os campos");
      return;
    }

    if (isNaN(Number(recomend))) {
      Alert.alert("Erro", "Campo recomendação deve ser um número");
      return;
    }
    const id = Date.now().toString();

    //salva localmente
    try {
      await db.runAsync(
        `INSERT INTO insumos (_id, nomeIns, tipoIns, recomendIns) VALUES (?,?,?,?)`,
        id,
        nome,
        tipo,
        recomend,
      );
    } catch (err) {
      console.log(err);
    }
    setNome("");
    setTipo("");
    setRecomend("");
    Alert.alert("Sucesso", "Insumo cadastrado com sucesso");

  
  };
  return (
      <View style={styles.addInsumoContainer}>
        <Back />
        <View style={styles.content}>
          <Text style={{ marginBottom: 50, fontSize: 20 }}>
            Adicionar Insumo
          </Text>
          <Input label="Nome:" value={nome} onChangeText={setNome} />
          <Input
            label="Tipo (ex: Pós Emergente):"
            value={tipo}
            onChangeText={setTipo}
          />
          <Input
            label="Recomendação (Kg ou L/Ha):"
            value={recomend}
            onChangeText={setRecomend}
          />
          <View style={styles.submit}>
            <Button title="Adicionar insumo" onPress={addInsumo}></Button>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  addInsumoContainer: {
    flex: 1,
    padding: 15,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  submit: {},
});
