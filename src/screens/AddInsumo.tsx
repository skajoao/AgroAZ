import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, View } from "react-native";

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
      <View style={styles.navigation}>
        <Back />
      </View>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Image source={require("@/assets/insumos.png")} style={styles.icon} />
          <Text style={styles.title}>Adicionar Insumo</Text>
        </View>
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
        <View style={styles.submit}>
          <Button
            title="Adicionar insumo"
            onPress={addInsumo}
            color={Colors.green}
          ></Button>
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

  navigation: {
    justifyContent: "flex-start",
    marginTop: 20,
    width: 90,
  },

  titleContainer: {
    alignItems: "center",
  },

  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
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
    gap: 10,
  },

  title: {
    color: Colors.primary,
    fontSize: 25,
    fontWeight: "bold",
  },
  submit: {},
});
