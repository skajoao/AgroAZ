import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { db } from "@/database/database";

import { Colors, Spacing } from "@/constants/theme";

import { sincronizarTalhoesPendentes } from "@/services/sincronizarTalhoes";

import { baixarTalhoesDoServidor } from "@/services/baixarTalhoesDoServidor";

import { sincronizarTalhoesExcluidos } from "@/services/sincronizarTalhoesExcluidos";

import { baixarProducoesDoServidor } from "@/services/baixarProducoesDoServidor";

import { baixarAplicacoesDoServidor } from "@/services/baixarAplicacoesDoServidor";
import AppButton from "@/components/ui/AppButton";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Screen from "@/components/ui/Screen";
import ScreenHeader from "@/components/ui/ScreenHeader";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ListTalhoes() {
  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  //deletar talhao

  const deletarTalhao = async (id: string) => {
    try {
      // Verifica se o talhão já foi sincronizado com o servidor.
      const talhao = await db.getFirstAsync<{
        sincronizado: number;
        usuario_id: string;
      }>("SELECT sincronizado, usuario_id FROM talhoes WHERE _id = ?", id);

      if (Number(talhao?.sincronizado) === 1 && talhao?.usuario_id) {
        await db.runAsync(
          `INSERT OR IGNORE INTO talhoes_excluidos
     (talhao_id, usuario_id)
     VALUES (?, ?)`,
          id,
          talhao.usuario_id,
        );
      }

      await db.runAsync("DELETE FROM aplicacoes WHERE talhao_id = ?", id);

      await db.runAsync("DELETE FROM producoes WHERE talhao_id = ?", id);

      await db.runAsync("DELETE FROM talhoes WHERE _id = ?", id);

      await buscarTalhoes();

      Alert.alert("Sucesso", "Talhão excluído com sucesso.");
    } catch (err) {
      console.error("Erro ao excluir talhão:", err);

      Alert.alert(
        "Erro",
        "Não foi possível excluir o talhão. Verifique sua conexão e tente novamente.",
      );
    }
  };

  const router = useRouter();
  return (
    <Screen scroll>
      <View style={styles.list}>
        <ScreenHeader
          title="Talhões"
          subtitle="Cadastre, abra e acompanhe cada área"
          icon={require("@/assets/talhao2.png")}
        />

        <AppButton
          title="Cadastrar talhão"
          onPress={() => {
            router.push("/addTalhaoRoute");
          }}
        />

        {carregando ? (
          <LoadingState message="Carregando talhões..." />
        ) : talhoes.length === 0 ? (
          <EmptyState
            title="Nenhum talhão adicionado"
            description="Cadastre o primeiro talhão para começar o controle da operação."
            icon="map-outline"
          />
        ) : (
          <FlatList
            scrollEnabled={false}
            data={talhoes}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.projeto}>{item.projetoTalhao}</Text>
                  <StatusBadge
                    label={item.status}
                    color={
                      item.status === "Concluído" ? Colors.success : Colors.warning
                    }
                  />
                </View>
                <Text style={styles.info}>Talhão: {item.numeroTalhao}</Text>
                <Text style={styles.info}>Área: {item.areaTalhao} Há</Text>
                <View style={styles.actions}>
                  <AppButton
                    size="sm"
                    style={styles.actionButton}
                    title="Abrir"
                    onPress={() =>
                      router.push({
                        pathname: "/adminTalhaoRoute",
                        params: { id: item._id },
                      })
                    }
                  />
                  <AppButton
                    size="sm"
                    variant="danger"
                    style={styles.actionButton}
                    title="Deletar"
                    onPress={() => deletarTalhao(item._id)}
                  />
                </View>
              </Card>
            )}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    marginBottom: 30,
    gap: Spacing.md,
  },
  card: {
    marginTop: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  projeto: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
  },
  info: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
});
