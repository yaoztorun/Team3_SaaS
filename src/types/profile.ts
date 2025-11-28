import { Tables } from './supabase';
import { UserSettings } from './settings';

// Base Profile type from database
export type ProfileRow = Tables<'Profile'>;

// Application Profile type with properly typed settings JSON field
export type Profile = Omit<ProfileRow, 'settings'> & {
    settings: UserSettings | null;
};
