import * as SecureStore from "expo-secure-store";

import { db } from "@/database/database";
import { apiRequest } from "@/services/api";

type InsumoServidor = {
  _id: string;
  nomeIns: string;
  tipoIns: string | null;
  recomendIns: number | null;
};

export async function baixarInsumosDoServidor() {
  try {
    const usuarioId = await SecureStore.getItemAsync("usuarioId");

    if (!usuarioId) {
      console.log("Usuário não identificado para baixar insumos.");
      return;
    }

    const response = await apiRequest("/insumos", {
      method: "GET",
    });

    if (!response.ok) {
      console.error(
        "Erro ao baixar insumos:",
        response.status,
        await response.text(),
      );
      return;
    }

    const dados = await response.json();
    const insumos: InsumoServidor[] = dados.insumos;

    for (const insumo of insumos) {
      const excluido = await db.getFirstAsync(
        `SELECT insumo_id
   FROM insumos_excluidos
   WHERE insumo_id = ?`,
        insumo._id,
      );

      if (excluido) {
        continue;
      }
      const local = await db.getFirstAsync<{
        sincronizado: number;
      }>(
        `SELECT sincronizado
         FROM insumos
         WHERE _id = ? AND usuario_id = ?`,
        insumo._id,
        usuarioId,
      );

      // Não sobrescreve um cadastro local ainda pendente.
      if (local && local.sincronizado === 0) {
        continue;
      }

      if (local) {
        // Atualiza um registro que já existe no celular.
        await db.runAsync(
          `UPDATE insumos
           SET servidor_id = ?,
               nomeIns = ?,
               tipoIns = ?,
               recomendIns = ?,
               sincronizado = 1
           WHERE _id = ? AND usuario_id = ?`,
          insumo._id,
          insumo.nomeIns,
          insumo.tipoIns,
          insumo.recomendIns,
          insumo._id,
          usuarioId,
        );
      } else {
        // Insere um insumo que veio do servidor.
        await db.runAsync(
          `INSERT OR IGNORE INTO insumos
           (_id, servidor_id, usuario_id, nomeIns,
            tipoIns, recomendIns, sincronizado)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          insumo._id,
          insumo._id,
          usuarioId,
          insumo.nomeIns,
          insumo.tipoIns,
          insumo.recomendIns,
        );
      }
    }
  } catch (erro) {
    console.error("Erro ao baixar insumos do servidor:", erro);
  }
}
