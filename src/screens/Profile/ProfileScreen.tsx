import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileStack';
import { spacing } from '@/src/theme/spacing';
import { useAuth } from '@/src/hooks/useAuth';
import { fetchProfile } from '@/src/api/profile';
import type { Profile } from '@/src/types/profile';
import { supabase } from '@/src/lib/supabase';
import { fetchUserStats, UserStats } from '@/src/api/stats';
import { fetchCocktailById } from '@/src/api/cocktail';
import { getCommentsForLog, addComment, type CommentRow } from '@/src/api/comments';
import { getLikesForLogs, toggleLike } from '@/src/api/likes';
import { getTagsForLogs, TaggedUser } from '@/src/api/tags';
import { Heading, FeedPostCard, TextInputField, ToggleSwitch } from '@/src/components/global';
import { Heart, Lock, LayoutGrid, ArrowLeft, Trash2 } from 'lucide-react-native';
import { fetchUserBadges, Badge } from '@/src/api/badges';
import { BadgeModal } from '@/src/components/global/BadgeModal';

type View = 'logged-drinks' | 'stats';

// ---- types for recent drinks ----
type DbDrinkLog = {
  id: string;
  created_at: string;
  caption: string | null;
  rating: number | null;
  visibility: 'public' | 'friends' | 'private';
  user_id: string;
  Cocktail?: {
    id: string;
    name: string | null;
    image_url?: string | null;
    creator_id?: string | null;
  } | null;
  image_url?: string | null;
};

type RecentDrink = {
  id: string;
  name: string;
  subtitle: string; // caption / location
  rating: number;
  time: string;
  createdAt: string; // ISO timestamp for sorting
  creatorId: string | null;
  imageUrl: string;
  type: 'log' | 'recipe';
  visibility?: 'public' | 'friends' | 'private';
  cocktailId?: string | null;
};

// ---- helper ----
const formatTimeAgo = (isoDate: string) => {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
};

export const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const route = useRoute<any>();
  const [currentView, setCurrentView] = useState<View>('logged-drinks');
  const [isOwnRecipes, setIsOwnRecipes] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // recent drinks state
  const [recentDrinks, setRecentDrinks] = useState<RecentDrink[]>([]);
  const [createdRecipes, setCreatedRecipes] = useState<RecentDrink[]>([]);
  const [publicLogs, setPublicLogs] = useState<RecentDrink[]>([]);
  const [privateLogs, setPrivateLogs] = useState<RecentDrink[]>([]);
  const [likedItems, setLikedItems] = useState<RecentDrink[]>([]);
  const [loadingDrinks, setLoadingDrinks] = useState(false);
  const [drinksError, setDrinksError] = useState<string | null>(null);
  const [gridTab, setGridTab] = useState<'feed' | 'private' | 'liked'>('feed');
  // removed red-dot indicator state

  // stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // badges state
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  // post detail modal state
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [focusedPost, setFocusedPost] = useState<any>(null);
  const [commentsForPost, setCommentsForPost] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // topbar stats (streak + total drinks)
  const [streakCount, setStreakCount] = useState(0);
  const [totalDrinks, setTotalDrinks] = useState(0);

  // Derived stats display (out of 5)
  const avgRatingOutOf5 = useMemo(() => {
    const raw = userStats?.avgRating ?? 0;
    return Math.round(raw / 2);
  }, [userStats?.avgRating]);

  const ratingTrendCounts5 = useMemo(() => {
    const arr = userStats?.ratingTrend?.map((it: any) => it.count) ?? [];
    const c = (i: number) => (arr[i] ?? 0);
    // Collapse 0..10 into 0..5 buckets
    return [
      c(0) + c(1),
      c(2) + c(3),
      c(4) + c(5),
      c(6) + c(7),
      c(8) + c(9),
      c(10),
    ];
  }, [userStats?.ratingTrend]);

  const computeStreakFromDates = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const daySet = new Set<string>(
      dates.map((iso) => new Date(iso).toISOString().slice(0, 10)),
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
  };

  const loadProfile = async () => {
    if (user?.id) {
      setLoadingProfile(true);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setLoadingProfile(false);
    }
  };

  const loadStats = async () => {
    if (user?.id) {
      setLoadingStats(true);
      const stats = await fetchUserStats(user.id);
      setUserStats(stats);
      setLoadingStats(false);
    }
  };

  const loadBadges = async () => {
    if (user?.id) {
      setLoadingBadges(true);
      const userBadges = await fetchUserBadges(user.id);
      setBadges(userBadges);
      setLoadingBadges(false);
    }
  };

  const loadTopBarStats = async () => {
    if (!user?.id) {
      setStreakCount(0);
      setTotalDrinks(0);
      return;
    }

    const { data, error, count } = await supabase
      .from('DrinkLog')
      .select('created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(365);

    if (error) {
      console.error('Error loading topbar stats:', error);
      setStreakCount(0);
      setTotalDrinks(0);
      return;
    }

    const dates = (data ?? []).map((row: any) => row.created_at as string);
    const streak = computeStreakFromDates(dates);
    setStreakCount(streak);
    setTotalDrinks(count ?? 0);
  };

  const loadRecentDrinks = async () => {
    if (!user?.id) return;

    try {
      setLoadingDrinks(true);
      setDrinksError(null);

      let query = supabase
        .from('DrinkLog')
        .select(
          `
          id,
          created_at,
          caption,
          rating,
          visibility,
          user_id,
          image_url,
          Cocktail (
            id,
            name,
            creator_id,
            image_url
          )
        `
        )
        .eq('user_id', user.id) // ✅ all your logs, including private
        .order('created_at', { ascending: false })
        .limit(20);

      const { data, error } = await query;

      if (error) throw error;

      let mapped: RecentDrink[] = (data ?? []).map((raw: any) => {
        // Supabase returns Cocktail as a single object when using foreign key relation
        const cocktailName = raw.Cocktail?.name ?? 'Unknown cocktail';
        const preview = raw.image_url || raw.Cocktail?.image_url || '';

        return {
          id: raw.id,
          name: cocktailName,
          subtitle: raw.caption ?? '',
          rating: raw.rating ?? 0,
          time: formatTimeAgo(raw.created_at),
          createdAt: raw.created_at,
          creatorId: raw.Cocktail?.creator_id ?? null,
          imageUrl: preview,
          type: 'log',
          visibility: raw.visibility as any,
          cocktailId: raw.Cocktail?.id ?? null,
        };
      });

      // Split into public/friends vs private logs
      const pub = mapped.filter(m => m.visibility !== 'private');
      const priv = mapped.filter(m => m.visibility === 'private');
      setPublicLogs(pub);
      setPrivateLogs(priv);

      // Also fetch user-created recipes (even if not logged)
      const { data: myCocktails, error: myCocktailsError } = await supabase
        .from('Cocktail')
        .select('id, name, creator_id, image_url, created_at')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (myCocktailsError) {
        console.warn('Error loading created recipes:', myCocktailsError.message);
      }
      const mappedRecipes: RecentDrink[] = (myCocktails ?? []).map((c: any) => ({
        id: c.id,
        name: c.name ?? 'Unnamed',
        subtitle: '',
        rating: 0,
        time: c.created_at ? formatTimeAgo(c.created_at) : '',
        createdAt: c.created_at ?? new Date().toISOString(),
        creatorId: c.creator_id ?? user.id,
        imageUrl: c.image_url ?? '',
        type: 'recipe',
      }));

      setCreatedRecipes(mappedRecipes);

      // Liked posts (public/friends) by me
      const { data: likedRows, error: likedErr } = await supabase
        .from('DrinkLogLike')
        .select('drink_log_id')
        .eq('user_id', user.id)
        .limit(100);
      if (likedErr) {
        console.warn('Error loading liked rows:', likedErr.message);
      }
      const likedIds = (likedRows ?? []).map((r: any) => r.drink_log_id);
      let liked: RecentDrink[] = [];
      if (likedIds.length > 0) {
        const { data: likedLogs, error: likedLogsErr } = await supabase
          .from('DrinkLog')
          .select(`id, created_at, caption, rating, visibility, user_id, image_url,
                   Cocktail ( id, name, image_url, creator_id )`)
          .in('id', likedIds)
          .in('visibility', ['public', 'friends']);
        if (!likedLogsErr) {
          liked = (likedLogs ?? []).map((raw: any) => ({
            id: raw.id,
            name: raw.Cocktail?.name ?? 'Unknown',
            subtitle: raw.caption ?? '',
            rating: raw.rating ?? 0,
            time: formatTimeAgo(raw.created_at),
            createdAt: raw.created_at,
            creatorId: raw.Cocktail?.creator_id ?? null,
            imageUrl: raw.image_url || raw.Cocktail?.image_url || '',
            type: 'log',
            visibility: raw.visibility as any,
            cocktailId: raw.Cocktail?.id ?? null,
          }));
        }
      }
      setLikedItems(liked);

      // Initialize grid with current tab
      if (gridTab === 'feed') setRecentDrinks(pub);
      if (gridTab === 'private') setRecentDrinks([...priv, ...mappedRecipes]);
      if (gridTab === 'liked') setRecentDrinks(liked);
    } catch (err: any) {
      console.error('Error loading recent drinks:', err);
      setDrinksError(
        err.message ?? 'Something went wrong loading your drinks.',
      );
      setRecentDrinks([]);
    } finally {
      setLoadingDrinks(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      loadRecentDrinks();
      loadStats();
      loadBadges();
      loadTopBarStats();
      // If navigated with intent to show private/recipes, switch tab and clear recent badge
      try {
        const desiredTab = route?.params?.initialGridTab as ('feed' | 'private' | 'liked') | undefined;
        if (desiredTab) setGridTab(desiredTab);
      } catch { }
    }, [user?.id, isOwnRecipes])
  );

  // Recompute grid when tab changes or datasets refresh
  React.useEffect(() => {
    if (gridTab === 'feed') setRecentDrinks(publicLogs);
    else if (gridTab === 'private') {
      // Merge and sort private logs with created recipes chronologically by actual timestamp
      const combined = [...privateLogs, ...createdRecipes];
      combined.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // newest first
      });
      setRecentDrinks(combined);
    }
    else if (gridTab === 'liked') setRecentDrinks(likedItems);
  }, [gridTab, publicLogs, privateLogs, createdRecipes, likedItems]);

  // ---------- Post modal helpers ----------

  const loadComments = async (postId: string) => {
    setCommentsLoading(true);
    const rows = await getCommentsForLog(postId);
    setCommentsForPost(rows);
    setCommentsLoading(false);
  };

  const openPostModal = async (drink: RecentDrink) => {
    if (!user) return;

    setSelectedPostId(drink.id);
    setShowPostModal(true);

    // Load full post data
    try {
      const { data: log, error } = await supabase
        .from('DrinkLog')
        .select(`
          id,
          created_at,
          caption,
          rating,
          image_url,
          user_id,
          Cocktail:cocktail_id (
            id,
            name,
            image_url
          ),
          Profile:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', drink.id)
        .single();

      if (error || !log) {
        console.error('Error loading post:', error);
        return;
      }

      // Get likes, comments, tags
      const likesMap = await getLikesForLogs([drink.id], user.id);
      const tagsMap = await getTagsForLogs([drink.id]);
      const likes = {
        count: likesMap.counts.get(drink.id) || 0,
        isLiked: likesMap.likedByMe.has(drink.id)
      };
      const taggedFriends = tagsMap.get(drink.id) || [];

      // Get comment count
      const { count: commentCount } = await supabase
        .from('Comment')
        .select('*', { count: 'exact', head: true })
        .eq('drink_log_id', drink.id);

      const cocktailData = log.Cocktail as any;
      const profileData = log.Profile as any;

      const imageUrl = log.image_url || cocktailData?.image_url || '';
      const userName = profileData?.full_name || 'Unknown User';
      const userInitials = userName
        .split(/\s+/)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();

      const focusedPostData = {
        id: log.id,
        cocktailId: cocktailData?.id || '',
        userName,
        userInitials,
        userId: log.user_id,
        avatarUrl: profileData?.avatar_url || null,
        timeAgo: formatTimeAgo(log.created_at),
        cocktailName: cocktailData?.name || 'Unknown Cocktail',
        rating: log.rating ?? 0,
        imageUrl,
        likes: likes.count,
        comments: commentCount || 0,
        caption: log.caption ?? '',
        isLiked: likes.isLiked,
        taggedFriends,
      };

      setFocusedPost(focusedPostData);
      await loadComments(drink.id);
    } catch (err) {
      console.error('Error loading post details:', err);
    }
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPostId(null);
    setFocusedPost(null);
    setCommentsForPost([]);
    setNewComment('');
  };

  const handleSendComment = async () => {
    if (!user?.id || !selectedPostId || !newComment.trim() || sendingComment) {
      return;
    }

    const content = newComment.trim();
    setSendingComment(true);
    setNewComment('');

    const res = await addComment(selectedPostId, user.id, content);

    if (!res.success) {
      console.warn(res.error);
    } else {
      await loadComments(selectedPostId);

      // Update comment count in focused post
      if (focusedPost) {
        setFocusedPost({
          ...focusedPost,
          comments: focusedPost.comments + 1,
        });
      }
    }

    setSendingComment(false);
  };

  const handleToggleLike = async (postId: string) => {
    if (!user?.id || !focusedPost) return;

    const prevLiked = focusedPost.isLiked;

    // Optimistic UI update
    setFocusedPost({
      ...focusedPost,
      isLiked: !focusedPost.isLiked,
      likes: focusedPost.likes + (focusedPost.isLiked ? -1 : 1),
    });

    const result = await toggleLike(postId, user.id, prevLiked);
    if (!result.success) {
      // Revert on error
      setFocusedPost({
        ...focusedPost,
        isLiked: prevLiked,
        likes: focusedPost.likes + (prevLiked ? 1 : -1),
      });
    }
  };

  const handlePressCocktail = async (cocktailId: string) => {
    if (!cocktailId) return;

    const cocktail = await fetchCocktailById(cocktailId);

    if (!cocktail) {
      console.log('Cocktail not found or not accessible');
      return;
    }

    // Close modal first
    closePostModal();

    // Navigate to CocktailDetail in the Explore stack
    const rootNav = navigation.getParent() as any;
    if (rootNav) {
      rootNav.navigate('Explore', {
        screen: 'CocktailDetail',
        params: { cocktail }
      });
    }
  };


  return (
    <Box className="flex-1 bg-neutral-50">
      <TopBar
        title="Profile"
        streakCount={streakCount}
        cocktailCount={totalDrinks}
        showSettingsIcon
        onSettingsPress={() => navigation.navigate('Settings')}
        showLogo
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.screenVertical,
          paddingBottom: spacing.screenBottom,
        }}
      >
        {/* User Profile Card */}
        <Box className="mb-4 p-6 bg-white rounded-2xl">
          <HStack className="mb-4">
            {profile?.avatar_url ? (
              <Box className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{ width: 80, height: 80 }}
                  resizeMode="cover"
                />
              </Box>
            ) : (
              <Center className="h-20 w-20 rounded-full bg-teal-500">
                <Text className="text-2xl text-white">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    '?'}
                </Text>
              </Center>
            )}
            <Box className="ml-4 flex-1">
              <Heading level="h4">
                {loadingProfile
                  ? 'Loading...'
                  : profile?.full_name ||
                  user?.email?.split('@')[0] ||
                  'User'}
              </Heading>
              {/* Badges */}
              <Box className="mt-2">
                {loadingBadges ? (
                  <Text className="text-xs text-neutral-500">Loading badges...</Text>
                ) : badges.length > 0 ? (
                  <HStack className="flex-wrap gap-2">
                    {badges.slice(0, 6).map((badge) => (
                      <Pressable
                        key={badge.type}
                        onPress={() => setSelectedBadge(badge)}
                        className="items-center"
                        style={{ width: 42 }}
                      >
                        <Image
                          source={{ uri: badge.imageUrl }}
                          style={{ width: 40, height: 40 }}
                          resizeMode="contain"
                        />
                      </Pressable>
                    ))}
                  </HStack>
                ) : (
                  <Text className="text-xs text-neutral-500">No badges earned yet</Text>
                )}
              </Box>
            </Box>
          </HStack>
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            className="flex-row justify-center items-center py-2 rounded-lg bg-teal-500"
          >
            <Text className="text-sm text-white font-medium">Edit Profile</Text>
          </Pressable>
        </Box>

        {/* View Toggle */}
        <Box className="mb-4 bg-white rounded-2xl p-1">
          <ToggleSwitch
            value={currentView === 'logged-drinks' ? 'left' : 'right'}
            onChange={(val: 'left' | 'right') => setCurrentView(val === 'left' ? 'logged-drinks' : 'stats')}
            leftLabel="Drinks"
            rightLabel="Stats"
          />
        </Box>

        {currentView === 'logged-drinks' ? (
          <>
            {/* Logged Drinks Header */}
            {/* Grid tabs: Feed / Private+Recipes / Liked */}
            <HStack className="items-center justify-center mb-3">
              <Pressable onPress={() => setGridTab('feed')} className="mx-4">
                <LayoutGrid size={22} color={gridTab === 'feed' ? '#009689' : '#9ca3af'} />
              </Pressable>
              <Pressable onPress={() => setGridTab('private')} className="mx-4">
                <Lock size={22} color={gridTab === 'private' ? '#009689' : '#9ca3af'} />
              </Pressable>
              <Pressable onPress={() => setGridTab('liked')} className="mx-4">
                <Heart size={22} color={gridTab === 'liked' ? '#009689' : '#9ca3af'} />
              </Pressable>
            </HStack>

            {/* Loading / error */}
            {loadingDrinks && (
              <Box className="items-center justify-center py-4">
                <ActivityIndicator size="large" color="#00BBA7" />
              </Box>
            )}

            {drinksError && !loadingDrinks && (
              <Box className="mb-3">
                <Text className="text-xs text-red-500">{drinksError}</Text>
              </Box>
            )}

            {!loadingDrinks && !drinksError && recentDrinks.length === 0 && (
              <Box className="py-4">
                <Text className="text-sm text-neutral-500">
                  You haven&apos;t logged any drinks yet.
                </Text>
              </Box>
            )}

            {/* Recent Drinks Grid */}
            {!loadingDrinks && !drinksError && recentDrinks.length > 0 && (
              <GridGallery
                items={recentDrinks}
                onPress={async (item) => {
                  if (gridTab === 'private') {
                    if (item.type === 'recipe') {
                      const cocktail = await fetchCocktailById(item.id);
                      if (cocktail) (navigation.getParent() as any)?.navigate('Explore', { screen: 'CocktailDetail', params: { cocktail, returnTo: 'Profile' } });
                    } else {
                      // private log: open its cocktail detail
                      const cocktailId = item.cocktailId || item.id;
                      const cocktail = await fetchCocktailById(cocktailId);
                      if (cocktail) (navigation.getParent() as any)?.navigate('Explore', { screen: 'CocktailDetail', params: { cocktail, returnTo: 'Profile' } });
                    }
                  } else {
                    // feed or liked -> open post detail modal
                    await openPostModal(item);
                  }
                }}
              />
            )}
          </>
        ) : (
          <>
            {/* Stats View */}
            <Box className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base text-neutral-900 mb-4">
                Your Stats
              </Text>
              <HStack className="justify-between">
                <Box className="items-center">
                  <Text className="text-3xl text-teal-500 font-semibold">
                    {userStats?.drinksLogged || 0}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    Drinks Logged
                  </Text>
                </Box>
                <Box className="items-center">
                  <Text className="text-3xl text-red-500 font-semibold">
                    {avgRatingOutOf5}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    Avg Rating
                  </Text>
                </Box>
                <Box className="items-center">
                  <Text className="text-3xl text-blue-500 font-semibold">
                    {userStats?.barsVisited || 0}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    Bars Visited
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Top Cocktails */}
            {userStats?.topCocktails && userStats.topCocktails.length > 0 && (
              <Box className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-base text-neutral-900 mb-3">
                  Top 3 Most Popular
                </Text>
                {userStats.topCocktails.map((cocktail, index) => (
                  <Box
                    key={index}
                    className="flex-row items-center justify-between py-3 border-b border-neutral-100 last:border-b-0"
                  >
                    <HStack className="items-center flex-1">
                      <Box className="w-8 h-8 rounded-full bg-teal-500 items-center justify-center mr-3">
                        <Text className="text-white font-semibold">
                          {index + 1}
                        </Text>
                      </Box>
                      <Text className="text-sm text-neutral-900 flex-1" numberOfLines={1}>
                        {cocktail.name}
                      </Text>
                    </HStack>
                    <Box className="bg-teal-50 px-3 py-1 rounded-full ml-2">
                      <Text className="text-sm text-teal-600 font-medium">
                        {cocktail.count}x
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Rating Trend */}
            <Box className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-base text-neutral-900 mb-4">
                Rating Trend
              </Text>
              {userStats?.ratingTrend && userStats.ratingTrend.some(item => item.count > 0) ? (
                <Box className="items-center justify-center -ml-8">
                  <LineChart
                    data={{
                      labels: ['0', '1', '2', '3', '4', '5'],
                      datasets: [{
                        data: ratingTrendCounts5,
                      }],
                    }}
                    width={360}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                      propsForDots: {
                        r: '3',
                        strokeWidth: '2',
                        stroke: '#60A5FA',
                      },
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                      marginLeft: -40,
                    }}
                    withDots={true}
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={false}
                    withShadow={false}
                    segments={4}
                  />
                </Box>
              ) : (
                <Box className="h-48 items-center justify-center">
                  <Text className="text-gray-400">No rating data yet</Text>
                </Box>
              )}
            </Box>

            {/* Cocktail Breakdown */}
            <Box className="bg-white rounded-2xl p-4">
              <Heading level="h3" className="mb-4">
                Cocktail Breakdown
              </Heading>
              {userStats?.cocktailBreakdown && userStats.cocktailBreakdown.length > 0 ? (
                <>
                  <Box className="items-center justify-center mb-4">
                    <PieChart
                      data={userStats.cocktailBreakdown.map(item => ({
                        name: item.name,
                        population: item.count,
                        color: item.color,
                        legendFontColor: '#374151',
                        legendFontSize: 12,
                      }))}
                      width={260}
                      height={200}
                      chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="60"
                      hasLegend={false}
                    />
                  </Box>
                  <Box className="flex-row flex-wrap">
                    {userStats.cocktailBreakdown.map((item, index) => (
                      <Box
                        key={index}
                        className="w-1/2 flex-row items-center mb-2 pr-2"
                      >
                        <Box
                          style={{ backgroundColor: item.color }}
                          className="h-4 w-4 rounded-full mr-2"
                        />
                        <Text className="text-sm text-neutral-900" numberOfLines={1}>
                          {item.name} ({item.count})
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Box className="h-48 items-center justify-center">
                  <Text className="text-gray-400">No cocktail data yet</Text>
                </Box>
              )}
            </Box>
          </>
        )}
      </ScrollView>

      {/* Badge Modal */}
      <BadgeModal
        visible={selectedBadge !== null}
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />

      {/* Post Detail Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={false}
        onRequestClose={closePostModal}
      >
        <Box style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <KeyboardAvoidingView
            style={{ flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center', backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Box className="flex-1 bg-white">
              {/* Header */}
              <Box className="flex-row items-center px-4 py-4 border-b border-neutral-200">
                <Pressable onPress={closePostModal} className="mr-3">
                  <ArrowLeft size={24} color="#000" />
                </Pressable>
                <Text className="text-base font-semibold text-neutral-900">
                  Post
                </Text>
              </Box>

              {/* Content */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
              >
                {focusedPost && (
                  <Box className="mb-4">
                    <FeedPostCard
                      {...focusedPost}
                      onToggleLike={() => handleToggleLike(focusedPost.id)}
                      onPressComments={() => { }}
                      onPressCocktail={() => handlePressCocktail(focusedPost.cocktailId)}
                      onPressUser={() => { }}
                    />
                  </Box>
                )}

                {/* Comments Section */}
                <Text className="text-sm font-semibold text-neutral-900 mb-2">
                  Comments
                </Text>

                {commentsLoading ? (
                  <Box className="py-3 items-center">
                    <ActivityIndicator size="small" color="#00BBA7" />
                  </Box>
                ) : commentsForPost.length === 0 ? (
                  <Text className="text-sm text-gray-400">No comments yet</Text>
                ) : (
                  commentsForPost.map((comment: CommentRow) => {
                    const userName = comment.Profile?.full_name || 'User';
                    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const avatarUrl = comment.Profile?.avatar_url ?? null;
                    return (
                      <Box key={comment.id} className="mb-4 bg-white">
                        <Box className="flex-row items-start">
                          {avatarUrl ? (
                            <Box className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-3">
                              <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: 32, height: 32 }}
                                resizeMode="cover"
                              />
                            </Box>
                          ) : (
                            <Box className="w-8 h-8 rounded-full bg-[#009689] items-center justify-center mr-3">
                              <Text className="text-white text-xs font-medium">{initials}</Text>
                            </Box>
                          )}
                          <Box className="flex-1">
                            <Text className="text-sm font-semibold text-neutral-900">
                              {userName}
                            </Text>
                            <Text className="text-sm text-neutral-700 mt-1">
                              {comment.content}
                            </Text>
                            <Text className="text-xs text-neutral-400 mt-1">
                              {formatTimeAgo(comment.created_at)}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </ScrollView>

              {/* Comment Input */}
              <Box className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-neutral-200">
                <Box className="flex-row items-center">
                  <Box className="flex-1 mr-2">
                    <TextInputField
                      value={newComment}
                      onChangeText={setNewComment}
                      placeholder="Add a comment..."
                      multiline={false}
                    />
                  </Box>
                  <Pressable
                    onPress={handleSendComment}
                    disabled={!newComment.trim() || sendingComment}
                  >
                    <Text className={newComment.trim() ? 'text-sm font-semibold text-teal-500' : 'text-sm font-semibold text-neutral-300'}>
                      {sendingComment ? 'Sending...' : 'Post'}
                    </Text>
                  </Pressable>
                </Box>
              </Box>
            </Box>
          </KeyboardAvoidingView>
        </Box>
      </Modal>
    </Box>
  );
};

// Simple Instagram-like grid gallery for recent drinks
const GridGallery = ({ items, onPress }: { items: RecentDrink[]; onPress: (item: RecentDrink) => void }) => {
  const gap = 12; // spacing between cards

  // Helper to format date like "Nov 28"
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Helper to truncate title to fit on one line with ellipsis
  const truncateTitle = (title: string, maxLength: number = 16): string => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  return (
    <Box>
      <Box className="flex-row flex-wrap" style={{ marginRight: -gap }}>
        {items.map((it, idx) => (
          <Pressable
            key={`${it.id}-${idx}`}
            onPress={() => onPress(it)}
            style={{ width: '33.333%', paddingRight: gap, paddingBottom: gap }}
          >
            {/* White card container with border */}
            <Box
              className="bg-white rounded-xl overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              {/* Image container with rounded corners */}
              <Box style={{ padding: 8 }}>
                {it.imageUrl ? (
                  <Image
                    source={{ uri: it.imageUrl }}
                    style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Center style={{ width: '100%', aspectRatio: 1, backgroundColor: '#e5e7eb', borderRadius: 8 }}>
                    <Text className="text-xs text-neutral-700" numberOfLines={1}>{it.name}</Text>
                  </Center>
                )}
              </Box>

              {/* Gray divider line */}
              <Box style={{ height: 1, backgroundColor: '#e5e7eb' }} />

              {/* Text content area with fixed height for consistency */}
              <Box style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 10, height: 48 }}>
                <Text
                  className="text-xs font-medium text-neutral-900"
                >
                  {truncateTitle(it.name)}
                </Text>
                <Text className="text-[10px] text-neutral-400" style={{ marginTop: 3 }}>
                  {formatDate(it.createdAt)}
                </Text>
              </Box>
            </Box>
          </Pressable>
        ))}
      </Box>
    </Box>
  );
};
