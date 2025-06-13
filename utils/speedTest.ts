export async function runSpeedTest() {
  // Ping test
  const pingStart = Date.now();
  await fetch("https://www.google.com", { method: "HEAD" });
  const ping = Date.now() - pingStart;

  // Download test
  const downloadStart = Date.now();
  await fetch("https://speed.hetzner.de/10MB.bin"); // Use a test file
  const downloadTime = (Date.now() - downloadStart) / 1000; // seconds
  const downloadSizeMB = 10; // MB
  const downloadSpeed = (downloadSizeMB / downloadTime) * 8; // Mbps

  // Upload test (simulated)
  const uploadStart = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate upload
  const uploadTime = (Date.now() - uploadStart) / 1000;
  const uploadSizeMB = 2; // MB
  const uploadSpeed = (uploadSizeMB / uploadTime) * 8; // Mbps

  return {
    ping,
    downloadSpeed: downloadSpeed.toFixed(2),
    uploadSpeed: uploadSpeed.toFixed(2),
  };
}
