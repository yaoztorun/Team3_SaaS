// src/api/comments.ts
import { supabase } from '@/src/lib/supabase';
import { createNotification } from '@/src/api/notifications';

export type CommentRow = {
  id: string;
  user_id: string;
  drink_log_id: string;
  content: string;
  created_at: string;
  Profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export async function addComment(
  drinkLogId: string,
  userId: string,
  content: string,
) {
  if (!userId) {
    return { success: false, error: 'Not logged in' };
  }
  if (!content.trim()) {
    return { success: false, error: 'Comment is empty' };
  }

  // 1) insert the comment
  const { error } = await supabase.from('DrinkLogComment').insert({
    user_id: userId,
    drink_log_id: drinkLogId,
    content,
  });

  if (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: error.message };
  }

  // 2) find the owner of the drink log
  const { data: log, error: logError } = await supabase
    .from('DrinkLog')
    .select('user_id')
    .eq('id', drinkLogId)
    .single();

  if (!logError && log && log.user_id && log.user_id !== userId) {
    // 3) create notification for the owner
    await createNotification({
      userId: log.user_id as string,
      actorId: userId,
      type: 'comment',
      drinkLogId,
      message: 'New comment on your drink log',
    });
  }

  return { success: true };
}

export async function getCommentsForLog(
  drinkLogId: string,
): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from('DrinkLogComment')
    .select(
      `
      id,
      user_id,
      drink_log_id,
      content,
      created_at,
      Profile (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq('drink_log_id', drinkLogId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // normalize Profile to single object or null
  const rows = (data ?? []).map((raw: any): CommentRow => {
    let profile = raw.Profile ?? null;
    if (Array.isArray(profile)) {
      profile = profile[0] ?? null;
    }

    return {
      id: raw.id as string,
      user_id: raw.user_id as string,
      drink_log_id: raw.drink_log_id as string,
      content: raw.content as string,
      created_at: raw.created_at as string,
      Profile: profile
        ? {
            id: profile.id as string,
            full_name: (profile.full_name ?? null) as string | null,
            avatar_url: (profile.avatar_url ?? null) as string | null,
          }
        : null,
    };
  });

  return rows;
}

// comment counts for feed
export async function getCommentCountsForLogs(
  drinkLogIds: string[],
): Promise<Map<string, number>> {
  if (drinkLogIds.length === 0) return new Map<string, number>();

  const { data, error } = await supabase
    .from('DrinkLogComment')
    .select('drink_log_id')
    .in('drink_log_id', drinkLogIds);

  if (error) {
    console.error('Error fetching comment counts:', error);
    return new Map<string, number>();
  }

  const counts = new Map<string, number>();
  (data ?? []).forEach((row: any) => {
    const logId = row.drink_log_id as string;
    counts.set(logId, (counts.get(logId) ?? 0) + 1);
  });

  return counts;
}

// delete comment (only own comment allowed by RLS)
export async function deleteComment(
  commentId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'Not logged in' };
  }

  const { error } = await supabase
    .from('DrinkLogComment')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
