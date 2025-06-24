import * as SQLite from "expo-sqlite";
import { showToast } from "@/utils/Toast";

// Define TypeScript interfaces
export interface TestResult {
  id: number;
  timestamp: number;
  latency?: number;
  jitter?: number;
  download?: number;
  upload?: number;
  packetLoss?: number;
  ipAddress?: string;
  location?: string;
  provider?: string;
  notes?: string;
  downloadHistory?: string; // JSON string of numbers
  uploadHistory?: string; // JSON string of numbers
}

export interface TestResultInsert extends Omit<TestResult, "id"> {}

// Open database connection
const dbPromise = SQLite.openDatabaseAsync("networktest.db");

// Migration definitions
const migrations = [
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        latency REAL,
        jitter REAL,
        download REAL,
        upload REAL,
        packet_loss REAL,
        ip_address TEXT,
        location TEXT,
        provider TEXT,
        notes TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_test_results_timestamp 
      ON test_results (timestamp DESC);
    `);
  },
  async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
      ALTER TABLE test_results ADD COLUMN download_history TEXT;
      ALTER TABLE test_results ADD COLUMN upload_history TEXT;
    `);
  },
];

// Initialize database with migrations
export const initializeDatabase = async () => {
  try {
    const db = await dbPromise;
    const result = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version"
    );
    const currentVersion = result?.user_version ?? 0;

    if (currentVersion < migrations.length) {
      await db.withTransactionAsync(async () => {
        for (let i = currentVersion; i < migrations.length; i++) {
          await migrations[i](db);
        }
        await db.execAsync(`PRAGMA user_version = ${migrations.length}`);
      });
      console.log(
        `Database migrated from version ${currentVersion} to ${migrations.length}`
      );
    }

    showToast({
      type: "success",
      text1: "Database Ready",
      text2: "Network test database initialized successfully",
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    showToast({
      type: "error",
      text1: "Database Error",
      text2: "Failed to initialize database",
    });
  }
};

// Database operations
export const saveTestResult = async (
  result: TestResultInsert
): Promise<number> => {
  const db = await dbPromise;
  const { lastInsertRowId } = await db.runAsync(
    `INSERT INTO test_results (
      timestamp, latency, jitter, download, upload, 
      packet_loss, ip_address, location, provider, notes,
      download_history, upload_history
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    result.timestamp,
    result.jitter ?? 0,
    result.latency ?? 0,
    result.download ?? 0,
    result.upload ?? 0,
    result.packetLoss ?? 0,
    result.ipAddress ?? "",
    result.location ?? "",
    result.provider ?? "",
    result.notes ?? "",
    result.downloadHistory ?? "[]",
    result.uploadHistory ?? "[]"
  );
  return lastInsertRowId;
};

export const getTestResults = async (limit = 100): Promise<TestResult[]> => {
  const db = await dbPromise;
  const results = await db.getAllAsync<TestResult>(
    `SELECT 
      id,
      timestamp,
      latency,
      jitter,
      download,
      upload,
      packet_loss AS packetLoss,
      ip_address AS ipAddress,
      location,
      provider,
      notes,
      download_history AS downloadHistory,
      upload_history AS uploadHistory
    FROM test_results 
    ORDER BY timestamp DESC
    LIMIT ?;`,
    [limit]
  );
  return results;
};

export const getTestResultById = async (
  id: number
): Promise<TestResult | null> => {
  const db = await dbPromise;
  const result = await db.getFirstAsync<TestResult>(
    `SELECT 
      id,
      timestamp,
      latency,
      jitter,
      download,
      upload,
      packet_loss AS packetLoss,
      ip_address AS ipAddress,
      location,
      provider,
      notes,
      download_history AS downloadHistory,
      upload_history AS uploadHistory
    FROM test_results 
    WHERE id = ?;`,
    [id]
  );
  return result || null;
};

export const deleteTestResult = async (id: number): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync(`DELETE FROM test_results WHERE id = ?;`, [id]);
};

export const deleteAllTestResults = async (): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync(`DELETE FROM test_results;`);
};

export const exportAsCSV = async (): Promise<string> => {
  const results = await getTestResults(5000);

  if (results.length === 0) {
    return "No data to export";
  }

  const headers = [
    "ID",
    "Timestamp",
    "Latency (ms)",
    "Jitter (ms)",
    "Download (Mbps)",
    "Upload (Mbps)",
    "Packet Loss (%)",
    "IP Address",
    "Location",
    "Provider",
    "Notes",
    "Download History",
    "Upload History",
  ].join(",");

  const rows = results.map((result) => {
    const date = new Date(result.timestamp).toISOString();
    return [
      result.id,
      `"${date}"`,
      result.latency?.toFixed(4) || "",
      result.jitter?.toFixed(4) || "",
      result.download?.toFixed(4) || "",
      result.upload?.toFixed(4) || "",
      result.packetLoss?.toFixed(4) || "",
      `"${result.ipAddress || ""}"`,
      `"${result.location || ""}"`,
      `"${result.provider || ""}"`,
      `"${result.notes?.replace(/"/g, '""') || ""}"`,
      `"${result.downloadHistory || ""}"`,
      `"${result.uploadHistory || ""}"`,
    ].join(",");
  });

  return [headers, ...rows].join("\n");
};

export const exportAsJSON = async (): Promise<string> => {
  const results = await getTestResults(5000);
  return JSON.stringify(results, null, 2);
};

// Additional utility functions
export const getDefaultTestServer = async () => {
  const db = await dbPromise;
  const server = await db.getFirstAsync<{
    id: number;
    name: string;
    url: string;
  }>(`SELECT id, name, url FROM test_servers WHERE is_default = 1 LIMIT 1;`);
  return server || null;
};

export const getAllTestServers = async () => {
  const db = await dbPromise;
  return await db.getAllAsync<{ id: number; name: string; url: string }>(
    `SELECT id, name, url FROM test_servers ORDER BY is_default DESC;`
  );
};

// Initialize database on module load
initializeDatabase().catch(console.error);
