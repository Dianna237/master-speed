# Enhanced Notification and Background Task Features

This document describes the enhanced notification and background task features implemented in the Network Monitor app, based on the [expo-notifications-app](https://github.com/betomoedano/expo-notifications-app) repository patterns.

## Features

### 1. Test Start Notifications

- When a network test starts, users receive both local and push notifications
- Notification includes test ID and start time
- Background monitoring begins automatically
- Push notifications work even when app is closed

### 2. Test Completion Notifications

- When a test completes, users receive detailed notifications
- Shows download speed, upload speed, and latency
- Includes quality assessment (Excellent, Good, Fair, Poor)
- Notification contains test results data
- Both local and push notifications are sent

### 3. Test Progress Notifications

- Real-time progress updates during background tests
- Shows current test stage and progress percentage
- Keeps users informed during long-running tests

### 4. Test Error Notifications

- Notifies users when tests fail or timeout
- Includes error details for debugging
- Handles both user-initiated stops and system errors
- Both local and push notifications are sent

### 5. Background Task Monitoring

- Monitors test progress in the background
- Detects test timeouts (5 minutes max)
- Sends timeout notifications if tests run too long
- Runs every 30 seconds when active

### 6. Push Notification Support

- Full push notification integration using Expo's push service
- Works on physical devices (not simulators)
- Handles notification taps and responses
- Automatic token management

## Implementation Details

### Files Modified/Created

1. **`services/NotificationService.ts`** - Enhanced notification service

   - Function-based approach following latest Expo documentation
   - Push notification support using Expo's push service
   - Background test progress notifications
   - Enhanced error handling and logging
   - Token management and registration
2. **`store/notificationStore.ts`** - Notification Zustand store (new)

   - Manages notification state across the app using Zustand
   - Handles notification listeners and initialization
   - Provides push token access and permission management
   - Follows Zustand patterns for state management
3. **`store/themeStore.ts`** - Theme Zustand store (enhanced)

   - Manages theme state using Zustand
   - Provides light/dark mode switching
   - Integrates with system theme preferences
4. **`components/ThemeProvider.tsx`** - Theme provider (new)

   - Provides theme context with colors and theme switching
   - Integrates with Zustand theme store
   - Syncs with system color scheme
5. **`components/NotificationDisplay.tsx`** - Notification display component (updated)

   - Shows latest notification information
   - Displays notification data and content
   - Uses new theme provider and Zustand store
6. **`hooks/useNotifications.ts`** - Enhanced notification hook (updated)

   - Now uses Zustand store instead of local state
   - Provides permission status and management
   - Handles permission requests
7. **`screens/HomeScreen.tsx`** - Updated test screen (updated)

   - Integrates background test progress notifications
   - Enhanced notification integration
   - Uses new theme provider
8. **`screens/SettingsScreen.tsx`** - Enhanced settings (updated)

   - Notification permission management
   - Push token display
   - Notification display component
   - Clear notifications option
   - Uses new theme provider and Zustand stores
9. **`App.tsx`** - Updated main app (updated)

   - Theme provider integration
   - Notification store initialization
   - Simplified state management
   - Better notification listener setup
10. **`app.json`** - Updated configuration

    - Added notification permissions
    - Background task configuration
    - iOS and Android specific settings

### Notification Types

1. **Test Start**: `test_started`
2. **Test Complete**: `test_completed`
3. **Test Error**: `test_error`
4. **Test Timeout**: `test_timeout`
5. **Test Progress**: `test_progress` (new)

### Background Task

- **Task Name**: `test-monitoring-task`
- **Interval**: 30 seconds
- **Purpose**: Monitor active tests for timeouts
- **Timeout**: 5 minutes maximum test duration

## Zustand-Based State Management

The notification system now uses Zustand for state management instead of React Context:

### Notification Store

```typescript
// Use notification store
const {
  expoPushToken,
  notification,
  permissionStatus,
  isLoading,
  setNotification,
  initialize,
  requestPermissions,
  cancelAllNotifications,
} = useNotificationStore();

// Initialize notification system
await initialize();

// Access notification state
console.log('Push token:', expoPushToken);
console.log('Latest notification:', notification);
```

### Theme Store

```typescript
// Use theme store
const { isDark, setTheme } = useThemeStore();

// Switch themes
setTheme('dark');
setTheme('light');
```

### Theme Provider Usage

```typescript
// Use theme context
const { isDark, colors, setTheme } = useTheme();

// Access theme colors
const backgroundColor = colors.background;
const textColor = colors.text;

// Switch themes
setTheme('dark');
```

## Function-Based API

The notification service uses a function-based approach following the latest Expo documentation:

### Core Functions

```typescript
// Initialize the notification service
await initializeNotificationService();

// Send notifications
await notifyTestStart();
await notifyTestComplete(result);
await notifyTestError(error);
await notifyBackgroundTestProgress(progress, stage);

// Push notification support
const token = await registerForPushNotificationsAsync();
await sendPushNotification(token, title, body, data);

// Permission management
const status = await getPermissionsStatus();
const granted = await requestNotificationPermissions();

// Utility functions
await cancelAllNotifications();
const testState = getCurrentTestState();
const pushToken = getPushToken();
```

## Push Notification Support

The service includes comprehensive push notification support:

### Registration

```typescript
// Automatic registration during app initialization
const token = await registerForPushNotificationsAsync();
```

### Sending Push Notifications

```typescript
// Send to Expo's push service
await sendPushNotification(
  expoPushToken,
  'Test Complete',
  'Your network test is ready!',
  { type: 'test_completed' }
);
```

### Notification Handling

```typescript
// Set up listeners
const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
  console.log('Notification received:', notification);
});

const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
  console.log('Notification tapped:', response);
});
```

## Permissions Required

### iOS

- `UIBackgroundModes`: `background-processing`, `background-fetch`
- `NSUserNotificationsUsageDescription`: Notification usage description

### Android

- `RECEIVE_BOOT_COMPLETED`: Background task support
- `WAKE_LOCK`: Keep device awake during tests
- `VIBRATE`: Notification vibration
- `POST_NOTIFICATIONS`: Send notifications

## Usage

### For Users

1. Grant notification permissions when prompted
2. Start a network test
3. Receive notifications for test start, progress, and completion
4. View notification information in Settings screen
5. Manage notification settings
6. Switch between light and dark themes

### For Developers

1. Import notification functions from `services/NotificationService`
2. Use Zustand stores for state management
3. Use theme provider for consistent theming
4. Call appropriate functions for test events
5. Handle notification responses and taps

## Testing

To test the notification features:

1. **Test Start**: Start a network test and check for start notification
2. **Test Progress**: Monitor background test progress notifications
3. **Test Complete**: Let a test complete and verify completion notification
4. **Test Error**: Stop a test manually or simulate an error
5. **Background Monitoring**: Start a test and wait for timeout (5 minutes)
6. **Push Notifications**: Test on physical device (not simulator)
7. **Permissions**: Test permission requests in Settings screen
8. **Theme Switching**: Test light/dark mode switching in Settings

## Troubleshooting

### Common Issues

1. **Notifications not appearing**:

   - Check notification permissions in device settings
   - Verify app has notification permissions
   - Check if Do Not Disturb is enabled
   - Ensure physical device is used (not simulator)
2. **Push notifications not working**:

   - Ensure physical device is used (not simulator)
   - Check project ID configuration in app.config.ts
   - Verify EAS configuration
   - Check network connectivity
3. **Background tasks not working**:

   - Ensure app has background processing permissions
   - Check device battery optimization settings
   - Verify background app refresh is enabled (iOS)
4. **Permission errors**:

   - Handle permission denial gracefully
   - Provide clear instructions for manual permission enabling
   - Check platform-specific permission requirements
5. **Theme not switching**:

   - Check Zustand store initialization
   - Verify theme provider is wrapping the app
   - Check system theme sync settings

### Debug Information

The notification service logs important events:

- Permission status changes
- Notification sending attempts
- Background task execution
- Test state changes
- Push token registration
- Notification responses
- Theme switching events

Check console logs for debugging information.

## Migration from Previous Implementation

The notification system has been enhanced with:

### New Features

- Push notification support
- Background test progress notifications
- Zustand-based state management
- Enhanced theme system with provider
- Better error handling
- Improved state management

### Improved Architecture

- Function-based approach
- Zustand-based state management
- Theme provider with context
- Better separation of concerns
- Enhanced debugging capabilities

### Enhanced User Experience

- Real-time progress updates
- Push notifications when app is closed
- Better notification display
- Improved error handling
- Consistent theming across the app
- Smooth theme switching

This implementation follows the best practices from the [expo-notifications-app](https://github.com/betomoedano/expo-notifications-app) repository and provides a robust, production-ready notification system for network speed testing with modern state management using Zustand.
