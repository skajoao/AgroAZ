import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { db } from "@/database/database";

import { Colors } from "@/constants/theme";

export default function ListTalhoes() {
  const [talhoes, setTalhoes] = useState<any[]>([]);

  const buscarTalhoes = async () => {
    try {
      const data = await db.getAllAsync(
        `SELECT * FROM talhoes ORDER BY dataCriacao DESC`,
      );
      setTalhoes(data as any[]);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarTalhoes();
    }, []),
  );

  //deletar talhao
  const deletarTalhao = async (id: string) => {
    try {
      await db.runAsync(`DELETE FROM talhoes WHERE _id = ?`, id);
    } catch (err) {
      console.log(err);
    }

    await buscarTalhoes();
  };

  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.list}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/talhao2.png")}
            style={[styles.icon, { justifyContent: "center" }]}
          />
          <Text style={styles.title}>Meus talhões</Text>
        </View>

        {talhoes.length === 0 && (
          <Text style={{ marginTop: 60, color: "#555555" }}>
            Nenhum talhão adicionado
          </Text>
        )}
        <Button
          title="Cadastrar talhão"
          color={Colors.green}
          onPress={() => {
            router.push("/addTalhaoRoute");
          }}
        ></Button>
        <FlatList
          scrollEnabled={false}
          data={talhoes}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.projeto}>{item.projetoTalhao}</Text>
              <Text style={styles.info}>Talhão: {item.numeroTalhao}</Text>
              <Text style={styles.info}>Área: {item.areaTalhao} Há</Text>
              <Text
                style={[
                  styles.info,
                  {
                    color: item.status === "Concluído" ? "#4ca200" : "#e91515",
                  },
                ]}
              >
                Status: {item.status}
              </Text>
              <View style={styles.actions}>
                <Button
                  color="#2E7D32"
                  title="Abrir"
                  onPress={() =>
                    router.push({
                      pathname: "/adminTalhaoRoute",
                      params: { id: item._id },
                    })
                  }
                ></Button>
                <Button
                  color="#D32F2F"
                  title="Deletar"
                  onPress={() => deletarTalhao(item._id)}
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

  header:{
    alignItems:"center"
  },

  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },

  list: {
    flex: 1,
    marginBottom:30
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

  projeto: {
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
    justifyContent: "space-between",
    marginTop: 12,
  },
});
