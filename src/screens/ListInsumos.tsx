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

import { sincronizarInsumosPendentes } from "@/services/sincronizarInsumos";

import { baixarInsumosDoServidor } from "@/services/baixarInsumosDoServidor";

import { sincronizarInsumosExcluidos } from "@/services/sincronizarInsumosExcluidos";
import AppButton from "@/components/ui/AppButton";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Screen from "@/components/ui/Screen";
import ScreenHeader from "@/components/ui/ScreenHeader";

export default function ListInsumos() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const buscarInsumos = useCallback(async () => {
    try {
      setCarregando(true);
      // Envia os insumos locais pendentes.
      await sincronizarInsumosPendentes();

      // Baixa os insumos cadastrados no servidor.
      await baixarInsumosDoServidor();

      // Atualiza a lista exibida.
      const data = await db.getAllAsync(
        "SELECT * FROM insumos ORDER BY nomeIns ASC",
      );

      setInsumos(data);
    } catch (erro) {
      console.error("Erro ao buscar insumos:", erro);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        await sincronizarInsumosExcluidos();
        await buscarInsumos();
      };

      carregar();
    }, [buscarInsumos]),
  );

  //deletar insumo

  const deletarInsumo = async (id: string) => {
    try {
      const insumo = await db.getFirstAsync<{
        sincronizado: number;
        usuario_id: string;
      }>("SELECT sincronizado, usuario_id FROM insumos WHERE _id = ?", id);

      if (Number(insumo?.sincronizado) === 1 && insumo?.usuario_id) {
        await db.runAsync(
          `INSERT OR IGNORE INTO insumos_excluidos(insumo_id, usuario_id) VALUES (?, ?)`,
          id,
          insumo.usuario_id,
        );
      }

      await db.runAsync("DELETE FROM insumos WHERE _id = ?", id);

      const teste = await db.getFirstAsync(
        "SELECT * FROM insumos WHERE _id = ?",
        id,
      );

      console.log("Insumo após exclusão:", teste);

      await buscarInsumos();

      Alert.alert("Sucesso", "Insumo excluído com sucesso.");
    } catch (erro) {
      console.error("Erro ao excluir insumo:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível excluir o insumo. Verifique sua conexão e tente novamente.",
      );
    }
  };

  const router = useRouter();

  return (
    <Screen scroll>
      <View style={styles.list}>
        <ScreenHeader
          title="Insumos"
          subtitle="Produtos utilizados nas aplicações"
          icon={require("@/assets/insumos.png")}
        />

        <AppButton
          title="Cadastrar Insumo"
          onPress={() => {
            router.push("/addInsumoRoute");
          }}
        />

        {carregando ? (
          <LoadingState message="Carregando insumos..." />
        ) : insumos.length === 0 ? (
          <EmptyState
            title="Nenhum insumo cadastrado"
            description="Cadastre os produtos para registrá-los nas produções."
            icon="flask-outline"
          />
        ) : (
          <FlatList
            scrollEnabled={false}
            data={insumos}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Text style={styles.nome}>{item.nomeIns}</Text>
                <Text style={styles.info}>{item.tipoIns}</Text>
                <Text style={styles.info}>{item.recomendIns} Kg/L Há</Text>
                <View style={styles.actions}>
                  <AppButton
                    size="sm"
                    variant="danger"
                    title="Deletar"
                    onPress={() => deletarInsumo(item._id)}
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
  nome: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
});
