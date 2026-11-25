import { db } from "@/database/database";
import { apiRequest } from "@/services/api";

import * as SecureStore from "expo-secure-store";

type producaoServidor = {
  _id: string;
  talhaoId: string;
  areaProduzida: number;
  dataProducao: string;
};
export async function baixarProducoesDoServidor() {
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
      const response = await apiRequest(`/producoes/${talhao._id}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log("Erro ao buscar produções:", response.status);
        continue;
      }

      const dados = await response.json();

      const producoes: producaoServidor[] = dados.producoes;

      for (const producao of producoes) {
        const existente = await db.getFirstAsync<{
          _id: string;
          sincronizado: number;
        }>(
          `SELECT _id, sincronizado
            FROM producoes
            WHERE _id = ? AND usuario_id = ?`,
          producao._id,
          usuario_id,
        );

        if (existente && existente.sincronizado === 0) {
          continue;
        }

        if (!existente) {
          await db.runAsync(
            `
            INSERT OR IGNORE INTO producoes(
            _id, usuario_id, talhao_id,
            areaProduzida,
            dataProducao,
            sincronizado) VALUES (?, ?, ?, ?, ?, 1)`,
            producao._id,
            usuario_id,
            talhao._id,
            producao.areaProduzida,
            producao.dataProducao,
          );
        } else {
          await db.runAsync(
            `
            UPDATE producoes SET
            talhao_id = ?,
            areaProduzida = ?,
            dataProducao = ?,
            sincronizado = 1 
            WHERE _id = ? AND usuario_id = ?`,
            talhao._id,
            producao.areaProduzida,
            producao.dataProducao,
            producao._id,
            usuario_id,
          );
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}
