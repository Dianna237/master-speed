import { GOOGLE_MAPS_API_KEY } from "@/config";

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return "Unknown location";
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    return "Unknown location";
  }
};
