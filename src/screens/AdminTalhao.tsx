import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { db } from "@/database/database";

import Back from "@/components/Back";
import Division from "@/components/Division";
import Input from "@/components/Input";

import { Colors } from "@/constants/theme";

export default function AdminTalhao() {
  const { id } = useLocalSearchParams();
  const [talhao, setTalhao] = useState<any>(null);
  const [insumos, setInsumos] = useState<any[]>([]);

  const [insumosSelecionados, setInsumosSelecionados] = useState<string[]>([]);
  const [aplicacoes, setAplicacoes] = useState<any[]>([]);
  const [producao, setProducao] = useState<string>(""); // FIX 2: era null, causava input não-controlado -> controlado
  const [producoes, setProducoes] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("em andamento");
  const [statusColor, setStatusColor] = useState<string>("#f04b4bbf");

  //buscar talhao
  useEffect(() => {
    const buscarTalhaoPorId = async () => {
      try {
        const data = await db.getFirstAsync(
          `SELECT * FROM talhoes WHERE _id = ?`,
          String(id),
        );
        setTalhao(data);
      } catch (err) {
        console.log(err);
      }
    };

    buscarTalhaoPorId();
  }, [id]);

  //buscar produções
  const buscarProducoes = async () => {
    try {
      const data = await db.getAllAsync(
        `SELECT * FROM producoes WHERE talhao_id = ?`,
        String(id),
      );
      setProducoes(data as any[]);
    } catch (err) {
      console.log(err);
    }
  };

  //chamar buscarProducoes
  useEffect(() => {
    buscarProducoes();
  }, [id]);

  //calcular produção
  const areaConcluida = producoes.reduce(
    (total, item) => total + item.areaProduzida,
    0,
  );
  const areaRestante = (talhao?.areaTalhao || 0) - areaConcluida;

  //atualizar status
  useEffect(() => {
    const atualizarStatus = async () => {
      if (!talhao?._id) return;

      const novoStatus = areaRestante <= 0 ? "Concluído" : "Em andamento";

      // FIX 6: evita UPDATE desnecessário no banco quando o status não mudou
      if (novoStatus === status) return;

      setStatus(novoStatus);

      if (novoStatus === "Concluído") {
        setStatusColor("#4ca200");
      } else {
        setStatusColor("#f04b4bbf");
      }

      try {
        await db.runAsync("UPDATE talhoes SET status = ? WHERE _id = ?", [
          novoStatus,
          talhao._id,
        ]);
      } catch (err) {
        console.log("Erro ao atualizar status:", err);
      }
    };

    atualizarStatus();
  }, [areaRestante, talhao?._id]);

  //buscar insumos
  const buscarInsumos = async () => {
    try {
      const data = await db.getAllAsync(`SELECT * FROM insumos`);
      setInsumos(data as any[]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    buscarInsumos();
  }, []);

  //buscar aplicacoes
  const buscarAplicacoes = async () => {
    try {
      const data = await db.getAllAsync(
        `SELECT * FROM aplicacoes WHERE talhao_id = ?`,
        String(id),
      );

      setAplicacoes(data as any[]);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    buscarAplicacoes();
  }, [id]);

  const inserirProducao = async () => {
    await db.runAsync(
      `INSERT INTO producoes (_id, talhao_id, areaProduzida, dataProducao) VALUES (?,?,?,?)`,
      Date.now().toString(),
      String(id),
      Number(producao),
      new Date().toLocaleString(),
    );
    await buscarProducoes();
  };

  const inserirAplicacoes = async () => {
    for (const insumoId of insumosSelecionados) {
      const insumo = insumos.find((i) => i._id === insumoId);

      const quantidade = Number(insumo?.recomendIns || 0) * Number(producao);

      await db.runAsync(
        `INSERT INTO aplicacoes
        (_id, talhao_id, insumo_id, quantidade, dataAplicacao)
        VALUES (?,?,?,?,?)`,
        Date.now().toString() + insumoId,
        String(id),
        insumoId,
        quantidade,
        new Date().toLocaleString(),
      );
    }
    await buscarAplicacoes();
  };

  const registrarProducao = async () => {
    if (!producao) {
      Alert.alert("Campo vazio", "Favor preencher o campo de produção");
      return;
    }

    if (insumosSelecionados.length === 0) {
      Alert.alert("Erro", "Selecione pelo menos um insumo");
      return;
    }

    if (Number(producao) > areaRestante) {
      Alert.alert(
        "Erro",
        "O talhão não possui área suficiente para essa produção",
      );
      return;
    }

    try {
      await inserirProducao();
      await inserirAplicacoes();

      setProducao("");
      setInsumosSelecionados([]);
      Alert.alert("Sucesso", "Produção adicionada com sucesso");
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Não foi possível registrar a produção");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Back />
        <View style={styles.titleContainer}>
          <Image source={require("@/assets/talhao2.png")} style={styles.icon} />
          <Text style={styles.title}>
            Talhão {talhao?.numeroTalhao} / Projeto {talhao?.projetoTalhao}
          </Text>
        </View>
      </View>
      <View style={styles.main}>
        <View style={styles.areaTalhao}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/talhao3.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Área</Text>
          </View>
          <View style={styles.sectionContentContainer}>
            <View style={styles.sectionContentItemTopContainer}>
              <View style={[styles.sectionContentItemTop]}>
                <View style={styles.sectionContentItemTopIcon}>
                  <Image
                    source={require("@/assets/areaTalhao2.png")}
                    style={styles.icon}
                  />
                </View>
                <View style={styles.sectionContentItemTopText}>
                  <Text>Área cadastrada</Text>
                </View>
                <View style={styles.sectionContentItemTopResult}>
                  <Text>{talhao?.areaTalhao} Há</Text>
                </View>
              </View>
              <View
                style={[
                  styles.sectionContentItemTop,
                  {
                    borderRightWidth: 1,
                    borderLeftWidth: 1,
                    padding: 5,
                    borderColor: "#cec9c9",
                  },
                ]}
              >
                <View style={styles.sectionContentItemTopIcon}>
                  <Image
                    source={require("@/assets/concluido.png")}
                    style={styles.icon}
                  />
                </View>
                <View style={styles.sectionContentItemTopText}>
                  <Text>Área concluída</Text>
                </View>
                <View style={styles.sectionContentItemTopResult}>
                  <Text>{areaConcluida} Há</Text>
                </View>
              </View>
              <View style={[styles.sectionContentItemTop]}>
                <View style={styles.sectionContentItemTopIcon}>
                  <Image
                    source={require("@/assets/areaRestante2.png")}
                    style={styles.icon}
                  />
                </View>
                <View style={styles.sectionContentItemTopText}>
                  <Text>Área restante</Text>
                </View>
                <View style={styles.sectionContentItemTopResult}>
                  <Text>{areaRestante.toFixed(2)} Há</Text>
                </View>
              </View>
            </View>
            <View style={styles.sectionContentTextDownContainer}>
              <Text style={styles.text}>Status</Text>
              <Text
                style={[
                  {
                    backgroundColor: statusColor,
                    padding: 10,
                    borderRadius: 10,
                    color: "#fefefe",
                  },
                ]}
              >
                {status}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.insumos}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/insumos.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Insumo(s) aplicado(s)</Text>
          </View>
          {aplicacoes.length > 0 ? (
            insumos.map((insumo) => {
              const total = aplicacoes
                .filter((a) => a.insumo_id === insumo._id)
                .reduce((soma, a) => soma + a.quantidade, 0);

              if (total === 0) return null;

              return (
                <View
                  key={insumo._id}
                  style={styles.sectionContentTextDownContainer}
                >
                  <Text style={[styles.text, { fontWeight: "bold" }]}>
                    {insumo.nomeIns}: {total.toFixed(2)} Kg/L
                  </Text>
                  <Text>aplicados</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.text}>Nenhuma aplicação adicionada</Text>
          )}
        </View>
        <Division />
        <View style={styles.producao}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/producao.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Produção</Text>
          </View>
          <View style={styles.prod}>
            <Input
              label="Adicionar Há"
              value={producao}
              onChangeText={setProducao}
            />
            <View style={styles.sectionTitleContainer}>
              <Image
                source={require("@/assets/adicionar.png")}
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>Adicionar insumos</Text>
            </View>

            {insumos.length > 0 ? (
              insumos.map((insumo) => {
                const selecionado = insumosSelecionados.includes(insumo._id);

                return (
                  <Pressable
                    key={insumo._id}
                    onPress={() => {
                      if (selecionado) {
                        setInsumosSelecionados(
                          insumosSelecionados.filter((id) => id !== insumo._id),
                        );
                      } else {
                        setInsumosSelecionados([
                          ...insumosSelecionados,
                          insumo._id,
                        ]);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.insumoButton,
                      selecionado && styles.insumoButtonSelecionado,
                      pressed && styles.insumoButtonPressed,
                    ]}
                  >
                    <Text style={styles.insumoButtonText}>
                      {selecionado ? "✅" : "🟩"} {insumo.nomeIns}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              <Text>Não há insumos, cadastre os insumos primeiro</Text>
            )}
            <Pressable
              onPress={registrarProducao}
              style={styles.producaoButton}
            >
              <Text style={styles.producaoButtonText}>Adicionar Produção</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.historicoProd}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/historico.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Histórico de produções</Text>
          </View>
          {areaConcluida ? (
            <FlatList
              scrollEnabled={false}
              data={producoes}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.data}>{item.dataProducao}</Text>
                  <Text style={styles.info}>{item.areaProduzida} Há</Text>
                </View>
              )}
            ></FlatList>
          ) : (
            <Text>Ainda não há produções</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginBottom: 10,
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

  main: {
    gap: 1,
  },

  areaTalhao: {
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

  insumos: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  producao: {
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

  addProd: {
    alignItems: "stretch",
    gap: 12,
  },

  historicoProd: {
    marginTop: 20,
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 14,
    marginBottom: 100,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

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

  sectionContentContainer: {
    flexDirection: "column",
    gap: 10,
  },

  text: {
    fontWeight: "500",
    color: "#4b4a4a",
  },

  sectionContentItemTopContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  sectionContentItemTop: {
    alignItems: "center",
    justifyContent: "center",
  },

  sectionContentItemTopIcon: {},

  icon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },

  sectionContentItemTopText: {},

  sectionContentItemTopResult: {},

  sectionContentTextTop: {
    fontSize: 14,
  },

  sectionContentTextDownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },

  sectionContentTextDown: {
    fontSize: 14,
  },

  insumoButton: {
    backgroundColor: "#fefefe",
    borderColor: Colors.primary,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },

  insumoButtonSelecionado: {
    backgroundColor: "rgba(234, 231, 231, 0.93)",
  },

  insumoButtonPressed: {
    opacity: 0.7,
  },

  insumoButtonText: {
    color: Colors.primary,
    fontWeight: "bold",
  },

  producaoButton: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  producaoButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    borderColor: "#000000",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  data: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 6,
  },

  info: {
    fontSize: 14,
    color: "#555",
  },

  prod: {
    gap: 14,
  },
});
