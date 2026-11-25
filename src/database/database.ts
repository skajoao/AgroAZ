import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("drone.db");

export async function initDatabase() {
  await db.execAsync(`

    CREATE TABLE IF NOT EXISTS talhoes (
      _id TEXT PRIMARY KEY,
      servidor_id TEXT,
      usuario_id TEXT NOT NULL,
      projetoTalhao TEXT NOT NULL,
      numeroTalhao TEXT NOT NULL,
      areaTalhao REAL NOT NULL,
      status TEXT DEFAULT 'Em andamento',
      dataCriacao TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS insumos (
      _id TEXT PRIMARY KEY,
      servidor_id TEXT,
      usuario_id TEXT NOT NULL,
      nomeIns TEXT NOT NULL,
      tipoIns TEXT,
      recomendIns REAL,
      sincronizado INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS producoes (
      _id TEXT PRIMARY KEY,
      servidor_id TEXT,
      usuario_id TEXT NOT NULL,
      talhao_id TEXT NOT NULL,
      areaProduzida REAL NOT NULL,
      dataProducao TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS aplicacoes (
      _id TEXT PRIMARY KEY,
      servidor_id TEXT,
      usuario_id TEXT NOT NULL,
      talhao_id TEXT NOT NULL,
      producao_id TEXT,
      insumo_id TEXT NOT NULL,
      quantidade REAL NOT NULL,
      dataAplicacao TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS insumos_excluidos (
      insumo_id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS talhoes_excluidos (
      talhao_id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL
    );
  `);
}
