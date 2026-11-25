import { db } from "@/database/database";
import { apiRequest } from "@/services/api";

type AplicacaoPendente = {
  _id: string;
  talhao_id: string;
  producao_id: string | null;
  insumo_id: string;
  quantidade: number;
  dataAplicacao: string;
  usuario_id: string;
};

export async function sincronizarAplicacoesPendentes() {
  try {
    const pendentes = await db.getAllAsync<AplicacaoPendente>(
      `SELECT _id, 
      usuario_id,
       talhao_id, 
       producao_id, 
       insumo_id, 
       quantidade, 
       dataAplicacao
       FROM aplicacoes WHERE sincronizado = 0`,
    );

    //console.log("Aplicações pendentes:", pendentes.length);

    for (const aplicacao of pendentes) {
      //console.log("Talhão:", aplicacao.talhao_id)
      try {
        const response = await apiRequest("/aplicacoes", {
          method: "POST",
          body: JSON.stringify({
            _id: aplicacao._id,
            talhaoId: aplicacao.talhao_id,
            producaoId: aplicacao.producao_id,
            insumoId: aplicacao.insumo_id,
            quantidade: aplicacao.quantidade,
            dataAplicacao: aplicacao.dataAplicacao,
          }),
        });

        if (response.ok) {
          await db.runAsync(
            `UPDATE aplicacoes SET sincronizado = 1,
            servidor_id = ? WHERE _id = ? AND usuario_id = ?`,
            aplicacao._id,
            aplicacao._id,
            aplicacao.usuario_id,
          );
          //console.log("Aplicação sincronizada:", aplicacao._id);
        } else {
          const erro = await response.text();

          console.error(
            "Falha ao sincronizar aplicação:",
            response.status,
            erro,
          );
        }
      } catch (err) {
        console.log("Não foi possível sincronizar a aplicação:", err);
      }
    }
  } catch (err) {
    console.error("Erro ao buscar aplicações pendentes", err);
  }
}
