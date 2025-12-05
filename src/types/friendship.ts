import { Tables } from './supabase';
import { Profile } from './profile';

// Base Friendship type from database
export type FriendshipRow = Tables<'Friendship'>;

// Application types
export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export type Friendship = FriendshipRow;

export type FriendshipWithProfile = Friendship & {
    user_profile?: Profile;
    friend_profile?: Profile;
};

export type FriendRequest = {
    id: string;
    created_at: string;
    user_id: string;
    friend_id: string;
    status: FriendshipStatus;
    sender_profile: Profile;
};

export type Friend = {
    id: string;
    profile: Profile;
    friendship_id: string;
    created_at: string;
};
