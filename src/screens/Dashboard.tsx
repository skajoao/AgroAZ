import { useFocusEffect, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as SecureStore from "expo-secure-store";

import { db, initDatabase } from "../database/database";

import { Colors } from "@/constants/theme";
import { useCallback, useEffect, useState } from "react";

import Logout from "@/components/Logout";

export default function Dashboard() {
  const router = useRouter();

  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [aplicacoes, setAplicacoes] = useState<any[]>([]);
  const [talhoesConcluidos, setTalhoesConcluidos] = useState<any[]>([]);
  const [areaTotal, setAreaTotal] = useState<Number>(0);
  const [areaConcluida, setAreaConcluida] = useState<Number>(0);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");

    router.replace("/login");
  };

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
    try {
      const data = await db.getFirstAsync<{ areaTotal: number }>(
        `SELECT SUM(areaTalhao) AS areaTotal FROM talhoes`,
      );
      setAreaTotal(data?.areaTotal || 0);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarAreaTotal();
    }, []),
  );

  //buscar area concluída

  const buscarAreaConcluida = async () => {
    try {
      const data = await db.getFirstAsync<{ areaConcluida: number }>(
        `SELECT SUM(areaProduzida) AS areaConcluida FROM producoes`,
      );
      setAreaConcluida(data?.areaConcluida || 0);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarAreaConcluida();
    }, []),
  );

  //buscar aplicacoes

  const buscarAplicacoes = async () => {
    try {
      const data = await db.getAllAsync(`
      SELECT
        producoes._id,
        producoes.areaProduzida,
        producoes.dataProducao,
        talhoes.projetoTalhao,
        talhoes.numeroTalhao,
        GROUP_CONCAT(DISTINCT insumos.nomeIns) AS insumos
      FROM producoes
      INNER JOIN talhoes
        ON producoes.talhao_id = talhoes._id
      LEFT JOIN aplicacoes
        ON producoes._id = aplicacoes.producao_id
      LEFT JOIN insumos
        ON aplicacoes.insumo_id = insumos._id
      GROUP BY
        producoes._id,
        producoes.areaProduzida,
        producoes.dataProducao,
        talhoes.projetoTalhao,
        talhoes.numeroTalhao
      ORDER BY producoes.dataProducao DESC
    `);

      setAplicacoes(data as any[]);
    } catch (err) {
      console.log("Erro ao buscar histórico:", err);
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
          <Logout onPress={handleLogout} />
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
              {aplicacoes.length > 0 ? (
                <FlatList
                  scrollEnabled={false}
                  data={mostrarTodas ? aplicacoes : aplicacoes.slice(0, 3)}
                  keyExtractor={(item) => item._id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.cardProducoes}>
                      <Text style={styles.data}>{item.dataProducao}</Text>
                      <Text>Projeto: {item.projetoTalhao}</Text>
                      <Text>Talhão: {item.numeroTalhao}</Text>
                      <Text>Insumos: {item.insumos || "Nenhum"}</Text>
                      <Text style={styles.areaProduzida}>
                        {item.areaProduzida} Há
                      </Text>
                    </View>
                  )}
                />
              ) : (
                <Text>Não há produções</Text>
              )}
              {aplicacoes.length > 3 && (
                <Pressable
                  onPress={() => {
                    setMostrarTodas(!mostrarTodas);
                  }}
                  style={styles.mostrarTodasButton}
                >
                  <Text style={styles.mostrarTodasText}>
                    {mostrarTodas ? "Mostrar menos" : "Mostrar todas"}
                  </Text>
                </Pressable>
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
    padding: 10,
  },

  header: {
    marginTop: 15,
  },

  text: {
    textAlign: "center",
  },

  titleContainer: {
    backgroundColor: Colors.secondary,
    alignItems: "center",
    borderRadius: 16,
    padding: 10,
    marginTop: 12,
    marginBottom: 12,

    shadowColor: "#8a5353",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
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
    justifyContent: "space-between",
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
    padding: 5,
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
    backgroundColor: "#fefefe",
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

  mostrarTodasButton: {
    marginTop: 12,
    padding: 10,
    alignItems: "center",
  },

  mostrarTodasText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
});
