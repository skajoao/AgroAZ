import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image
} from "react-native";

import { db } from "@/database/database";

import { Colors } from "@/constants/theme";

export default function ListInsumos() {
  const [insumos, setInsumos] = useState<any[]>([]);

  const buscarInsumos = async () => {
    const data = await db.getAllAsync(`SELECT * FROM insumos`);

    setInsumos(data);

    //API
    /*try {
      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_MYIP}:3000/apiDrone/insumos`
      );

      const data = await response.json();
      setInsumos(data);
    } catch (err) {
      console.log("erro ao buscar", err);
    }*/
  };

  useFocusEffect(
    useCallback(() => {
      buscarInsumos();
    }, []),
  );

  //deletar insumo
  const deletarInsumo = async (id: string) => {
    try {
      await db.runAsync(`DELETE FROM insumos WHERE _id = ? `, id);
    } catch (err) {
      console.log(err);
    }
    await buscarInsumos();
  };

  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.list}>
        <View style={styles.header}>
          <Image source={require("@/assets/insumos.png")} style={styles.icon}/>
          <Text style={styles.title}>Insumos</Text>
        </View>
        {insumos.length === 0 && (
          <View>
            <Text style={{ marginTop: 60, color: "#555555" }}>
              Nenhum insumo cadastrado
            </Text>
          </View>
        )}
        <Button
          title="Cadastrar Insumo"
          color={Colors.green}
          onPress={() => {
            router.push("/addInsumoRoute");
          }}
        ></Button>
        <FlatList
          scrollEnabled={false}
          data={insumos}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>{item.nomeIns}</Text>
              <Text style={styles.info}>{item.tipoIns}</Text>
              <Text style={styles.info}>{item.recomendIns} Kg/L Há</Text>
              <View style={styles.actions}>
                <Button
                  title="Deletar"
                  color="#D32F2F"
                  onPress={() => deletarInsumo(item._id)}
                ></Button>
              </View>
            </View>
          )}
        ></FlatList>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },

  list: {
    flex: 1,
    marginBottom:30
  },

  header:{
    alignItems:"center"
  },

  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginVertical: 20,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  nome:{
    fontSize: 18,
    fontWeight: "900",
    color: "#2E7D32",
    marginBottom: 8,
  },

  info: {
    fontSize: 15,
    color: "#555",
    marginBottom: 4,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
});
