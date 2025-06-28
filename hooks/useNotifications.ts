import { useNotificationStore } from "../store/notificationStore";

export const useNotifications = () => {
  const {
    permissionStatus,
    isLoading,
    requestPermissions,
    cancelAllNotifications,
    checkPermissions,
  } = useNotificationStore();

  return {
    permissionStatus,
    isLoading,
    requestPermissions,
    cancelAllNotifications,
    checkPermissions,
  };
};
