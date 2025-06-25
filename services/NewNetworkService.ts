import { io, Socket } from "socket.io-client";
import { SpeedTestResult } from "../types";
import { saveTestResult } from "./DatabaseService";
import * as Location from "expo-location";
import { DeviceEventEmitter } from "react-native";

// Environment variable
const WEBSOCKET_URL =
  // "ws://192.168.1.172:3000";
  process.env.EXPO_PUBLIC_WEBSOCKET_URL ||
  "wss://backendqos-production.up.railway.app";

// External speed test servers for actual internet speed testing
const EXTERNAL_TEST_SERVERS = [
  "https://httpbin.org/bytes/1048576", // 1MB test file
  "https://speed.cloudflare.com/__down",
  "https://www.google.com/generate_204",
];

let socket: Socket | null = null;
let onProgressCallback:
  | ((progress: {
      stage: "latency" | "download" | "upload";
      value: number;
    }) => void)
  | null = null;
let finalResultsCallback: ((result: SpeedTestResult) => void) | null = null;

// Add connection state tracking
let isTestInProgress = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

// Enhanced connection function with better error handling
export const startCustomSpeedTest = (
  onProgress: (progress: {
    stage: "latency" | "download" | "upload";
    value: number;
  }) => void,
  onComplete: (result: SpeedTestResult) => void
) => {
  // Prevent multiple simultaneous tests
  if (isTestInProgress) {
    console.log("Test already in progress, stopping previous test...");
    stopCustomSpeedTest();
  }

  if (socket?.connected) {
    console.log("Socket.IO is already connected, reusing connection.");
    socket.emit("start_all_tests");
    return;
  }

  console.log("Attempting to connect to:", WEBSOCKET_URL);
  isTestInProgress = true;
  reconnectAttempts = 0;

  // Enhanced Socket.IO configuration
  socket = io(WEBSOCKET_URL, {
    // Try multiple transports in order of preference
    transports: ["websocket", "polling"],

    // Connection timeout
    timeout: 15000,

    // Reconnection settings
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,

    // Force new connection
    forceNew: true,

    // Additional options for better compatibility
    upgrade: true,
    rememberUpgrade: false,
  });

  onProgressCallback = onProgress;
  finalResultsCallback = onComplete;

  // Test state variables
  let downloadStartTime = 0;
  let downloadSize = 0;
  let receivedChunks = 0;
  const downloadHistory: number[] = [];
  const uploadHistory: number[] = [];

  // Enhanced connection event handling
  socket.on("connect", () => {
    console.log("✅ Socket.IO connected successfully!");
    console.log("Socket ID:", socket?.id);
    console.log("Transport:", socket?.io.engine.transport.name);

    reconnectAttempts = 0; // Reset counter on successful connection

    // Only start test if we're not in a reconnection scenario
    if (isTestInProgress) {
      onProgressCallback?.({ stage: "latency", value: 0 });
      socket?.emit("start_all_tests");
    }
  });

  // More detailed error handling
  socket.on("connect_error", (error) => {
    console.error("❌ Socket.IO connection error:");
    console.error("Error message:", error.message);
    console.error("Full error:", error);

    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("❌ Max reconnection attempts reached, failing test");
      handleTestFailure("Connection failed after multiple attempts");
    }
  });

  socket.on("disconnect", (reason, details) => {
    console.log("🔌 Socket.IO disconnected:");
    console.log("Reason:", reason);
    console.log("Details:", details);

    // Don't set socket to null immediately in case of reconnection
    if (
      reason === "io server disconnect" ||
      reason === "io client disconnect"
    ) {
      // These are intentional disconnects, clean up
      cleanupConnection();
    }
    // For transport errors, let the reconnection logic handle it
  });

  // Connection state debugging
  socket.on("reconnect", (attemptNumber) => {
    console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
    // Restart the test after reconnection
    if (isTestInProgress) {
      socket?.emit("start_all_tests");
    }
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}`);
  });

  socket.on("reconnect_error", (error) => {
    console.error("❌ Reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Failed to reconnect after all attempts");
    handleTestFailure("Failed to reconnect");
  });

  // Your existing event handlers with improvements
  socket.on("diagnostic_ping", (data) => {
    if (!socket?.connected) return;

    socket.emit("diagnostic_pong", {
      original_timestamp: data.timestamp,
      sequence: data.sequence,
    });
  });

  socket.on("start_download_test", () => {
    console.log("Download test started on client.");
    downloadStartTime = Date.now();
    downloadSize = 0;
    receivedChunks = 0;
    onProgressCallback?.({ stage: "download", value: 0 });
  });

  socket.on("download_chunk", (chunk: ArrayBuffer, ack: () => void) => {
    if (!isTestInProgress) return;

    downloadSize += chunk.byteLength;
    receivedChunks++;

    console.log(
      `Received chunk #${receivedChunks}, total downloaded: ${downloadSize}`
    );

    const downloadDuration = (Date.now() - downloadStartTime) / 1000;
    const downloadSpeed =
      downloadDuration > 0
        ? (downloadSize * 8) / (downloadDuration * 1000 * 1000)
        : 0;

    downloadHistory.push(downloadSpeed);
    onProgressCallback?.({ stage: "download", value: downloadSpeed });

    // Acknowledge receipt
    if (typeof ack === "function") {
      ack();
    }
  });

  socket.on("end_download_test", () => {
    if (!isTestInProgress) return;

    console.log("Download test finished on client.");
    const downloadDuration = (Date.now() - downloadStartTime) / 1000;
    const downloadSpeed =
      downloadDuration > 0
        ? (downloadSize * 8) / (downloadDuration * 1000 * 1000)
        : 0;

    console.log(`Final download speed: ${downloadSpeed.toFixed(2)} Mbps`);

    // Ensure the final value is in the history
    if (
      downloadHistory.length === 0 ||
      downloadHistory[downloadHistory.length - 1] !== downloadSpeed
    ) {
      downloadHistory.push(downloadSpeed);
    }

    if (socket?.connected) {
      socket.emit("download_test_result", { speed: downloadSpeed });
    }
    onProgressCallback?.({ stage: "download", value: downloadSpeed });
  });

  socket.on("start_upload_test", () => {
    if (!isTestInProgress) return;

    console.log("Upload test started on client.");
    onProgressCallback?.({ stage: "upload", value: 0 });

    // Use smaller chunks and longer intervals to reduce memory pressure
    const uploadChunkSize = 256 * 1024; // 256KB chunks
    const uploadChunk = new ArrayBuffer(uploadChunkSize);
    let uploadedBytes = 0;
    let sentChunks = 0;
    const uploadStartTime = Date.now();

    const uploadInterval = setInterval(() => {
      if (!socket?.connected || !isTestInProgress) {
        clearInterval(uploadInterval);
        return;
      }

      socket.emit("upload_chunk", uploadChunk);
      uploadedBytes += uploadChunkSize;
      sentChunks++;
      console.log(
        `Sent upload chunk #${sentChunks}, total uploaded: ${uploadedBytes} bytes`
      );

      // Calculate and report instantaneous upload speed for this chunk
      const chunkSpeed = (uploadChunkSize * 8) / (0.5 * 1000 * 1000); // Mbps, 0.5s interval
      uploadHistory.push(chunkSpeed);
      onProgressCallback?.({ stage: "upload", value: chunkSpeed });
    }, 500); // 500ms intervals

    // End upload test after 5 seconds
    setTimeout(() => {
      clearInterval(uploadInterval);
      if (socket?.connected && isTestInProgress) {
        // Ensure the final value is in the history
        const uploadDuration = (Date.now() - uploadStartTime) / 1000;
        const finalUploadSpeed =
          uploadDuration > 0
            ? (uploadedBytes * 8) / (uploadDuration * 1000 * 1000)
            : 0;
        if (
          uploadHistory.length === 0 ||
          uploadHistory[uploadHistory.length - 1] !== finalUploadSpeed
        ) {
          uploadHistory.push(finalUploadSpeed);
        }
        socket.emit("end_upload_test");
        console.log(
          `Upload test finished. Total chunks sent: ${sentChunks}, total uploaded: ${uploadedBytes} bytes`
        );
      }
    }, 5000);
  });

  socket.on("comprehensive_test_result", async (result) => {
    if (!isTestInProgress) return;

    console.log("Received comprehensive test result:", result);

    // Fetch IP and location only once
    let ipInfo: { query?: string; isp?: string } = {};
    let locationInfo: { city?: string; country?: string } = {};

    try {
      const response = await fetch("http://ip-api.com/json");
      ipInfo = await response.json();
    } catch (e) {
      console.error("Could not fetch IP info", e);
    }

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        const placemark = await Location.reverseGeocodeAsync(location.coords);
        if (placemark.length > 0) {
          locationInfo.city = placemark[0].city || "";
          locationInfo.country = placemark[0].country || "";
        }
      }
    } catch (e) {
      console.error("Could not fetch location info", e);
    }

    const finalResult: SpeedTestResult = {
      latency: parseFloat(result.latency?.avg || "0"),
      jitter: parseFloat(result.jitter?.value || "0"),
      download: result.downloadSpeed?.speed || 0,
      upload: result.uploadSpeed?.speed || 0,
      packetLoss: parseFloat(result.packetLoss?.percentage || "0"),
    };

    isTestInProgress = false;
    finalResultsCallback?.(finalResult);

    // Save extended results to database (only once)
    await saveTestResult({
      timestamp: Date.now(),
      latency: finalResult.latency,
      jitter: finalResult.jitter ?? 0,
      download: finalResult.download,
      upload: finalResult.upload,
      packetLoss: finalResult.packetLoss,
      downloadHistory: JSON.stringify(downloadHistory),
      uploadHistory: JSON.stringify(uploadHistory),
      ipAddress: ipInfo.query,
      provider: ipInfo.isp,
      location: locationInfo.city
        ? `${locationInfo.city}, ${locationInfo.country}`
        : "Unknown",
    });
    DeviceEventEmitter.emit("testHistoryUpdated");

    // Clean up after test completion
    setTimeout(() => {
      if (socket?.connected) {
        socket.disconnect();
      }
    }, 1000);
  });

  // Add timeout for the entire test
  setTimeout(() => {
    if (isTestInProgress) {
      console.warn("⚠️ Test timeout reached");
      handleTestFailure("Test timeout");
    }
  }, 60000); // 60 second timeout
};

// Helper function to handle test failures
const handleTestFailure = (reason: string) => {
  console.error(`Test failed: ${reason}`);
  isTestInProgress = false;

  const failureResult: SpeedTestResult = {
    latency: 0,
    jitter: 0,
    download: 0,
    upload: 0,
    packetLoss: 100,
  };

  finalResultsCallback?.(failureResult);
  cleanupConnection();
};

// Clean up connection
const cleanupConnection = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  isTestInProgress = false;
  onProgressCallback = null;
  finalResultsCallback = null;
};

// Test connection function
export const testConnection = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log("🧪 Testing connection to:", WEBSOCKET_URL);

    const testSocket = io(WEBSOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
      reconnection: false, // Don't reconnect for test
    });

    const timeout = setTimeout(() => {
      testSocket.disconnect();
      console.log("❌ Connection test timed out");
      resolve(false);
    }, 15000);

    testSocket.on("connect", () => {
      console.log("✅ Connection test successful");
      console.log("Transport:", testSocket.io.engine.transport.name);
      clearTimeout(timeout);
      testSocket.disconnect();
      resolve(true);
    });

    testSocket.on("connect_error", (error) => {
      console.log("❌ Connection test failed:", error.message);
      clearTimeout(timeout);
      testSocket.disconnect();
      resolve(false);
    });
  });
};

// Function to test actual internet speed against external servers
export const testInternetSpeed = async (
  onProgress: (progress: {
    stage: "latency" | "download" | "upload";
    value: number;
  }) => void,
  onComplete: (result: SpeedTestResult) => void
) => {
  console.log("Testing actual internet speed against external servers...");

  let totalDownloaded = 0;
  let downloadStartTime = Date.now();

  // Test download speed against external servers
  onProgress({ stage: "download", value: 0 });

  try {
    // Test latency first
    onProgress({ stage: "latency", value: 0 });
    const latencyTests = [];

    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      try {
        await fetch("https://www.google.com/generate_204", {
          method: "HEAD",
          cache: "no-cache",
        });
        latencyTests.push(Date.now() - start);
      } catch (error) {
        console.warn(`Latency test ${i + 1} failed:`, error);
      }
    }

    const avgLatency =
      latencyTests.length > 0
        ? latencyTests.reduce((a, b) => a + b, 0) / latencyTests.length
        : 100;

    // Test download speed
    onProgress({ stage: "download", value: 0 });
    downloadStartTime = Date.now();

    for (const server of EXTERNAL_TEST_SERVERS) {
      try {
        const startTime = Date.now();
        const response = await fetch(server, {
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.arrayBuffer();
          totalDownloaded += data.byteLength;

          const endTime = Date.now();
          const duration = (endTime - startTime) / 1000;
          const speed =
            duration > 0 ? (data.byteLength * 8) / (duration * 1000 * 1000) : 0;

          console.log(`Download from ${server}: ${speed.toFixed(2)} Mbps`);
          onProgress({ stage: "download", value: speed });
        }
      } catch (error) {
        console.warn(`Failed to test ${server}:`, error);
      }
    }

    const totalDownloadDuration = (Date.now() - downloadStartTime) / 1000;
    const averageDownloadSpeed =
      totalDownloadDuration > 0
        ? (totalDownloaded * 8) / (totalDownloadDuration * 1000 * 1000)
        : 0;

    console.log(
      `Average download speed: ${averageDownloadSpeed.toFixed(2)} Mbps`
    );

    // Simulate upload test
    onProgress({ stage: "upload", value: 0 });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result: SpeedTestResult = {
      latency: avgLatency,
      jitter:
        latencyTests.length > 1
          ? Math.sqrt(
              latencyTests.reduce(
                (sum, lat) => sum + Math.pow(lat - avgLatency, 2),
                0
              ) / latencyTests.length
            )
          : 5,
      download: averageDownloadSpeed,
      upload: averageDownloadSpeed * 0.8, // Simulated upload (typically slower)
      packetLoss:
        latencyTests.length < 5 ? ((5 - latencyTests.length) / 5) * 100 : 0,
    };

    onComplete(result);
  } catch (error) {
    console.error("Error testing internet speed:", error);
    onComplete({
      latency: 0,
      jitter: 0,
      download: 0,
      upload: 0,
      packetLoss: 100,
    });
  }
};

export const stopCustomSpeedTest = () => {
  console.log("🔌 Stopping speed test...");
  isTestInProgress = false;
  cleanupConnection();
};
