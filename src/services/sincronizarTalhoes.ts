
import { db } from "@/database/database";
import { apiRequest } from "@/services/api";

type TalhaoPendente = {
  _id: string;
  usuario_id: string;
  projetoTalhao: string;
  numeroTalhao: string;
  areaTalhao: number;
  status: string;
  dataCriacao: string;
};

export async function sincronizarTalhoesPendentes() {
  try {
    const pendentes = await db.getAllAsync<TalhaoPendente>(
      `SELECT
        _id,
        usuario_id,
        projetoTalhao,
        numeroTalhao,
        areaTalhao,
        status,
        dataCriacao
      FROM talhoes
      WHERE sincronizado = 0`
    );

    for (const talhao of pendentes) {
      try {
        const response = await apiRequest("/talhoes", {
          method: "POST",
          body: JSON.stringify({
            _id: talhao._id,
            projetoTalhao: talhao.projetoTalhao,
            numeroTalhao: talhao.numeroTalhao,
            areaTalhao: talhao.areaTalhao,
            status: talhao.status,
            dataCriacao: talhao.dataCriacao,
          }),
        });

        if (response.ok) {
          await db.runAsync(
            `UPDATE talhoes
             SET sincronizado = 1
             WHERE _id = ? AND usuario_id = ?`,
            talhao._id,
            talhao.usuario_id
          );
        } else {
          const erro = await response.text();

          console.error(
            `Falha ao sincronizar o talhão ${talhao._id}:`,
            response.status,
            erro
          );
        }
      } catch (erro) {
        console.log(
          "Não foi possível sincronizar o talhão:",
          talhao._id,
          erro
        );

        // Mantém sincronizado = 0 para tentar novamente depois.
      }
    }
  } catch (erro) {
    console.error("Erro ao buscar talhões pendentes:", erro);
  }
}
