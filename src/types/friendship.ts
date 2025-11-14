import { Profile } from './profile';

export type FriendshipStatus = 'pending' | 'accepted';

export type Friendship = {
    id: string;
    created_at: string;
    user_id: string;
    friend_id: string;
    status: FriendshipStatus;
};

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
