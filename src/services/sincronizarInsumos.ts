
import { db } from "@/database/database";
import { apiRequest } from "@/services/api";

type InsumoPendente = {
  _id: string;
  usuario_id: string;
  nomeIns: string;
  tipoIns: string | null;
  recomendIns: number | null;
};

export async function sincronizarInsumosPendentes() {
  try {
    const pendentes = await db.getAllAsync<InsumoPendente>(
      `SELECT
        _id,
        usuario_id,
        nomeIns,
        tipoIns,
        recomendIns
      FROM insumos
      WHERE sincronizado = 0`
    );

    for (const insumo of pendentes) {
      try {
        const response = await apiRequest("/insumos", {
          method: "POST",
          body: JSON.stringify({
            _id: insumo._id,
            nomeIns: insumo.nomeIns,
            tipoIns: insumo.tipoIns,
            recomendIns: insumo.recomendIns,
          }),
        });

        if (response.ok) {
          await db.runAsync(
            `UPDATE insumos
             SET sincronizado = 1, servidor_id = ?
             WHERE _id = ? AND usuario_id = ?`,
            insumo._id,
            insumo._id,
            insumo.usuario_id
          );
        } else {
          const erro = await response.text();

          console.error(
            `Falha ao sincronizar o insumo ${insumo._id}:`,
            response.status,
            erro
          );
        }
      } catch (erro) {
        console.log(
          "Não foi possível sincronizar o insumo:",
          insumo._id,
          erro
        );

        // Mantém sincronizado = 0 para tentar novamente depois.
      }
    }
  } catch (erro) {
    console.error("Erro ao buscar insumos pendentes:", erro);
  }
}
