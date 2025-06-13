export async function runSpeedTest() {
  // Ping test (multiple times for jitter/loss)
  const pingAttempts = 5;
  let pings: number[] = [];
  let lost = 0;
  for (let i = 0; i < pingAttempts; i++) {
    const pingStart = Date.now();
    try {
      await fetch("https://www.google.com", { method: "HEAD" });
      pings.push(Date.now() - pingStart);
    } catch {
      lost++;
    }
  }
  const ping = pings.length > 0 ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) : 0;
  const jitter = pings.length > 1
    ? Math.round(Math.sqrt(pings.map(x => Math.pow(x - ping, 2)).reduce((a, b) => a + b, 0) / (pings.length - 1)))
    : 0;
  const loss = Math.round((lost / pingAttempts) * 100);

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
    jitter,
    loss,
    downloadSpeed: downloadSpeed.toFixed(2),
    uploadSpeed: uploadSpeed.toFixed(2),
  };
}
