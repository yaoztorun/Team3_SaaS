import { supabase } from '@/src/lib/supabase';
import { fetchUserSettings } from '@/src/api/settings';

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  data?: {
    url?: string;
    type?: string;
    [key: string]: any;
  };
}

/**
 * Check if user has push notifications enabled for a specific type
 */
export async function shouldSendPushNotification(
  userId: string,
  notificationType: 'likes' | 'comments' | 'party_invites' | 'friend_requests'
): Promise<boolean> {
  const settings = await fetchUserSettings(userId);
  return settings.notifications[notificationType] ?? true;
}

/**
 * Send a push notification to a user via Supabase Edge Function
 */
export const sendPushNotification = async (
  userId: string,
  notification: PushNotification
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: {
        userId,
        notification,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * Notification templates for common events
 */
export const NotificationTemplates = {
  like: (likerName: string, cocktailName: string, cocktailId: string): PushNotification => ({
    title: '❤️ New Like',
    body: `${likerName} liked your ${cocktailName}`,
    icon: '/icon_192.png',
    data: {
      type: 'like',
      url: `/cocktail/${cocktailId}`,
      cocktailId,
    },
  }),

  comment: (commenterName: string, cocktailName: string, cocktailId: string): PushNotification => ({
    title: '💬 New Comment',
    body: `${commenterName} commented on your ${cocktailName}`,
    icon: '/icon_192.png',
    data: {
      type: 'comment',
      url: `/cocktail/${cocktailId}`,
      cocktailId,
    },
  }),

  friendRequest: (userName: string, userId: string): PushNotification => ({
    title: '👥 Friend Request',
    body: `${userName} sent you a friend request`,
    icon: '/icon_192.png',
    data: {
      type: 'friend_request',
      url: `/profile/${userId}`,
      userId,
    },
  }),

  friendAccepted: (userName: string, userId: string): PushNotification => ({
    title: '✅ Friend Request Accepted',
    body: `${userName} accepted your friend request`,
    icon: '/icon_192.png',
    data: {
      type: 'friend_accepted',
      url: `/profile/${userId}`,
      userId,
    },
  }),

  eventInvite: (eventName: string, eventId: string): PushNotification => ({
    title: '🎉 Event Invitation',
    body: `You've been invited to ${eventName}`,
    icon: '/icon_192.png',
    data: {
      type: 'event_invite',
      url: `/event/${eventId}`,
      eventId,
    },
  }),

  streakReminder: (streakCount: number): PushNotification => ({
    title: '🔥 Maintain Your Streak!',
    body: `Don't break your ${streakCount}-day streak! Log a cocktail today.`,
    icon: '/icon_192.png',
    data: {
      type: 'streak_reminder',
      url: '/add',
    },
  }),
};
