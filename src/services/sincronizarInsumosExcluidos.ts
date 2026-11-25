import { db } from "@/database/database";
import { apiRequest } from "@/services/api";

type exclusaoPendente = {
  insumo_id: string;
  usuario_id: string;
};

export async function sincronizarInsumosExcluidos() {
  try {
    const pendentes = await db.getAllAsync<exclusaoPendente>(
      `SELECT
             insumo_id,
             usuario_id
             FROM insumos_excluidos`,
    );

    for (const item of pendentes) {
      try {
        const response = await apiRequest(
          `/insumos/${encodeURIComponent(item.insumo_id)}`,
          {
            method: "DELETE",
          },
        );

        if (response.ok) {
          await db.runAsync(
            `DELETE FROM insumos_excluidos WHERE insumo_id = ? AND usuario_id = ?`,
            item.insumo_id,
            item.usuario_id,
          );
        } else {
          const erro = await response.text();

          console.error("Status:", response.status);
          console.error("Resposta do servidor:", erro);
          console.error("ID do insumo:", item.insumo_id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
}
