import { supabase } from '../lib/supabase';

export type TaggedUser = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type DrinkLogTag = {
  id: string;
  drink_log_id: string;
  tagged_user_id: string;
  created_at: string;
  Profile?: TaggedUser;
};

/**
 * Add tags to a drink log
 */
export async function addTags(
  drinkLogId: string,
  taggedUserIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (taggedUserIds.length === 0) {
    return { success: true };
  }

  const tags = taggedUserIds.map(userId => ({
    drink_log_id: drinkLogId,
    tagged_user_id: userId,
  }));

  const { error } = await supabase
    .from('DrinkLogTag')
    .insert(tags);

  if (error) {
    console.error('Error adding tags:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get tags for a drink log
 */
export async function getTagsForLog(
  drinkLogId: string
): Promise<TaggedUser[]> {
  const { data, error } = await supabase
    .from('DrinkLogTag')
    .select(`
      id,
      Profile:tagged_user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('drink_log_id', drinkLogId);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Extract profiles from the nested structure
  return (data || [])
    .map((tag: any) => tag.Profile)
    .filter((profile): profile is TaggedUser => profile !== null);
}

/**
 * Get tags for multiple drink logs (bulk query)
 */
export async function getTagsForLogs(
  drinkLogIds: string[]
): Promise<Map<string, TaggedUser[]>> {
  if (drinkLogIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('DrinkLogTag')
    .select(`
      drink_log_id,
      Profile:tagged_user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .in('drink_log_id', drinkLogIds);

  if (error) {
    console.error('Error fetching tags for logs:', error);
    return new Map();
  }

  const tagsMap = new Map<string, TaggedUser[]>();

  (data || []).forEach((tag: any) => {
    const logId = tag.drink_log_id;
    const profile = tag.Profile;

    if (!profile) return;

    if (!tagsMap.has(logId)) {
      tagsMap.set(logId, []);
    }
    tagsMap.get(logId)!.push(profile as TaggedUser);
  });

  return tagsMap;
}

/**
 * Remove a tag from a drink log
 */
export async function removeTag(
  drinkLogId: string,
  taggedUserId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('DrinkLogTag')
    .delete()
    .eq('drink_log_id', drinkLogId)
    .eq('tagged_user_id', taggedUserId);

  if (error) {
    console.error('Error removing tag:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
