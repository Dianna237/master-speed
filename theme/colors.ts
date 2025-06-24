export const lightColors = {
  background: "#E0E0E0",
  card: "#FFFFFF",
  text: "#1C1C1E",
  border: "#ddd",
  primary: "#007AFF",
  secondary: "#DBFEFE",
  accent: "#048B8B",
  danger: "#FF5754",
  option: "#FFB826",
  optionBg: "#FFF1D3",
  green: "#09AD2D",
  lightGreen: "#B9FFC8",
  ash: "#D9D9D9",
  lightAsh: "#E0E0E0",
  grey: "#555252",
  lighterGrey: "#878787",
};

export const darkColors = {
  background: "#181A1B",
  card: "#232627",
  text: "#E5E5EA",
  border: "#333",
  primary: "#007AFF",
  secondary: "#004C4C",
  accent: "#00B8B8",
  danger: "#FF5754",
  option: "#FFB826",
  optionBg: "#3E3E3E",
  green: "#09AD2D",
  lightGreen: "#1B5E20",
  ash: "#3E3E3E",
  lightAsh: "#232627",
  grey: "#B0B0B0",
  lighterGrey: "#555252",
};

export function getColors(scheme: "light" | "dark") {
  return scheme === "dark" ? darkColors : lightColors;
}
