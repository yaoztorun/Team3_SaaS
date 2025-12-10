import React, { useMemo, useState } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileStack';
import { spacing } from '@/src/theme/spacing';
import { useAuth } from '@/src/hooks/useAuth';
import { useUserStats } from '@/src/hooks/useUserStats';
import { fetchProfile } from '@/src/api/profile';
import type { Profile } from '@/src/types/profile';
import { supabase } from '@/src/lib/supabase';
import { calculateStreakFromDates } from '@/src/utils/streak';
import { fetchCocktailById } from '@/src/api/cocktail';
import { getCommentsForLog, addComment, type CommentRow } from '@/src/api/comments';
import { getLikesForLogs, toggleLike } from '@/src/api/likes';
import { getTagsForLogs } from '@/src/api/tags';
import { ToggleSwitch } from '@/src/components/global';
import { Heart, Wine, BookOpen } from 'lucide-react-native';
import { fetchUserBadges, Badge } from '@/src/api/badges';
import { BadgeModal } from '@/src/components/global/BadgeModal';
import { GridGallery, type RecentDrink } from './components/GridGallery';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileStats } from './components/ProfileStats';
import { PostModal } from './components/PostModal';

type View = 'logged-drinks' | 'stats';

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
  const [gridTab, setGridTab] = useState<'posts' | 'recipes' | 'likes'>('posts');
  // removed red-dot indicator state

  // stats state - using centralized hook
  const { userStats, loadingStats, avgRatingOutOf5, ratingTrendCounts5, refreshStats } = useUserStats(user?.id);

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

  const loadProfile = async () => {
    if (user?.id) {
      setLoadingProfile(true);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setLoadingProfile(false);
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
    const streak = calculateStreakFromDates(dates);
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

      // All user posts (public + friends + private) - chronologically ordered
      const allPosts = mapped.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // newest first
      });
      setPublicLogs(allPosts);
      setPrivateLogs([]);

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
          .in('visibility', ['public', 'friends'])
          .neq('user_id', user.id);
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
      if (gridTab === 'posts') setRecentDrinks(allPosts);
      if (gridTab === 'recipes') setRecentDrinks(mappedRecipes);
      if (gridTab === 'likes') setRecentDrinks(liked);
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
      refreshStats();
      loadBadges();
      loadTopBarStats();
      // If navigated with intent to show private/recipes, switch tab and clear recent badge
      try {
        const desiredTab = route?.params?.initialGridTab as ('posts' | 'recipes' | 'likes') | undefined;
        if (desiredTab) setGridTab(desiredTab);
      } catch { }
    }, [user?.id, isOwnRecipes])
  );

  // Recompute grid when tab changes or datasets refresh
  React.useEffect(() => {
    if (gridTab === 'posts') {
      // All user posts already sorted chronologically
      setRecentDrinks(publicLogs);
    }
    else if (gridTab === 'recipes') {
      // All user recipes (published or not)
      setRecentDrinks(createdRecipes);
    }
    else if (gridTab === 'likes') {
      // Liked posts from other people only
      setRecentDrinks(likedItems);
    }
  }, [gridTab, publicLogs, createdRecipes, likedItems]);

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
        <ProfileHeader
          profile={profile}
          loadingProfile={loadingProfile}
          userEmail={user?.email}
          badges={badges}
          loadingBadges={loadingBadges}
          onBadgePress={(badge) => setSelectedBadge(badge)}
          onEditProfile={() => navigation.navigate('EditProfile')}
        />

        {/* View Toggle */}
        <Box className="mb-4">
          <ToggleSwitch
            value={currentView === 'logged-drinks' ? 'left' : 'right'}
            onChange={(val: 'left' | 'right') => setCurrentView(val === 'left' ? 'logged-drinks' : 'stats')}
            leftLabel="Drinks"
            rightLabel="Stats"
          />
        </Box>

        {currentView === 'logged-drinks' ? (
          <>
            {/* Grid tabs: Posts / Recipes / Likes */}
            <HStack className="items-center justify-center mb-4 gap-10">
              <Pressable
                onPress={() => setGridTab('posts')}
                className="items-center"
              >
                <Wine
                  size={26}
                  color={gridTab === 'posts' ? '#009689' : '#9ca3af'}
                />
                <Text
                  className={`text-xs mt-1.5 ${gridTab === 'posts' ? 'text-[#009689] font-semibold' : 'text-neutral-400'
                    }`}
                >
                  Posts
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setGridTab('recipes')}
                className="items-center"
              >
                <BookOpen
                  size={26}
                  color={gridTab === 'recipes' ? '#009689' : '#9ca3af'}
                />
                <Text
                  className={`text-xs mt-1.5 ${gridTab === 'recipes' ? 'text-[#009689] font-semibold' : 'text-neutral-400'
                    }`}
                >
                  Recipes
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setGridTab('likes')}
                className="items-center"
              >
                <Heart
                  size={26}
                  color={gridTab === 'likes' ? '#009689' : '#9ca3af'}
                />
                <Text
                  className={`text-xs mt-1.5 ${gridTab === 'likes' ? 'text-[#009689] font-semibold' : 'text-neutral-400'
                    }`}
                >
                  Likes
                </Text>
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
                  {gridTab === 'posts' && "You haven't logged any drinks yet."}
                  {gridTab === 'recipes' && "You haven't created any recipes yet."}
                  {gridTab === 'likes' && "You haven't liked any posts yet."}
                </Text>
              </Box>
            )}

            {/* Recent Drinks Grid */}
            {!loadingDrinks && !drinksError && recentDrinks.length > 0 && (
              <GridGallery
                items={recentDrinks}
                onPress={async (item) => {
                  if (gridTab === 'recipes') {
                    // Navigate to recipe detail
                    const cocktail = await fetchCocktailById(item.id);
                    if (cocktail) (navigation.getParent() as any)?.navigate('Explore', { screen: 'CocktailDetail', params: { cocktail, returnTo: 'Profile' } });
                  } else if (item.type === 'log') {
                    // Log post: open post detail modal
                    await openPostModal(item);
                  }
                }}
              />
            )}
          </>
        ) : (
          <>
            {/* Stats View */}
            <ProfileStats
              userStats={userStats}
              avgRatingOutOf5={avgRatingOutOf5}
              ratingTrendCounts5={ratingTrendCounts5}
              loading={loadingStats}
            />
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
      <PostModal
        visible={showPostModal}
        focusedPost={focusedPost}
        commentsLoading={commentsLoading}
        commentsForPost={commentsForPost}
        newComment={newComment}
        sendingComment={sendingComment}
        onClose={closePostModal}
        onToggleLike={() => handleToggleLike(focusedPost?.id || '')}
        onPressCocktail={() => handlePressCocktail(focusedPost?.cocktailId || '')}
        onCommentChange={setNewComment}
        onSendComment={handleSendComment}
        formatTimeAgo={formatTimeAgo}
      />
    </Box>
  );
};
