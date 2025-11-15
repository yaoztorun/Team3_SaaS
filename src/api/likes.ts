// src/api/likes.ts
import { supabase } from '@/src/lib/supabase';

export type LikeRow = {
  id: string;
  user_id: string;
  drink_log_id: string;
  created_at: string;
};

export async function toggleLike(drinkLogId: string, userId: string, currentlyLiked: boolean) {
  if (!userId) {
    return { success: false, error: 'Not logged in' };
  }

  if (currentlyLiked) {
    // unlike: delete existing row
    const { error } = await supabase
      .from('DrinkLogLike')
      .delete()
      .eq('user_id', userId)
      .eq('drink_log_id', drinkLogId);

    if (error) {
      console.error('Error unliking log:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } else {
    // like: insert new row
    const { error } = await supabase.from('DrinkLogLike').insert({
      user_id: userId,
      drink_log_id: drinkLogId,
    });

    if (error) {
      // ignore "duplicate key" (user already liked)
      console.error('Error liking log:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}

// Get likes for a set of logs
export async function getLikesForLogs(drinkLogIds: string[], currentUserId?: string) {
  if (drinkLogIds.length === 0) return { counts: new Map<string, number>(), likedByMe: new Set<string>() };

  const { data, error } = await supabase
    .from('DrinkLogLike')
    .select('drink_log_id, user_id')
    .in('drink_log_id', drinkLogIds);

  if (error) {
    console.error('Error fetching likes:', error);
    return { counts: new Map<string, number>(), likedByMe: new Set<string>() };
  }

  const counts = new Map<string, number>();
  const likedByMe = new Set<string>();

  (data ?? []).forEach((row: any) => {
    const logId = row.drink_log_id as string;
    const userId = row.user_id as string;
    counts.set(logId, (counts.get(logId) ?? 0) + 1);
    if (currentUserId && userId === currentUserId) likedByMe.add(logId);
  });

  return { counts, likedByMe };
}
