import * as Location from "expo-location";
import type { IPInfo, LocationData } from "../types";

export const getIPInfo = async (): Promise<IPInfo> => {
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
