import * as SQLite from 'expo-sqlite';

export interface DBDocument {
  id: string;
  name: string;
  doc_type: string;
  raw_html: string;
  created_at: number;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('docscanner_secure_v2.db');
  await dbInstance.withTransactionAsync(async () => {
    await dbInstance!.runAsync(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        raw_html TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
    await dbInstance!.runAsync(`
      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        is_synced INTEGER DEFAULT 0,
        timestamp INTEGER NOT NULL
      );
    `);
  });
  return dbInstance;
}

export async function insertDocumentLocally(doc: DBDocument): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO documents (id, name, doc_type, raw_html, created_at) VALUES (?, ?, ?, ?, ?);`,
      [doc.id, doc.name, doc.doc_type, doc.raw_html, doc.created_at]
    );
    await db.runAsync(
      `INSERT INTO sync_outbox (id, action, payload, is_synced, timestamp) VALUES (?, 'CREATE', ?, 0, ?);`,
      [Math.random().toString(36).substring(7), JSON.stringify(doc), Date.now()]
    );
  });
}

export async function fetchAllLocalDocuments(): Promise<DBDocument[]> {
  const db = await getDatabase();
  return await db.getAllAsync<DBDocument>(`SELECT * FROM documents ORDER BY created_at DESC;`);
}

export async function deleteDocumentLocally(id: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM documents WHERE id = ?;`, [id]);
    await db.runAsync(
      `INSERT INTO sync_outbox (id, action, payload, is_synced, timestamp) VALUES (?, 'DELETE', ?, 0, ?);`,
      [Math.random().toString(36).substring(7), JSON.stringify({ id }), Date.now()]
    );
  });
}

export async function wipeEntireLocalDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM documents;`);
    await db.runAsync(`DELETE FROM sync_outbox;`);
  });
}
