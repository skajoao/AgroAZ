import { useFocusEffect, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { db, initDatabase } from "../database/database";

import { Colors } from "@/constants/theme";
import { useCallback, useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();

  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [producoes, setProducoes] = useState<any[]>([]);
  const [talhoesConcluidos, setTalhoesConcluidos] = useState<any[]>([]);
  const [areaTotal, setAreaTotal] = useState<Number>(0)
  const [areaConcluida, setAreaConcluida] = useState<Number>(0)

  //criar banco de dados (se não houver)
  useEffect(() => {
    initDatabase();
  }, []);

  // Buscar talhões
  const buscarTalhoes = async () => {
    try {
      const data = await db.getAllAsync(
        `SELECT * FROM talhoes ORDER BY numeroTalhao`,
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

  const buscarTalhoesConcluidos = async () => {
    try {
      const data = await db.getAllAsync(`SELECT * FROM talhoes
        WHERE status = 'Concluído'`);
      setTalhoesConcluidos(data as any[]);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarTalhoesConcluidos();
    }, []),
  );

  const buscarAreaTotal = async () => {
    try{
      const data = await db.getFirstAsync<{areaTotal: number}>(`SELECT SUM(areaTalhao) AS areaTotal FROM talhoes`)
      setAreaTotal(data?.areaTotal || 0)
    }catch(err){
      console.log(err)
    }
  }

  useFocusEffect(
    useCallback(() => {
      buscarAreaTotal();
    }, []),
  );

  //buscar area concluída

  const buscarAreaConcluida = async () => {
    try{
      const data = await db.getFirstAsync<{areaConcluida: number}>(`SELECT SUM(areaProduzida) AS areaConcluida FROM producoes`)
      setAreaConcluida(data?.areaConcluida || 0)
    }catch(err){
      console.log(err)
    }
  }

  useFocusEffect(
    useCallback(() => {
      buscarAreaConcluida();
    }, []),
  );
  

  //buscar aplicacoes

  const buscarAplicacoes = async () => {
    try {
      const data = await db.getAllAsync(
        `SELECT producoes._id, talhoes.projetoTalhao, talhoes.numeroTalhao,
          producoes.areaProduzida, producoes.dataProducao FROM producoes INNER JOIN talhoes
          ON producoes.talhao_id = talhoes._id ORDER BY producoes.dataProducao DESC`,
      );
      setProducoes(data as any[]);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarAplicacoes();
    }, []),
  );

  return (
    <ScrollView>
      <View style={styles.dashboardContainer}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Image
              source={require("@/assets/dashboard.png")}
              style={styles.icon}
            />
            <Text style={styles.title}>Olá piloto!</Text>
          </View>
        </View>
        <View style={styles.resumoGeral}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/resumo.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Resumo geral</Text>
          </View>
          <View style={styles.sectionContentContainer}>
            <View style={styles.sectionResumoContentContainer}>
              <View
                style={[
                  styles.sectionResumoItemContainer,
                  { borderRightWidth: 1 },
                ]}
              >
                <View style={styles.sectionResumoItemIcon}>
                  <Image
                    source={require("@/assets/talhao2.png")}
                    style={styles.icon}
                  />
                </View>
                <View style={styles.sectionResumoItemText}>
                  <Text style={styles.text}>Talhôes</Text>
                </View>
                <View style={styles.sectionResumoItemResult}>
                  <Text>{talhoes.length}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.sectionResumoItemContainer,
                  { borderLeftWidth: 1 },
                ]}
              >
                <View style={styles.sectionResumoItemIcon}>
                  <Image
                    source={require("@/assets/concluido.png")}
                    style={styles.icon}
                  />
                </View>
                <View style={styles.sectionResumoItemText}>
                  <Text style={styles.text}>Concluídos</Text>
                </View>
                <View style={styles.sectionResumoItemResult}>
                  <Text>{talhoesConcluidos.length}</Text>
                </View>
              </View>
            </View>
            <View style={styles.sectionResumoContentContainer}>
              <View
                style={[
                  styles.sectionResumoItemContainer,
                  { borderTopWidth: 1, borderRightWidth: 1 },
                ]}
              >
                <View style={styles.sectionResumoItemIcon}>
                  <Image
                    source={require("@/assets/areaTalhao.png")}
                    style={styles.icon}
                  />
                </View>
                <View style={styles.sectionResumoItemText}>
                  <Text style={styles.text}>Área total</Text>
                </View>
                <View style={styles.sectionResumoItemResult}>
                  <Text>{areaTotal.toFixed(2)} há</Text>
                </View>
              </View>
              <View
                style={[
                  styles.sectionResumoItemContainer,
                  { borderLeftWidth: 1, borderTopWidth: 1 },
                ]}
              >
                <View style={styles.sectionResumoItemIcon}>
                  <Image
                    source={require("@/assets/concluido2.png")}
                    style={styles.icon}
                  />
                </View>
                <View style={styles.sectionResumoItemText}>
                  <Text style={styles.text}>Área concluída</Text>
                </View>
                <View style={styles.sectionResumoItemResult}>
                  <Text>{areaConcluida.toFixed(2)} há</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.aplicacoesRecentes}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/recentes.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Aplicações recentes</Text>
          </View>
          <View>
            <View style={styles.historicoProd}>
              {producoes.length > 0 ? (
                <FlatList
                  scrollEnabled={false}
                  data={producoes}
                  keyExtractor={(item) => item._id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.cardProducoes}>
                      <Text style={styles.data}>{item.dataProducao}</Text>
                      <Text>Projeto: {item.projetoTalhao}</Text>
                      <Text>Talhão: {item.numeroTalhao}</Text>
                      <Text style={styles.areaProduzida}>
                        {item.areaProduzida} Há
                      </Text>
                    </View>
                  )}
                ></FlatList>
              ) : (
                <Text>Não há produções</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginTop: 15,
  },

  text: {
    textAlign: "center",
  },

  titleContainer: {
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginVertical: 16,
  },

  resumoGeral: {
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: "#9e2d2d",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  aplicacoesRecentes: {
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: "#9e2d2d",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  sectionContentContainer: {
    alignItems: "center",
  },

  sectionResumoContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionResumoItemContainer: {
    width: 120,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },

  sectionResumoItemIcon: {},

  sectionResumoItemText: {},

  sectionResumoItemResult: {},

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,

    shadowColor: "#8a5353",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 10,
  },

  historicoProd: {},

  cardProducoes: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    borderColor: Colors.greenGray,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  resumoConteudo: {},

  sectionTitleContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
  },

  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },

  data: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 6,
  },

  areaProduzida: {
    fontSize: 14,
    color: "#555",
  },
});
