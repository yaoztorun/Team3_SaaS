import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from './useAuth';

/**
 * Hook to track the count of pending friend requests for the current user
 * Updates in real-time when new requests are received or existing ones are accepted/declined
 */
export function usePendingFriendRequests() {
    const { user } = useAuth();
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchPendingCount = useCallback(async () => {
        if (!user?.id) {
            setCount(0);
            setLoading(false);
            return;
        }

        try {
            const { count: pendingCount, error } = await supabase
                .from('Friendship')
                .select('*', { count: 'exact', head: true })
                .eq('friend_id', user.id)
                .eq('status', 'pending');

            if (error) {
                console.error('Error fetching pending requests count:', error);
                setCount(0);
            } else {
                setCount(pendingCount || 0);
            }
        } catch (err) {
            console.error('Error in fetchPendingCount:', err);
            setCount(0);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Manual refresh function that can be called externally
    const refresh = useCallback(() => {
        fetchPendingCount();
    }, [fetchPendingCount]);

    useEffect(() => {
        if (!user?.id) {
            setCount(0);
            setLoading(false);
            return;
        }

        // Initial fetch
        fetchPendingCount();

        // Subscribe to real-time changes
        // Listens for INSERT, UPDATE, and DELETE on Friendship table
        const subscription = supabase
            .channel(`pending_friend_requests_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Friendship',
                    filter: `friend_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Friend request change detected:', payload);
                    // Refetch count immediately when any change occurs
                    // This catches: new requests (INSERT), accepted (UPDATE), rejected (DELETE)
                    fetchPendingCount();
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to friend request changes');
                }
                if (err) {
                    console.error('Subscription error:', err);
                }
            });

        return () => {
            subscription.unsubscribe();
        };
    }, [user?.id, fetchPendingCount]);

    return { count, loading, refresh };
}
