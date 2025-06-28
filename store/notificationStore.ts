import { create } from "zustand";
import * as Notifications from "expo-notifications";
import {
  initializeNotificationService,
  getPushToken,
  getPermissionsStatus,
  requestNotificationPermissions,
  cancelAllNotifications as cancelNotifications,
} from "../services/NotificationService";

interface NotificationState {
  expoPushToken: string;
  notification: Notifications.Notification | undefined;
  permissionStatus: Notifications.NotificationPermissionsStatus | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setNotification: (
    notification: Notifications.Notification | undefined
  ) => void;
  setExpoPushToken: (token: string) => void;
  setPermissionStatus: (
    status: Notifications.NotificationPermissionsStatus | null
  ) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;

  // Async actions
  initialize: () => Promise<void>;
  checkPermissions: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  cancelAllNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  expoPushToken: "",
  notification: undefined,
  permissionStatus: null,
  isLoading: true,
  isInitialized: false,

  // Actions
  setNotification: (notification) => set({ notification }),
  setExpoPushToken: (token) => set({ expoPushToken: token }),
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setLoading: (loading) => set({ isLoading: loading }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),

  // Async actions
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Initialize notification service
      await initializeNotificationService();

      // Get push token after initialization
      const token = getPushToken();
      if (token) {
        set({ expoPushToken: token });
        console.log("Push token set in store:", token);
      }

      // Check permissions
      await get().checkPermissions();

      set({ isInitialized: true, isLoading: false });
      console.log("Notification store initialized successfully");
    } catch (error) {
      console.error("Failed to initialize notification store:", error);
      set({ isLoading: false });
    }
  },

  checkPermissions: async () => {
    try {
      set({ isLoading: true });
      const status = await getPermissionsStatus();
      set({ permissionStatus: status, isLoading: false });
    } catch (error) {
      console.error("Error checking notification permissions:", error);
      set({ isLoading: false });
    }
  },

  requestPermissions: async () => {
    try {
      set({ isLoading: true });
      const granted = await requestNotificationPermissions();
      await get().checkPermissions();
      return granted;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      set({ isLoading: false });
      return false;
    }
  },

  cancelAllNotifications: async () => {
    try {
      await cancelNotifications();
    } catch (error) {
      console.error("Error canceling notifications:", error);
    }
  },
}));
