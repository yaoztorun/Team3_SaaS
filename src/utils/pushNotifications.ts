import { Platform } from 'react-native';

const PUSH_PERMISSION_REQUESTED_KEY = 'sippin_push_permission_requested';

/**
 * Check if push notifications are supported
 */
export const isPushNotificationSupported = (): boolean => {
  if (Platform.OS !== 'web') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission | null => {
  if (Platform.OS !== 'web' || !('Notification' in window)) return null;
  return Notification.permission;
};

/**
 * Check if notification permission was already requested
 */
export const wasPermissionRequested = (): boolean => {
  if (Platform.OS !== 'web') return false;
  return localStorage.getItem(PUSH_PERMISSION_REQUESTED_KEY) === 'true';
};

/**
 * Mark that permission was requested
 */
export const markPermissionRequested = (): void => {
  if (Platform.OS === 'web') {
    localStorage.setItem(PUSH_PERMISSION_REQUESTED_KEY, 'true');
  }
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  markPermissionRequested();
  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
};

/**
 * Subscribe to push notifications
 * Returns the PushSubscription object to be stored in the database
 */
export const subscribeToPushNotifications = async (
  vapidPublicKey: string
): Promise<PushSubscription | null> => {
  if (!isPushNotificationSupported()) {
    console.error('Push notifications not supported');
    return null;
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('Already subscribed to push notifications');
      return subscription;
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    console.log('Successfully subscribed to push notifications');
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  if (!isPushNotificationSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const success = await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications:', success);
      return success;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

/**
 * Get current push subscription
 */
export const getCurrentPushSubscription = async (): Promise<PushSubscription | null> => {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
};

/**
 * Convert PushSubscription to JSON for storage
 */
export const subscriptionToJSON = (subscription: PushSubscription) => {
  return subscription.toJSON();
};

/**
 * Helper function to convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Show a test notification (requires permission)
 */
export const showTestNotification = async (title: string, body: string): Promise<void> => {
  if (!isPushNotificationSupported()) {
    throw new Error('Notifications not supported');
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body,
    icon: '/icon_192.png',
    badge: '/icon_192.png',
    tag: 'test-notification',
  } as NotificationOptions);
};
