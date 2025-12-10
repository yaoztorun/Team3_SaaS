import { useState, useEffect, useMemo } from 'react';
import { fetchUserStats, UserStats } from '@/src/api/stats';

/**
 * Custom hook to fetch and compute user stats with derived values
 * Provides a single source of truth for stats calculation and display
 */
export const useUserStats = (userId: string | undefined) => {
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Derived stats display (0-5 scale)
    const avgRatingOutOf5 = useMemo(() => {
        const raw = userStats?.avgRating ?? 0;
        return Math.round(raw);
    }, [userStats?.avgRating]);

    const loadStats = async () => {
        if (!userId) {
            setUserStats(null);
            return;
        }

        setLoadingStats(true);
        setError(null);

        try {
            const stats = await fetchUserStats(userId);
            setUserStats(stats);
        } catch (err: any) {
            console.error('Failed to load user stats:', err);
            setError(err.message || 'Failed to load stats');
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [userId]);

    return {
        userStats,
        loadingStats,
        error,
        avgRatingOutOf5,
        refreshStats: loadStats,
    };
};
