// src/api/likes.ts
import { supabase } from '@/src/lib/supabase';
import { createNotification } from '@/src/api/notifications';

export async function getLikesForLogs(
  drinkLogIds: string[],
  currentUserId: string,
): Promise<{
  counts: Map<string, number>;
  likedByMe: Set<string>;
}> {
  if (drinkLogIds.length === 0) {
    return { counts: new Map(), likedByMe: new Set() };
  }

  const { data, error } = await supabase
    .from('DrinkLogLike')
    .select('drink_log_id, user_id')
    .in('drink_log_id', drinkLogIds);

  if (error) {
    console.error('Error fetching likes:', error);
    return { counts: new Map(), likedByMe: new Set() };
  }

  const counts = new Map<string, number>();
  const likedByMe = new Set<string>();

  (data ?? []).forEach((row: any) => {
    const logId = row.drink_log_id as string;
    const userId = row.user_id as string;

    counts.set(logId, (counts.get(logId) ?? 0) + 1);
    if (userId === currentUserId) likedByMe.add(logId);
  });

  return { counts, likedByMe };
}

export async function toggleLike(
  drinkLogId: string,
  userId: string,
  currentlyLiked: boolean,
): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: 'Not logged in' };

  // UNLIKE
  if (currentlyLiked) {
    const { error } = await supabase
      .from('DrinkLogLike')
      .delete()
      .eq('drink_log_id', drinkLogId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unliking drink log:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // LIKE
  const { error } = await supabase.from('DrinkLogLike').insert({
    user_id: userId,
    drink_log_id: drinkLogId,
  });

  if (error) {
    console.error('Error liking drink log:', error);
    return { success: false, error: error.message };
  }

  // Get log owner + cocktail name
  const { data: log, error: logError } = await supabase
    .from('DrinkLog')
    .select(
      `
      user_id,
      Cocktail (
        name
      )
    `,
    )
    .eq('id', drinkLogId)
    .single();

  // Get actor profile for name
  const { data: actorProfile } = await supabase
    .from('Profile')
    .select('full_name')
    .eq('id', userId)
    .single();

  if (!logError && log && log.user_id && log.user_id !== userId) {
    const cocktailName = (log as any).Cocktail?.name || 'drink';
    const actorName = actorProfile?.full_name || 'Someone';

    await createNotification({
      userId: log.user_id as string,
      actorId: userId,
      type: 'like',
      drinkLogId,
      message: `${actorName} liked your ${cocktailName}`,
    });
  }

  return { success: true };
}
