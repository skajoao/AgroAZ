import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

import { db } from "@/database/database";

import Input from "@/components/Input";

export default function AddTalhao() {
  const [numeroTalhao, setNumero] = useState<any>(null);
  const [areaTalhao, setArea] = useState<any>(null);
  const [projeto, setProjeto] = useState<string>("");
  const [res, setRes] = useState<string>("");
  const router = useRouter();

  const addTalhao = async () => {
    if (!projeto || !numeroTalhao || !areaTalhao) {
      Alert.alert("campo vazio", "Favor, preencha todos os campos");
      return;
    }

    if (isNaN(Number(numeroTalhao))) {
      Alert.alert("Erro", "Projeto e talhão devem ser números");
      return;
    }
    try {
      const id = Date.now().toString();
      //salva localmente
      await db.runAsync(
        `INSERT INTO talhoes (_id, projetoTalhao, numeroTalhao, areaTalhao, dataCriacao) VALUES (?,?,?,?,?)`,
        id,
        projeto,
        Number(numeroTalhao),
        Number(areaTalhao),
        Date.now().toString(),
      );
    } catch (err) {
      console.log(err);
      return;
    }

    setProjeto("");
    setNumero("");
    setArea("");
    Alert.alert("Sucesso", "Talhão salvo com sucesso");

  };
  return (
    <View style={styles.addTalhaoContainer}>
      <View style={styles.navigation}>
        <Button
          title="Voltar"
          onPress={() => {
            router.back();
          }}
        ></Button>
      </View>
      <View style={styles.content}>
        <Text style={{ marginBottom: 50, fontSize: 20 }}>Adicionar talhão</Text>
        <Input
          label="Projeto:"
          value={projeto}
          onChangeText={setProjeto}
        ></Input>
        <Input
          label="Talhão:"
          placeholder="ex: 1023"
          value={numeroTalhao}
          onChangeText={setNumero}
        ></Input>
        <Input
          label="Área em Há:"
          placeholder="ex: 15.22"
          value={areaTalhao}
          onChangeText={setArea}
        ></Input>
        {res && <Text>{res}</Text>}
        <View style={styles.submit}>
          <Button title="Adicionar" onPress={addTalhao}></Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addTalhaoContainer: {
    flex: 1,
    padding: 15,
  },
  submit: {
    marginTop: 15,
  },
  navigation: {
    justifyContent: "flex-start",
    marginTop: 20,
    width: 90,
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
});
