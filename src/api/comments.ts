// src/api/comments.ts
import { supabase } from '@/src/lib/supabase';

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

  const { error } = await supabase.from('DrinkLogComment').insert({
    user_id: userId,
    drink_log_id: drinkLogId,
    content,
  });

  if (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: error.message };
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

  // 🔹 Safely map result and normalize Profile to a single object or null
  const rows = (data ?? []).map((raw: any): CommentRow => {
    let profile = raw.Profile ?? null;

    // if Supabase gives Profile as an array, take the first element
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

// tiny helper just to get counts when loading feed
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
