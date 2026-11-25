import * as SecureStore from "expo-secure-store";

import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { db } from "@/database/database";

import Back from "@/components/Back";
import Division from "@/components/Division";
import Input from "@/components/Input";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Screen from "@/components/ui/Screen";
import ScreenHeader from "@/components/ui/ScreenHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import StatTile from "@/components/ui/StatTile";

import { Colors, Spacing } from "@/constants/theme";

import { Ionicons } from "@expo/vector-icons";

import { sincronizarAplicacoesPendentes } from "@/services/sincronizarAplicacoes";
import { sincronizarInsumosPendentes } from "@/services/sincronizarInsumos";
import { sincronizarProducoesPendentes } from "@/services/sincronizarProducoes";
import { sincronizarTalhoesPendentes } from "@/services/sincronizarTalhoes";

export default function AdminTalhao() {
  const { id } = useLocalSearchParams();
  const [talhao, setTalhao] = useState<any>(null);
  const [insumos, setInsumos] = useState<any[]>([]);

  const [insumosSelecionados, setInsumosSelecionados] = useState<string[]>([]);
  const [aplicacoes, setAplicacoes] = useState<any[]>([]);
  const [producao, setProducao] = useState<string>("");
  const [producoes, setProducoes] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("em andamento");
  const [statusColor, setStatusColor] = useState<string>("#e91515");
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    buscarUsuarioId();
  }, []);

  async function buscarUsuarioId() {
    const token = await SecureStore.getItemAsync("token");

    if (!token) return;

    const response = await fetch(
      `http://${process.env.EXPO_PUBLIC_MYIP}:3000/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) return;

    const data = await response.json();
    const usuario = data.usuario ?? data;

    setUsuarioId(usuario.id);
  }

  //sincronização de talhão e produção
  useFocusEffect(
    useCallback(() => {
      async function sincronizarDados() {
        await sincronizarTalhoesPendentes();
        await sincronizarProducoesPendentes();
      }

      sincronizarDados();
    }, []),
  );

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
        setStatusColor(Colors.success);
      } else {
        setStatusColor(Colors.warning);
      }

      try {
        await db.runAsync("UPDATE talhoes SET status = ?, sincronizado = 0 WHERE _id = ?", [
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
    const producaoId = Date.now().toString();

    await db.runAsync(
      `INSERT INTO producoes
      (_id, servidor_id, usuario_id, talhao_id, areaProduzida, dataProducao)
      VALUES (?, NULL, ?, ?, ?, ?)`,
      producaoId,
      String(usuarioId),
      String(id),
      Number(producao),
      new Date().toLocaleString(),
    );

    return producaoId;
  };

  const inserirAplicacoes = async (producaoId: string) => {
    for (const insumoId of insumosSelecionados) {
      const insumo = insumos.find((i) => i._id === insumoId);

      const quantidade = Number(insumo?.recomendIns || 0) * Number(producao);

      await db.runAsync(
        `INSERT INTO aplicacoes
        (_id, servidor_id, usuario_id, talhao_id, producao_id, insumo_id, quantidade, dataAplicacao)
        VALUES (?, NULL, ?, ?, ?, ?, ?, ?)`,
        Date.now().toString() + insumoId,
        String(usuarioId),
        String(id),
        producaoId,
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

    if (!usuarioId) {
      Alert.alert("Erro", "Não foi possível identificar o usuário.");
      return;
    }

    try {
      const producaoId = await inserirProducao();

      await inserirAplicacoes(producaoId);

      await sincronizarTalhoesPendentes();
      await sincronizarInsumosPendentes();
      await sincronizarProducoesPendentes();
      await sincronizarAplicacoesPendentes();

      await buscarProducoes();

      setProducao("");
      setInsumosSelecionados([]);

      Alert.alert("Sucesso", "Produção adicionada com sucesso");
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Não foi possível registrar a produção");
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title={`Talhão ${talhao?.numeroTalhao ?? ""}`}
        subtitle={`Projeto ${talhao?.projetoTalhao ?? ""}`}
        icon={require("@/assets/talhao2.png")}
        left={<Back />}
      />
      <View style={styles.main}>
        <Card>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/talhao3.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Área</Text>
          </View>
          <View style={styles.sectionContentItemTopContainer}>
            <StatTile
              label="Área cadastrada"
              value={`${talhao?.areaTalhao ?? 0} Há`}
              icon={require("@/assets/areaTalhao2.png")}
            />
            <StatTile
              label="Área concluída"
              value={`${areaConcluida} Há`}
              icon={require("@/assets/concluido.png")}
            />
            <StatTile
              label="Área restante"
              value={`${areaRestante.toFixed(2)} Há`}
              icon={require("@/assets/areaRestante2.png")}
            />
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.text}>Status</Text>
            <StatusBadge label={status} color={statusColor} />
          </View>
        </Card>

        <Card>
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
                  style={styles.aplicacaoItem}
                >
                  <Text style={styles.aplicacaoNome}>{insumo.nomeIns}</Text>
                  <Text style={styles.aplicacaoValor}>
                    {total.toFixed(2)} Kg/L aplicados
                  </Text>
                </View>
              );
            })
          ) : (
            <EmptyState
              title="Nenhuma aplicação adicionada"
              icon="water-outline"
            />
          )}
        </Card>

        <Division />

        <Card>
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
                    <View style={styles.insumoButtonContent}>
                      <Ionicons
                        name={selecionado ? "checkbox" : "square-outline"}
                        size={22}
                        color={Colors.primary}
                      />

                      <Text style={styles.insumoButtonText}>
                        {insumo.nomeIns}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <EmptyState
                title="Não há insumos, cadastre os insumos primeiro"
                icon="flask-outline"
              />
            )}
            <Pressable
              onPress={registrarProducao}
              style={({ pressed }) => [
                styles.producaoButton,
                pressed && styles.insumoButtonPressed,
              ]}
            >
              <Text style={styles.producaoButtonText}>Adicionar Produção</Text>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.historicoProd}>
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
            />
          ) : (
            <EmptyState title="Ainda não há produções" icon="time-outline" />
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  main: {
    gap: Spacing.md,
    paddingBottom: 40,
  },
  historicoProd: {
    marginBottom: 40,
  },
  sectionTitleContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  text: {
    fontWeight: "600",
    color: Colors.textMuted,
  },
  sectionContentItemTopContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  aplicacaoItem: {
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  aplicacaoNome: {
    fontWeight: "700",
    color: Colors.text,
  },
  aplicacaoValor: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  insumoButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  insumoButtonSelecionado: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.primary,
  },
  insumoButtonPressed: {
    opacity: 0.7,
  },
  insumoButtonText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  insumoButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  producaoButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  producaoButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: Colors.surfaceMuted,
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  data: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.success,
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  prod: {
    gap: 14,
  },
});
