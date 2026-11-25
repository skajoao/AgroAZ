import { db } from "@/database/database";
import { apiRequest } from "@/services/api";

type ProducaoPendente = {
  _id: string;
  usuario_id: string;
  talhao_id: string;
  areaProduzida: number;
  dataProducao: string;
};

export async function sincronizarProducoesPendentes() {
  try {
    const pendentes = await db.getAllAsync<ProducaoPendente>(
      `SELECT
        _id,
        usuario_id,
        talhao_id,
        areaProduzida,
        dataProducao
      FROM producoes
      WHERE sincronizado = 0`,
    );

    //console.log("Produções pendentes:", pendentes.length);

    for (const producao of pendentes) {
      try {
        const response = await apiRequest("/producoes", {
          method: "POST",
          body: JSON.stringify({
            _id: producao._id,
            talhaoId: producao.talhao_id,
            areaProduzida: producao.areaProduzida,
            dataProducao: producao.dataProducao,
          }),
        });

        if (response.ok) {
          await db.runAsync(
            `UPDATE producoes
            SET sincronizado = 1, servidor_id = ?
            WHERE _id = ? AND usuario_id = ?`,
            producao._id,
            producao._id,
            producao.usuario_id,
          );
          //console.log("Produção sincronizada:", producao._id);
        } else {
          const erro = await response.text();

          console.error(
            "Falha ao sincronizar produção:",
            response.status,
            erro,
          );
        }
      } catch (erro) {
        console.log("Não foi possível sincronizar a produção:", erro);
      }
    }
  } catch (erro) {
    console.error("Erro ao buscar produções pendentes:", erro);
  }
}
