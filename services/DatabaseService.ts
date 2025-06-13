// import * as SQLite from "expo-sqlite"
// import type { TestResult } from "../types"

// // Create the database connection
// const db = SQLite.openDatabaseAsync("networktest.db")

// // Initialize the database
// const initDatabase = () => {
//   db.transaction(
//     (tx) => {
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS test_results (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         timestamp INTEGER NOT NULL,
//         latency REAL,
//         jitter REAL,
//         download REAL,
//         upload REAL,
//         packet_loss REAL,
//         ip_address TEXT,
//         location TEXT,
//         provider TEXT,
//         notes TEXT
//       );`,
//       )
//     },
//     (error) => console.error("Database initialization error:", error),
//     () => console.log("Database initialized successfully"),
//   )
// }

// const migration = [

// ]
// // Initialize the database when this module is imported
// initDatabase()

// // Save a test result
// const saveTestResult = (result: Omit<TestResult, "id">): Promise<number> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `INSERT INTO test_results (
//           timestamp, latency, jitter, download, upload,
//           packet_loss, ip_address, location, provider, notes
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
//         [
//           result.timestamp,
//           result.latency,
//           result.jitter,
//           result.download,
//           result.upload,
//           result.packetLoss,
//           result.ipAddress,
//           result.location,
//           result.provider,
//           result.notes,
//         ],
//         (_, { insertId }) => {
//           resolve(insertId)
//         },
//         (_, error) => {
//           reject(error)
//           return false
//         },
//       )
//     })
//   })
// }

// // Get all test results
// const getTestResults = (): Promise<TestResult[]> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `SELECT * FROM test_results ORDER BY timestamp DESC;`,
//         [],
//         (_, { rows }) => {
//           const results: TestResult[] = []
//           for (let i = 0; i < rows.length; i++) {
//             const item = rows.item(i)
//             results.push({
//               id: item.id,
//               timestamp: item.timestamp,
//               latency: item.latency,
//               jitter: item.jitter,
//               download: item.download,
//               upload: item.upload,
//               packetLoss: item.packet_loss,
//               ipAddress: item.ip_address,
//               location: item.location,
//               provider: item.provider,
//               notes: item.notes,
//             })
//           }
//           resolve(results)
//         },
//         (_, error) => {
//           reject(error)
//           return false
//         },
//       )
//     })
//   })
// }

// // Delete a test result
// const deleteTestResult = (id: number): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `DELETE FROM test_results WHERE id = ?;`,
//         [id],
//         () => {
//           resolve()
//         },
//         (_, error) => {
//           reject(error)
//           return false
//         },
//       )
//     })
//   })
// }

// // Export results as CSV
// const exportAsCSV = (): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     getTestResults()
//       .then((results) => {
//         if (results.length === 0) {
//           resolve("No data to export")
//           return
//         }

//         const headers =
//           "ID,Timestamp,Latency (ms),Jitter (ms),Download (Mbps),Upload (Mbps),Packet Loss (%),IP Address,Location,Provider,Notes\n"
//         const rows = results
//           .map(
//             (r) =>
//               `${r.id},${new Date(r.timestamp).toISOString()},${r.latency},${r.jitter},${r.download},${r.upload},${r.packetLoss},${r.ipAddress},"${r.location}","${r.provider}","${r.notes}"`,
//           )
//           .join("\n")

//         resolve(headers + rows)
//       })
//       .catch(reject)
//   })
// }

// // Export all functions
// const DatabaseService = {
//   saveTestResult,
//   getTestResults,
//   deleteTestResult,
//   exportAsCSV,
// }

// export default DatabaseService

// src/services/NetworkTestDB.ts
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
}

export interface TestResultInsert extends Omit<TestResult, "id"> {}

// Open database connection
const dbPromise = SQLite.openDatabaseAsync("networktest.db");

// Migration definitions
const migrations = [
  {
    version: 1,
    execute: async (tx: SQLite.SQLTransaction) => {
      await tx.execAsync(`
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
      `);

      await tx.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_test_results_timestamp 
        ON test_results (timestamp DESC);
      `);
    },
  },
];

// Initialize database with migrations
export const initializeDatabase = async () => {
  try {
    const db = await dbPromise;

    // Check current version
    const versionResult = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version;"
    );
    const currentVersion = versionResult?.user_version || 0;

    // Get latest migration version
    const latestVersion = migrations[migrations.length - 1].version;

    if (currentVersion < latestVersion) {
      await db.withExclusiveTransactionAsync(async (tx) => {
        // Apply pending migrations
        for (const migration of migrations) {
          if (migration.version > currentVersion) {
            await migration.execute(tx);
          }
        }

        // Update database version
        await tx.execAsync(`PRAGMA user_version = ${latestVersion};`);
      });

      console.log(
        `Database migrated from version ${currentVersion} to ${latestVersion}`
      );
    }

    showToast({
      type: "success",
      text1: "Database Ready",
      text2: "Network test database initialized successfully",
    });
  } catch (error) {
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
  const { insertId } = await db.runAsync(
    `INSERT INTO test_results (
      timestamp, latency, jitter, download, upload, 
      packet_loss, ip_address, location, provider, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      result.timestamp,
      result.latency,
      result.jitter,
      result.download,
      result.upload,
      result.packetLoss,
      result.ipAddress,
      result.location,
      result.provider,
      result.notes,
    ]
  );
  return insertId!;
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
      notes
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
      notes
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

