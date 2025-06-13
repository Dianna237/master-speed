import * as Location from "expo-location";
import type { SpeedTestResult, LocationData, IPInfo } from "../types";

// Get device IP address and geolocation info
const getIPInfo = async (): Promise<IPInfo> => {
  try {
    // Get public IP using ipify API (free)
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();

    // Get IP geolocation using ipinfo.io (free tier with limits)
    const geoResponse = await fetch(`https://ipinfo.io/${ipData.ip}/json`);
    const geoData = await geoResponse.json();

    return {
      ip: ipData.ip,
      ...geoData,
    };
  } catch (error) {
    console.error("Error getting IP info:", error);
    return { ip: "Unknown" };
  }
};

// Get device GPS location
const getGPSLocation = async (): Promise<LocationData | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });


    console.log("================", location);
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? 0,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error("Error getting GPS location:", error);
    return null;
  }
};

// Measure latency using ping
const measureLatency = async (
  host = "google.com",
  count = 5
): Promise<{ latency: number; jitter: number }> => {
  try {
    // Using a simple fetch-based ping since we can't use raw ICMP in React Native
    const pings: number[] = [];

    for (let i = 0; i < count; i++) {
      const start = Date.now();
      await fetch(`https://${host}`, { method: "HEAD", cache: "no-cache" });
      const end = Date.now();
      pings.push(end - start);

      // Small delay between pings
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Calculate average latency
    const latency = pings.reduce((sum, time) => sum + time, 0) / pings.length;

    // Calculate jitter (average deviation from the mean)
    const jitter =
      pings.reduce((sum, time) => sum + Math.abs(time - latency), 0) /
      pings.length;

    return { latency, jitter };
  } catch (error) {
    console.error("Error measuring latency:", error);
    return { latency: 0, jitter: 0 };
  }
};

// Measure download speed using a test file
const measureDownloadSpeed = async (
  testFileUrl = "https://speed.cloudflare.com/10mb.bin",
  durationMs = 5000
): Promise<number> => {
  try {
    const startTime = Date.now();
    let bytesLoaded = 0;
    const abortController = new AbortController();

    // Set timeout to stop the test after specified duration
    setTimeout(() => abortController.abort(), durationMs);

    const response = await fetch(testFileUrl, {
      signal: abortController.signal,
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to get reader from response");

    while (true) {
      const { done, value } = await reader.read();

      if (done || Date.now() - startTime >= durationMs) {
        break;
      }

      if (value) {
        bytesLoaded += value.length;
      }
    }

    const durationSeconds = (Date.now() - startTime) / 1000;
    const bitsLoaded = bytesLoaded * 8;
    const speedMbps = bitsLoaded / durationSeconds / 1000000; // Convert to Mbps

    return speedMbps;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      console.log("Download test aborted as planned");
    } else {
      console.error("Error measuring download speed:", error);
    }
    return 0;
  }
};

// Measure upload speed
const measureUploadSpeed = async (
  uploadUrl = "https://httpbin.org/post",
  durationMs = 5000
): Promise<number> => {
  try {
    const startTime = Date.now();
    let bytesUploaded = 0;
    const chunkSize = 100000; // 100KB chunks

    // Generate random data for upload
    const generateRandomData = (size: number) => {
      const data = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        data[i] = Math.floor(Math.random() * 256);
      }
      return data;
    };

    while (Date.now() - startTime < durationMs) {
      const chunk = generateRandomData(chunkSize);

      await fetch(uploadUrl, {
        method: "POST",
        body: chunk,
      });

      bytesUploaded += chunkSize;
    }

    const durationSeconds = (Date.now() - startTime) / 1000;
    const bitsUploaded = bytesUploaded * 8;
    const speedMbps = bitsUploaded / durationSeconds / 1000000; // Convert to Mbps

    return speedMbps;
  } catch (error) {
    console.error("Error measuring upload speed:", error);
    return 0;
  }
};

// Estimate packet loss using multiple requests
const estimatePacketLoss = async (
  host = "google.com",
  count = 20
): Promise<number> => {
  try {
    let successful = 0;

    for (let i = 0; i < count; i++) {
      try {
        await fetch(`https://${host}`, {
          method: "HEAD",
          cache: "no-cache",
        });
        successful++;
      } catch (error) {
        // Request failed, count as packet loss
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const packetLoss = ((count - successful) / count) * 100;
    return packetLoss;
  } catch (error) {
    console.error("Error estimating packet loss:", error);
    return 0;
  }
};

// Run a complete network test
const runSpeedTest = async (): Promise<SpeedTestResult> => {
  const { latency, jitter } = await measureLatency();
  const download = await measureDownloadSpeed();
  const upload = await measureUploadSpeed();
  const packetLoss = await estimatePacketLoss();

  return {
    latency,
    jitter,
    download,
    upload,
    packetLoss,
  };
};

// Export all functions
const NetworkService = {
  getIPInfo,
  getGPSLocation,
  measureLatency,
  measureDownloadSpeed,
  measureUploadSpeed,
  estimatePacketLoss,
  runSpeedTest,
};

export default NetworkService;
