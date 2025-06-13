import AsyncStorage from "@react-native-async-storage/async-storage";

type TestResult = {
  date: string;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  loss: number;
};

const HISTORY_KEY = "speedtest_history";
export async function getTestHistory(): Promise<TestResult[]> {
  const data = await AsyncStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveTestResult(result: TestResult) {
  const history = await getTestHistory();
  history.unshift(result);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
