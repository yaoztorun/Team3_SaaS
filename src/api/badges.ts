import { supabase } from '@/src/lib/supabase';

export type BadgeType =
  | 'cocktails'
  | 'friends'
  | 'partiesHosted'
  | 'partiesAttended'
  | 'recipes'
  | 'streak';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | null;

export interface Badge {
  type: BadgeType;
  tier: BadgeTier;
  imageUrl: string;
  count: number;
  label: string;
}

const BADGE_THRESHOLDS = {
  bronze: 5,
  silver: 20,
  gold: 50,
};

// Map badge types to their file names in the bucket
const BADGE_FILE_MAP: Record<BadgeType, string> = {
  cocktails: 'cocktail',
  friends: 'friends',
  partiesHosted: 'party1', // Parties hosted
  partiesAttended: 'party2', // Parties attended
  recipes: 'recipe',
  streak: 'streak',
};

const BADGE_LABELS: Record<BadgeType, string> = {
  cocktails: 'Cocktails Logged',
  friends: 'Friends',
  partiesHosted: 'Parties Hosted',
  partiesAttended: 'Parties Attended',
  recipes: 'Recipes Created',
  streak: 'Day Streak',
};

/**
 * Get the badge tier based on count
 */
function getBadgeTier(count: number): BadgeTier {
  if (count >= BADGE_THRESHOLDS.gold) return 'gold';
  if (count >= BADGE_THRESHOLDS.silver) return 'silver';
  if (count >= BADGE_THRESHOLDS.bronze) return 'bronze';
  return null;
}

/**
 * Get public URL for a badge image from Supabase storage
 */
function getBadgeImageUrl(type: BadgeType, tier: BadgeTier): string {
  if (!tier) return '';

  const fileName = BADGE_FILE_MAP[type];
  const tierLetter = tier === 'bronze' ? 'B' : tier === 'silver' ? 'S' : 'G';
  const fullFileName = `${fileName}${tierLetter}.png`;

  const { data } = supabase.storage
    .from('badges')
    .getPublicUrl(fullFileName);

  return data.publicUrl;
}

/**
 * Calculate current streak from drink logs
 */
function calculateStreak(drinkDates: string[]): number {
  if (drinkDates.length === 0) return 0;

  const daySet = new Set<string>(
    drinkDates.map((iso) => new Date(iso).toISOString().slice(0, 10))
  );

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Only count if user has logged today
  if (!daySet.has(todayStr)) {
    return 0;
  }

  let current = new Date(today);
  let streak = 0;

  while (daySet.has(current.toISOString().slice(0, 10))) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

/**
 * Fetch all badge data for a user
 */
export async function fetchUserBadges(userId: string): Promise<Badge[]> {
  try {
    // 1. Count cocktails logged
    const { count: cocktailCount } = await supabase
      .from('DrinkLog')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 2. Count friends (accepted friendships)
    // Use the same logic as getFriends() function
    const { data: friendships, error: friendError } = await supabase
      .from('Friendship')
      .select('*')
      .eq('status', 'accepted')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (friendError) console.error('Error fetching friendships:', friendError);

    const friendCount = friendships?.length || 0;
    console.log(`Friend count for ${userId}: ${friendCount}`);

    // 3. Count events hosted (organiser_id in Event table)
    const { count: eventsHostedCount } = await supabase
      .from('Event')
      .select('*', { count: 'exact', head: true })
      .eq('organiser_id', userId);

    // 4. Count events attended (EventRegistration table)
    const { count: eventsAttendedCount } = await supabase
      .from('EventRegistration')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // 5. Count recipes created (custom cocktails)
    const { count: recipeCount } = await supabase
      .from('Cocktail')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    // 6. Calculate current streak
    const { data: drinkLogs } = await supabase
      .from('DrinkLog')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(365);

    const drinkDates = (drinkLogs || []).map(log => log.created_at);
    const streakCount = calculateStreak(drinkDates);

    // Build badge array
    const badges: Badge[] = [
      {
        type: 'cocktails',
        tier: getBadgeTier(cocktailCount || 0),
        imageUrl: '',
        count: cocktailCount || 0,
        label: BADGE_LABELS.cocktails,
      },
      {
        type: 'friends',
        tier: getBadgeTier(friendCount),
        imageUrl: '',
        count: friendCount,
        label: BADGE_LABELS.friends,
      },
      {
        type: 'partiesHosted',
        tier: getBadgeTier(eventsHostedCount || 0),
        imageUrl: '',
        count: eventsHostedCount || 0,
        label: BADGE_LABELS.partiesHosted,
      },
      {
        type: 'partiesAttended',
        tier: getBadgeTier(eventsAttendedCount || 0),
        imageUrl: '',
        count: eventsAttendedCount || 0,
        label: BADGE_LABELS.partiesAttended,
      },
      {
        type: 'recipes',
        tier: getBadgeTier(recipeCount || 0),
        imageUrl: '',
        count: recipeCount || 0,
        label: BADGE_LABELS.recipes,
      },
      {
        type: 'streak',
        tier: getBadgeTier(streakCount),
        imageUrl: '',
        count: streakCount,
        label: BADGE_LABELS.streak,
      },
    ];

    // Add image URLs for earned badges
    badges.forEach(badge => {
      if (badge.tier) {
        badge.imageUrl = getBadgeImageUrl(badge.type, badge.tier);
      }
    });

    console.log('All badges before filtering:', badges.map(b => ({ type: b.type, count: b.count, tier: b.tier })));

    // Filter to only return earned badges (tier not null)
    const earnedBadges = badges.filter(badge => badge.tier !== null);
    console.log('Earned badges after filtering:', earnedBadges.map(b => ({ type: b.type, count: b.count, tier: b.tier })));
    
    return earnedBadges;
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

/**
 * Get the highest tier badge earned for display purposes
 */
export function getHighestBadges(badges: Badge[], limit: number = 3): Badge[] {
  const tierPriority = { gold: 3, silver: 2, bronze: 1 };

  return badges
    .sort((a, b) => {
      const aTier = tierPriority[a.tier!] || 0;
      const bTier = tierPriority[b.tier!] || 0;
      if (aTier !== bTier) return bTier - aTier;
      return b.count - a.count;
    })
    .slice(0, limit);
}
