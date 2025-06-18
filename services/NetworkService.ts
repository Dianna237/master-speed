import * as Location from "expo-location";
import type { IPInfo, LocationData, SpeedTestResult } from "../types";

let isTestRunning: boolean = false;
let abortController: AbortController | null = null;

export const startSpeedTest = async (
  onProgress: (result: SpeedTestResult) => void
): Promise<void> => {
  if (isTestRunning) {
    throw new Error("Test is already running");
  }

  isTestRunning = true;
  abortController = new AbortController();
  const signal = abortController.signal;

  try {
    let latencySum = 0;
    const pingCount = 5;
    const downloadChunkSize = 1024 * 1024; // 1MB
    const downloadChunks = 5; // Download 5 chunks
    const uploadChunkSize = 1024 * 100; // 100KB
    const uploadChunks = 5; // Upload 5 chunks

    // 0. Initial Connection (to potentially get measId, though not explicitly used here)
    try {
      if (signal.aborted) throw new Error("Test aborted");
      await fetch("https://speed.cloudflare.com/connect", { signal });
    } catch (error) {
      console.warn(
        "Initial Cloudflare connect failed, proceeding anyway:",
        error
      );
    }

    // 1. Ping Test (Latency)
    for (let i = 0; i < pingCount && isTestRunning; i++) {
      if (signal.aborted) throw new Error("Test aborted");
      const start = Date.now();
      await fetch("https://speed.cloudflare.com/connect", { signal });
      const end = Date.now();
      latencySum += end - start;
      const currentLatency = latencySum / (i + 1);
      onProgress({
        latency: currentLatency,
        download: 0,
        upload: 0,
        jitter: 0,
        packetLoss: 0,
      });
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
    }

    // 2. Download Test
    let totalDownloadedBytes = 0;
    const downloadStartTime = Date.now();
    for (let i = 0; i < downloadChunks && isTestRunning; i++) {
      if (signal.aborted) throw new Error("Test aborted");
      // Using the ?during=download parameter based on user's input
      const response = await fetch(
        `https://speed.cloudflare.com/__down?during=download&bytes=${downloadChunkSize}`,
        { signal }
      );
      const blob = await response.blob();
      totalDownloadedBytes += blob.size;
      const downloadDuration = (Date.now() - downloadStartTime) / 1000; // in seconds
      const downloadSpeedMbps =
        (totalDownloadedBytes * 8) / downloadDuration / 1000000; // Bytes to Mbps

      onProgress({
        latency: latencySum / pingCount,
        download: downloadSpeedMbps,
        upload: 0,
        jitter: 0,
        packetLoss: 0,
      });
    }

    // 3. Upload Test
    let totalUploadedBytes = 0;
    const uploadStartTime = Date.now();
    const uploadData = new Uint8Array(uploadChunkSize).fill(0x01); // Fill with some data

    for (let i = 0; i < uploadChunks && isTestRunning; i++) {
      if (signal.aborted) throw new Error("Test aborted");
      // Using the ?during=upload parameter based on pattern, assuming it works
      await fetch("https://speed.cloudflare.com/__up?during=upload", {
        method: "POST",
        body: uploadData,
        signal,
      });
      totalUploadedBytes += uploadChunkSize;
      const uploadDuration = (Date.now() - uploadStartTime) / 1000; // in seconds
      const uploadSpeedMbps =
        (totalUploadedBytes * 8) / uploadDuration / 1000000; // Bytes to Mbps

      onProgress({
        latency: latencySum / pingCount,
        download:
          (totalDownloadedBytes * 8) /
          ((Date.now() - downloadStartTime) / 1000) /
          1000000,
        upload: uploadSpeedMbps,
        jitter: 0,
        packetLoss: 0,
      });
    }

    // Final results
    onProgress({
      latency: latencySum / pingCount,
      download:
        (totalDownloadedBytes * 8) /
        ((Date.now() - downloadStartTime) / 1000) /
        1000000,
      upload:
        (totalUploadedBytes * 8) /
        ((Date.now() - uploadStartTime) / 1000) /
        1000000,
      jitter: 0,
      packetLoss: 0,
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Cloudflare speed test aborted.");
    } else {
      console.error("Error during Cloudflare speed test:", error);
      throw error; // Re-throw to be caught by the calling component
    }
  } finally {
    isTestRunning = false;
    abortController = null;
  }
};

export const stopSpeedTest = (): void => {
  if (isTestRunning && abortController) {
    abortController.abort();
    isTestRunning = false;
  }
};

export const getIPInfo = async (): Promise<IPInfo> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    return await response.json();
  } catch (error) {
    console.error("Error fetching IP info:", error);
    return {
      ip: "Unknown",
    };
  }
};

export const getGPSLocation = async (): Promise<LocationData | null> => {
  try {
    const { getCurrentPositionAsync, requestForegroundPermissionsAsync } =
      Location;
    const { status } = await requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return null;
    }

    const location = await getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? 0,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
};
