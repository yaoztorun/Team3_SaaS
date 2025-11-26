import { UserSettings } from './settings';

export type Profile = {
    id: string;
    created_at: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    settings: UserSettings | null;
};
