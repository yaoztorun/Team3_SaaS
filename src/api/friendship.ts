import { supabase } from '../lib/supabase';
import { Friendship, FriendRequest, Friend } from '../types/friendship';
import { Profile } from '../types/profile';
import { createNotification } from './notifications';

// Search for users by name or email
export async function searchUsers(query: string, currentUserId: string): Promise<Profile[]> {
    if (!query.trim()) return [];
    
    const { data, error } = await supabase
        .from('Profile')
        .select('*')
        .neq('id', currentUserId) // Exclude current user
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20);

    if (error) {
        console.error('Error searching users:', error);
        return [];
    }

    return data as Profile[];
}

// Send a friend request
export async function sendFriendRequest(userId: string, friendId: string): Promise<{ success: boolean; error?: string }> {
    // Check if a friendship already exists
    const { data: existing } = await supabase
        .from('Friendship')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    if (existing && existing.length > 0) {
        return { success: false, error: 'Friend request already exists' };
    }

    const { data: insertedFriendship, error } = await supabase
        .from('Friendship')
        .insert({
            user_id: userId,
            friend_id: friendId,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('Error sending friend request:', error);
        return { success: false, error: error.message };
    }

    // Get sender's name for notification
    const { data: senderProfile } = await supabase
        .from('Profile')
        .select('full_name')
        .eq('id', userId)
        .single();

    const senderName = senderProfile?.full_name || 'Someone';

    // Create notification for the friend request
    await createNotification({
        userId: friendId,
        actorId: userId,
        type: 'friend_request',
        friendshipId: insertedFriendship.id,
        message: `${senderName} sent you a friend request`,
    });

    return { success: true };
}

// Get pending friend requests (received by current user)
export async function getPendingFriendRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await supabase
        .from('Friendship')
        .select(`
            *,
            sender_profile:Profile!Friendship_user_id_fkey(*)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching friend requests:', error);
        return [];
    }

    return data as FriendRequest[];
}

// Get sent friend requests (sent by current user)
export async function getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await supabase
        .from('Friendship')
        .select(`
            *,
            friend_profile:Profile!Friendship_friend_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sent requests:', error);
        return [];
    }

    return data.map(item => ({
        ...item,
        sender_profile: item.friend_profile
    })) as FriendRequest[];
}

// Accept a friend request
export async function acceptFriendRequest(friendshipId: string): Promise<{ success: boolean; error?: string }> {
    // Get the friendship details before updating
    const { data: friendship, error: fetchError } = await supabase
        .from('Friendship')
        .select('user_id, friend_id')
        .eq('id', friendshipId)
        .single();

    if (fetchError || !friendship) {
        console.error('Error fetching friendship:', fetchError);
        return { success: false, error: fetchError?.message };
    }

    const { error } = await supabase
        .from('Friendship')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

    if (error) {
        console.error('Error accepting friend request:', error);
        return { success: false, error: error.message };
    }

    // Get current user (the one accepting)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // Get accepter's name for notification
        const { data: accepterProfile } = await supabase
            .from('Profile')
            .select('full_name')
            .eq('id', user.id)
            .single();

        const accepterName = accepterProfile?.full_name || 'Someone';

        // Notify the original sender that their request was accepted
        const originalSenderId = friendship.user_id;
        
        await createNotification({
            userId: originalSenderId,
            actorId: user.id,
            type: 'friend_accepted',
            friendshipId: friendshipId,
            message: `${accepterName} accepted your friend request`,
        });
    }

    return { success: true };
}

// Reject a friend request (deletes the request)
export async function rejectFriendRequest(friendshipId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('Friendship')
        .delete()
        .eq('id', friendshipId);

    if (error) {
        console.error('Error rejecting friend request:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Get all accepted friends
export async function getFriends(userId: string): Promise<Friend[]> {
    const { data, error } = await supabase
        .from('Friendship')
        .select(`
            *,
            user_profile:Profile!Friendship_user_id_fkey(*),
            friend_profile:Profile!Friendship_friend_id_fkey(*)
        `)
        .eq('status', 'accepted')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching friends:', error);
        return [];
    }

    // Map to Friend type, determining which profile to use
    return data.map(item => {
        const profile = item.user_id === userId ? item.friend_profile : item.user_profile;
        return {
            id: profile.id,
            profile: profile,
            friendship_id: item.id,
            created_at: item.created_at
        };
    }) as Friend[];
}

// Check friendship status between two users
export async function getFriendshipStatus(userId: string, friendId: string): Promise<'none' | 'pending' | 'accepted'> {
    const { data, error } = await supabase
        .from('Friendship')
        .select('status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .maybeSingle();

    if (error || !data) {
        return 'none';
    }

    return data.status as 'pending' | 'accepted';
}
