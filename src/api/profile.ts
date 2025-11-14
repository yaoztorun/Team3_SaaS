import { supabase } from '../lib/supabase';
import { Profile } from '../types/profile';

export async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('Profile')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('Profile')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
