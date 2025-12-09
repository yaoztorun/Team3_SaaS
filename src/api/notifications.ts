// src/api/notifications.ts
import { supabase } from '@/src/lib/supabase';
import { fetchUserSettings } from '@/src/api/settings';

export type NotificationType =
  | 'like'
  | 'comment'
  | 'friend_request'
  | 'friend_accepted'
  | 'close_friend_post'
  | 'party_invite';

export type NotificationRow = {
  id: string;
  created_at: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  drink_log_id: string | null;
  friendship_id: string | null;
  event_id: string | null;
  message: string | null;
  is_read: boolean;
};

export const formatTimeAgo = (isoDate: string) => {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
};

// list for modal
export async function fetchNotifications(limit = 40): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from('Notification')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return (data ?? []) as NotificationRow[];
}

// unread count for bell
export async function getUnreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from('Notification')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }
  return count ?? 0;
}

// mark all as read
export async function markAllNotificationsRead() {
  const { error } = await supabase
    .from('Notification')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) {
    console.error('Error marking notifications as read:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// delete single
export async function deleteNotification(id: string) {
  const { error } = await supabase.from('Notification').delete().eq('id', id);

  if (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// create – used by likes/comments/etc.
export async function createNotification(input: {
  userId: string; // receiver
  actorId: string; // who did the action (auth.uid)
  type: NotificationType;
  drinkLogId?: string | null;
  friendshipId?: string | null;
  eventId?: string | null;
  message?: string | null;
}) {
  const {
    userId,
    actorId,
    type,
    drinkLogId = null,
    friendshipId = null,
    eventId = null,
    message = null,
  } = input;

  // Check user's notification settings
  const userSettings = await fetchUserSettings(userId);
  
  // Check if this notification type is enabled
  const shouldSendNotification = (() => {
    switch (type) {
      case 'like':
        return userSettings.notifications.likes;
      case 'comment':
        return userSettings.notifications.comments;
      case 'friend_request':
        return userSettings.notifications.friend_requests;
      case 'friend_accepted':
        return userSettings.notifications.friend_requests; // Use friend_requests setting for accepted too
      case 'close_friend_post':
        return true; // Always send for now, can add setting later
      default:
        return true;
    }
  })();

  if (!shouldSendNotification) {
    return { success: true, skipped: true };
  }

  const insertData = {
    user_id: userId,
    actor_id: actorId,
    type,
    drink_log_id: drinkLogId,
    friendship_id: friendshipId,
    event_id: eventId,
    message,
  };
  
  console.log('Attempting to insert notification:', insertData);
  
  const { error } = await supabase.from('Notification').insert(insertData);

  if (error) {
    console.error('Error creating notification:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return { success: false, error: error.message };
  }
  return { success: true };
}
