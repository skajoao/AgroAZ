import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("drone.db");

export async function initDatabase() {
  //talhoes
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS talhoes (
      _id TEXT PRIMARY KEY,
      projetoTalhao TEXT,
      numeroTalhao TEXT,
      areaTalhao REAL,
      status TEXT DEFAULT 'Em andamento',
      dataCriacao TEXT
    );
  `);

  //insumos
  await db.execAsync(`CREATE TABLE IF NOT EXISTS insumos (
    _id TEXT PRIMARY KEY,
     nomeIns TEXT, 
     tipoIns TEXT, 
     recomendIns REAL
    )
    `);

  //aplicacoes
  await db.execAsync(`CREATE TABLE IF NOT EXISTS aplicacoes (
  _id TEXT PRIMARY KEY,
  talhao_id TEXT,
  insumo_id TEXT,
  quantidade REAL,
  dataAplicacao TEXT
  )
  `);

  //produções
  await db.execAsync(`CREATE TABLE IF NOT EXISTS producoes (
  _id TEXT PRIMARY KEY,
  talhao_id TEXT,
  areaProduzida REAL,
  dataProducao TEXT
);`)
}
