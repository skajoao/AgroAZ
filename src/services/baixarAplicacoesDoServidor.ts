import { db } from "@/database/database";
import { apiRequest } from "@/services/api";
import * as SecureStore from "expo-secure-store";

type AplicacaoServidor = {
  _id: string;
  talhaoId: string;
  producaoId: string | null;
  insumoId: string;
  quantidade: number;
  dataAplicacao: string;
};

export async function baixarAplicacoesDoServidor() {
  try {
    const usuario_id = await SecureStore.getItemAsync("usuarioId");

    if (!usuario_id) {
      console.log("Usuário não identificado no dispositivo.");
      return;
    }

    const talhoes = await db.getAllAsync<{ _id: string }>(
      `SELECT _id
       FROM talhoes
       WHERE usuario_id = ?`,
      usuario_id,
    );

    for (const talhao of talhoes) {
      const response = await apiRequest(`/aplicacoes/${talhao._id}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log("Erro ao buscar aplicações:", response.status);
        continue;
      }

      const dados = await response.json();

      const aplicacoes: AplicacaoServidor[] = dados.aplicacoes;

      for (const aplicacao of aplicacoes) {
        const existente = await db.getFirstAsync<{
          _id: string;
          sincronizado: number;
        }>(
          `SELECT _id, sincronizado
           FROM aplicacoes
           WHERE _id = ? AND usuario_id = ?`,
          aplicacao._id,
          usuario_id,
        );

        if (existente && existente.sincronizado === 0) {
          continue;
        }

        if (!existente) {
          await db.runAsync(
            `INSERT OR IGNORE INTO aplicacoes (
              _id,
              servidor_id,
              usuario_id,
              talhao_id,
              producao_id,
              insumo_id,
              quantidade,
              dataAplicacao,
              sincronizado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            aplicacao._id,
            aplicacao._id,
            usuario_id,
            aplicacao.talhaoId,
            aplicacao.producaoId,
            aplicacao.insumoId,
            aplicacao.quantidade,
            aplicacao.dataAplicacao,
          );
        } else {
          await db.runAsync(
            `UPDATE aplicacoes SET
              servidor_id = ?,
              talhao_id = ?,
              producao_id = ?,
              insumo_id = ?,
              quantidade = ?,
              dataAplicacao = ?,
              sincronizado = 1
             WHERE _id = ? AND usuario_id = ?`,
            aplicacao._id,
            aplicacao.talhaoId,
            aplicacao.producaoId,
            aplicacao.insumoId,
            aplicacao.quantidade,
            aplicacao.dataAplicacao,
            aplicacao._id,
            usuario_id,
          );
        }
      }
    }
  } catch (err) {
    console.log("Erro ao baixar aplicações:", err);
  }
}
