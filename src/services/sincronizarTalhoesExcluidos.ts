import { db } from "@/database/database";
import { apiRequest } from "@/services/api";

type exclusaoPendente = {
  talhao_id: string;
  usuario_id: string;
};

export async function sincronizarTalhoesExcluidos() {
  try {
    const pendentes = await db.getAllAsync<exclusaoPendente>(
      `SELECT
             talhao_id,
             usuario_id
             FROM talhoes_excluidos`,
    );

    for (const item of pendentes) {
      try {
        const response = await apiRequest(
          `/talhoes/${encodeURIComponent(item.talhao_id)}`,
          {
            method: "DELETE",
          },
        );

        if (response.ok) {
          await db.runAsync(
            `DELETE FROM talhoes_excluidos WHERE talhao_id = ? AND usuario_id`,
            item.talhao_id,
            item.usuario_id,
          );
        } else {
          console.error(response.status);
        }
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
}
