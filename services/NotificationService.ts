import * as Notifications from "expo-notifications";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { SpeedTestResult } from "../types";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Background task name
const TEST_MONITORING_TASK = "test-monitoring-task";

// Store test state
let currentTestId: string | null = null;
let testStartTime: number | null = null;
let isInitialized = false;
let expoPushToken: string | null = null;

// Function to handle registration errors
function handleRegistrationError(errorMessage: string) {
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// Function to register for push notifications (following expo-notifications-app pattern)
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("Push token:", pushTokenString);
      token = pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }

  return token;
}

// Send push notification to Expo's push service
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

// Initialize notification service
export async function initializeNotificationService(): Promise<void> {
  if (isInitialized) return;

  try {
    // Register for push notifications
    const token = await registerForPushNotificationsAsync();
    expoPushToken = token || null;

    // Define background task for test monitoring
    TaskManager.defineTask(TEST_MONITORING_TASK, async () => {
      try {
        // Check if test is still running
        if (currentTestId && testStartTime) {
          const elapsedTime = Date.now() - testStartTime;
          const maxTestDuration = 5 * 60 * 1000; // 5 minutes max

          // If test has been running too long, notify user
          if (elapsedTime > maxTestDuration) {
            await sendNotification({
              title: "Test Timeout",
              body: "Your network test has been running for a while. Consider checking the app.",
              data: { type: "test_timeout", testId: currentTestId },
            });

            // Also send push notification if token is available
            if (expoPushToken) {
              await sendPushNotification(
                expoPushToken,
                "Test Timeout",
                "Your network test has been running for a while. Consider checking the app.",
                { type: "test_timeout", testId: currentTestId }
              );
            }

            clearTestState();
          }
        }
      } catch (error) {
        console.error("Background task error:", error);
      }
    });

    // Register background task
    await BackgroundTask.registerTaskAsync(TEST_MONITORING_TASK, {
      minimumInterval: 30 * 1000, // 30 seconds
    });

    isInitialized = true;
    console.log("NotificationService initialized successfully");
  } catch (error) {
    console.error("Failed to initialize NotificationService:", error);
  }
}

// Send notification when test starts
export async function notifyTestStart(): Promise<void> {
  try {
    const testId = `test_${Date.now()}`;
    currentTestId = testId;
    testStartTime = Date.now();

    const notificationData = { type: "test_started", testId };

    // Send local notification
    await sendNotification({
      title: "Network Test Started",
      body: "Your network speed test is now running in the background.",
      data: notificationData,
    });

    // Send push notification if token is available
    if (expoPushToken) {
      await sendPushNotification(
        expoPushToken,
        "Network Test Started",
        "Your network speed test is now running in the background.",
        notificationData
      );
    }

    console.log("Test start notification sent");
  } catch (error) {
    console.error("Failed to send test start notification:", error);
  }
}

// Send notification when test completes
export async function notifyTestComplete(
  result: SpeedTestResult
): Promise<void> {
  try {
    const downloadSpeed = result.download.toFixed(1);
    const uploadSpeed = result.upload.toFixed(1);
    const latency = result.latency.toFixed(0);

    let quality = "Good";
    if (result.latency < 50 && result.packetLoss < 1) quality = "Excellent";
    else if (result.latency < 100 && result.packetLoss < 5) quality = "Good";
    else if (result.latency < 200 && result.packetLoss < 10) quality = "Fair";
    else quality = "Poor";

    const notificationData = {
      type: "test_completed",
      testId: currentTestId,
      result: JSON.stringify(result),
    };

    const title = `Test Complete - ${quality} Quality`;
    const body = `Download: ${downloadSpeed} Mbps | Upload: ${uploadSpeed} Mbps | Latency: ${latency}ms`;

    // Send local notification
    await sendNotification({
      title,
      body,
      data: notificationData,
    });

    // Send push notification if token is available
    if (expoPushToken) {
      await sendPushNotification(expoPushToken, title, body, notificationData);
    }

    // Clear test state
    clearTestState();
    console.log("Test completion notification sent");
  } catch (error) {
    console.error("Failed to send test completion notification:", error);
  }
}

// Send notification when test errors occur
export async function notifyTestError(error: string): Promise<void> {
  try {
    const notificationData = { type: "test_error", testId: currentTestId };

    // Send local notification
    await sendNotification({
      title: "Test Failed",
      body: `Network test encountered an error: ${error}`,
      data: notificationData,
    });

    // Send push notification if token is available
    if (expoPushToken) {
      await sendPushNotification(
        expoPushToken,
        "Test Failed",
        `Network test encountered an error: ${error}`,
        notificationData
      );
    }

    clearTestState();
    console.log("Test error notification sent");
  } catch (err) {
    console.error("Failed to send test error notification:", err);
  }
}

// Send notification when test is running in background
export async function notifyBackgroundTestProgress(
  progress: number,
  stage: string
): Promise<void> {
  try {
    const notificationData = {
      type: "test_progress",
      testId: currentTestId,
      progress,
      stage,
    };

    const title = "Test in Progress";
    const body = `Network test: ${stage} (${Math.round(progress * 100)}%)`;

    // Send local notification
    await sendNotification({
      title,
      body,
      data: notificationData,
    });

    console.log("Background test progress notification sent");
  } catch (error) {
    console.error(
      "Failed to send background test progress notification:",
      error
    );
  }
}

// Helper function to send local notifications
async function sendNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: any;
}): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

// Clear test state
function clearTestState(): void {
  currentTestId = null;
  testStartTime = null;
}

// Get current test state
export function getCurrentTestState(): {
  testId: string | null;
  startTime: number | null;
} {
  return {
    testId: currentTestId,
    startTime: testStartTime,
  };
}

// Get push token
export function getPushToken(): string | null {
  return expoPushToken;
}

// Cancel all pending notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get notification permissions status
export async function getPermissionsStatus(): Promise<Notifications.NotificationPermissionsStatus> {
  return await Notifications.getPermissionsAsync();
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

// Set up notification listeners
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    onNotificationReceived
  );
  const responseListener =
    Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
