import {create} from "zustand";

import { getTestHistory, saveTestResult } from "@/utils/history";

type TestResult = {
  date: string;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
};

type SpeedTestState = {
  results: TestResult[];
  loading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  addResult: (result: TestResult) => void;
  clearHistory: () => void;
};

export const useSpeedTestStore = create<SpeedTestState>((set) => ({
  results: [],
  loading: false,
  error: null,
  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const history = await getTestHistory();
      set({ results: history, loading: false });
    } catch (e) {
      set({ error: "Failed to fetch history", loading: false });
    }
  },
  addResult: async (result) => {
    await saveTestResult(result);
    set((state) => ({ results: [result, ...state.results] }));
  },
  clearHistory: () => set({ results: [] }),
}));
