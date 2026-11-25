import { useFocusEffect, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as SecureStore from "expo-secure-store";

import { db, initDatabase } from "../database/database";

import { Colors, Spacing } from "@/constants/theme";
import { useCallback, useEffect, useState } from "react";

import Logout from "@/components/Logout";

import { sincronizarTalhoesPendentes } from "@/services/sincronizarTalhoes";

import { baixarTalhoesDoServidor } from "@/services/baixarTalhoesDoServidor";

import { sincronizarTalhoesExcluidos } from "@/services/sincronizarTalhoesExcluidos";

import { baixarProducoesDoServidor } from "@/services/baixarProducoesDoServidor";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Screen from "@/components/ui/Screen";
import ScreenHeader from "@/components/ui/ScreenHeader";
import StatTile from "@/components/ui/StatTile";
import { baixarAplicacoesDoServidor } from "@/services/baixarAplicacoesDoServidor";

export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [nomeUsuario, setNomeUsuario] = useState<string>("");
  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [aplicacoes, setAplicacoes] = useState<any[]>([]);
  const [talhoesConcluidos, setTalhoesConcluidos] = useState<any[]>([]);
  const [areaTotal, setAreaTotal] = useState<Number>(0);
  const [areaConcluida, setAreaConcluida] = useState<Number>(0);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const verificarSessao = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_MYIP}:3000/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        await SecureStore.deleteItemAsync("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        console.error("Erro ao validar sessão:", response.status);
        return;
      }

      const data = await response.json();
      setUsuario(data.usuario ?? data);
      setNomeUsuario(data.usuario.nome)
      console.log("Usuário autenticado:", data.usuario);
    } catch (err) {
      console.error("Erro ao verificar sessão:", err);
    }
  };

  useEffect(() => {
    verificarSessao();
  }, []);

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
      const carregarTalhoes = async () => {
        setCarregando(true);

        try {
          // 1. Mostra os dados disponíveis localmente
          await buscarTalhoes();

          // 2. Envia as exclusões pendentes ao servidor
          await sincronizarTalhoesExcluidos();

          // 3. Envia os talhões pendentes ao servidor
          await sincronizarTalhoesPendentes();

          // 4. Baixa os talhões que estão no servidor
          await baixarTalhoesDoServidor();

          // 5. Atualiza a tela
          await buscarTalhoes();

          // 6. Baixa as produções do servidor
          await baixarProducoesDoServidor();

          // 7. Baixa as aplicações do servidor
          await baixarAplicacoesDoServidor();
        } finally {
          setCarregando(false);
        }
      };

      carregarTalhoes();
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
    <Screen scroll>
      <View style={styles.dashboardContainer}>
        <ScreenHeader
          title={usuario?.nome ? `Olá, ${nomeUsuario}!` : "Olá Aplicador!"}
          subtitle="Acompanhe a operação dos talhões"
          icon={require("@/assets/dashboard.png")}
          right={<Logout onPress={handleLogout} />}
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/resumo.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Resumo geral</Text>
          </View>
          <View style={styles.sectionResumoContentContainer}>
            <StatTile
              label="Talhôes"
              value={talhoes.length}
              icon={require("@/assets/talhao2.png")}
            />
            <StatTile
              label="Concluídos"
              value={talhoesConcluidos.length}
              icon={require("@/assets/concluido.png")}
            />
            <StatTile
              label="Área total"
              value={`${areaTotal.toFixed(2)} há`}
              icon={require("@/assets/areaTalhao.png")}
            />
            <StatTile
              label="Área concluída"
              value={`${areaConcluida.toFixed(2)} há`}
              icon={require("@/assets/concluido2.png")}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Image
              source={require("@/assets/recentes.png")}
              style={styles.icon}
            />
            <Text style={styles.sectionTitle}>Aplicações recentes</Text>
          </View>
          <View style={styles.historicoProd}>
            {carregando && aplicacoes.length === 0 ? (
              <LoadingState message="Atualizando aplicações..." />
            ) : aplicacoes.length > 0 ? (
              <FlatList
                scrollEnabled={false}
                data={mostrarTodas ? aplicacoes : aplicacoes.slice(0, 3)}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.cardProducoes}>
                    <Text style={styles.data}>{item.dataProducao}</Text>
                    <Text style={styles.info}>
                      Projeto: {item.projetoTalhao}
                    </Text>
                    <Text style={styles.info}>Talhão: {item.numeroTalhao}</Text>
                    <Text style={styles.info}>
                      Insumos: {item.insumos || "Nenhum"}
                    </Text>
                    <Text style={styles.areaProduzida}>
                      {item.areaProduzida} Há
                    </Text>
                  </View>
                )}
              />
            ) : (
              <EmptyState
                title="Não há produções"
                description="As aplicações recentes aparecerão aqui."
                icon="analytics-outline"
              />
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
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    gap: Spacing.md,
  },
  sectionCard: {
    marginBottom: Spacing.sm,
  },
  sectionResumoContentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  historicoProd: {},
  cardProducoes: {
    backgroundColor: Colors.surfaceMuted,
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
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
  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
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
    marginBottom: 2,
  },
  areaProduzida: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
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
