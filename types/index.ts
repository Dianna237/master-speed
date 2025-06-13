export interface TestResult {
  id: number
  timestamp: number
  latency: number
  jitter: number
  download: number
  upload: number
  packetLoss: number
  ipAddress: string
  location: string
  provider: string
  notes: string
}

export interface SpeedTestResult {
  download: number
  upload: number
  latency: number
  jitter: number
  packetLoss: number
}

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface IPInfo {
  ip: string
  city?: string
  region?: string
  country?: string
  loc?: string
  org?: string
  postal?: string
  timezone?: string
}
