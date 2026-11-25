import { db } from "@/database/database";
import { apiRequest } from "@/services/api";
import * as SecureStore from "expo-secure-store";

type TalhaoServidor = {
  _id: string;
  usuarioId?: string | number;
  projetoTalhao: string;
  numeroTalhao: string;
  areaTalhao: number;
  status: string;
  dataCriacao: string;
};

export async function baixarTalhoesDoServidor() {
  try {
    const usuarioId = await SecureStore.getItemAsync("usuarioId");

    if (!usuarioId) {
      console.log("Usuário não identificado no dispositivo.");
      return;
    }

    const response = await apiRequest("/talhoes", {
      method: "GET",
    });

    if (!response.ok) {
      console.error(
        "Erro ao baixar talhões:",
        response.status,
        await response.text()
      );
      return;
    }

    const dados = await response.json();
    const talhoes: TalhaoServidor[] = dados.talhoes;

    for (const talhao of talhoes) {
      const existente = await db.getFirstAsync<{
        _id: string;
        usuario_id: string;
      }>(
        `SELECT _id, usuario_id
         FROM talhoes
         WHERE _id = ?`,
        talhao._id
      );

      // Não altera registros que pertençam a outra conta local.
      if (existente && existente.usuario_id !== usuarioId) {
        continue;
      }

      if (existente) {
        await db.runAsync(
          `UPDATE talhoes
           SET projetoTalhao = ?,
               numeroTalhao = ?,
               areaTalhao = ?,
               status = ?,
               dataCriacao = ?,
               servidor_id = ?,
               sincronizado = 1
           WHERE _id = ? AND usuario_id = ?`,
          talhao.projetoTalhao,
          String(talhao.numeroTalhao),
          Number(talhao.areaTalhao),
          talhao.status || "Em andamento",
          talhao.dataCriacao,
          talhao._id,
          talhao._id,
          usuarioId
        );
      } else {
        await db.runAsync(
          `INSERT INTO talhoes (
            _id,
            servidor_id,
            usuario_id,
            projetoTalhao,
            numeroTalhao,
            areaTalhao,
            status,
            dataCriacao,
            sincronizado
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          talhao._id,
          talhao._id,
          usuarioId,
          talhao.projetoTalhao,
          String(talhao.numeroTalhao),
          Number(talhao.areaTalhao),
          talhao.status || "Em andamento",
          talhao.dataCriacao
        );
      }
    }
  } catch (erro) {
    console.error("Erro ao baixar talhões do servidor:", erro);
  }
}
