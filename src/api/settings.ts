import { supabase } from '@/src/lib/supabase';
import { UserSettings, defaultSettings } from '@/src/types/settings';

export async function fetchUserSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('Profile')
    .select('settings')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user settings:', error);
    return defaultSettings;
  }

  // If settings is null or empty, return defaults
  if (!data?.settings) {
    return defaultSettings;
  }

  // Merge with defaults to ensure all fields exist
  return {
    notifications: {
      ...defaultSettings.notifications,
      ...(data.settings.notifications || {}),
    },
  };
}

export async function updateUserSettings(
  userId: string,
  settings: UserSettings
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('Profile')
    .update({ settings })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user settings:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
