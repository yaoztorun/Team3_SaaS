import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '@/src/theme/spacing';
import { Pressable } from '@/src/components/ui/pressable';
import { FeedPostCard, Heading, TaggedFriendsModal, ToggleSwitch } from '@/src/components/global';
import { CocktailCarousel } from '@/src/components/home/CocktailCarousel';
import { PostDetailScreen } from './PostDetailScreen';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import { getLikesForLogs, toggleLike } from '@/src/api/likes';
import { getTagsForLogs, TaggedUser } from '@/src/api/tags';
import { fetchCocktailById } from '@/src/api/cocktail';
import {
  getCommentCountsForLogs,
  getCommentsForLog,
  addComment,
  type CommentRow,
  deleteComment,
} from '@/src/api/comments';
import { ANALYTICS_EVENTS, posthogCapture } from '@/src/analytics';
import { GlassWater, Sparkles, Search } from 'lucide-react-native';

type FeedFilter = 'friends' | 'for-you';

type DbDrinkLog = {
  id: string;
  created_at: string;
  caption: string | null;
  rating: number | null;
  image_url: string | null;
  visibility: 'public' | 'friends' | 'private';
  user_id: string;
  Cocktail?: {
    id: string;
    name: string | null;
    image_url: string | null;
  } | null;
  Profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type FeedPost = {
  id: string;
  cocktailId: string;
  userName: string;
  userInitials: string;
  userId?: string;
  avatarUrl?: string;
  timeAgo: string;
  cocktailName: string;
  rating: number;
  imageUrl: string;
  likes: number;
  comments: number;
  caption: string;
  isLiked: boolean;
  taggedFriends?: TaggedUser[];
};

// ---------- helpers ----------

const formatTimeAgo = (isoDate: string) => {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ---------- component ----------

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [feedFilter, setFeedFilter] = useState<FeedFilter>('friends');
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // comments + post detail state
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [focusedPost, setFocusedPost] = useState<FeedPost | null>(null);
  const [commentsForPost, setCommentsForPost] = useState<CommentRow[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [lastDeletedComment, setLastDeletedComment] =
    useState<CommentRow | null>(null);
  const [pendingOpenPostId, setPendingOpenPostId] = useState<string | null>(null);
  const [scrollToBottom, setScrollToBottom] = useState(false);

  // tagged friends modal state
  const [tagsModalVisible, setTagsModalVisible] = useState(false);
  const [currentTaggedFriends, setCurrentTaggedFriends] = useState<TaggedUser[]>([]);

  // Recently created recipes tip banner
  const [showRecipeTip, setShowRecipeTip] = useState<{ count: number } | null>(null);
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('recent_recipe_count');
          const n = raw ? parseInt(raw) : 0;
          if (mounted && n > 0) setShowRecipeTip({ count: n });
        } catch { }
      })();
      return () => { mounted = false };
    }, [])
  );
  const dismissTip = async () => {
    setShowRecipeTip(null);
    try { await AsyncStorage.removeItem('recent_recipe_count'); } catch { }
  };

  // Handle carousel card tap to navigate to All Cocktails with search
  const handleCarouselTap = (cocktailId: string, searchQuery: string) => {
    navigation.navigate('Explore' as never, {
      screen: 'AllCocktails',
      params: { initialQuery: searchQuery },
    } as never);
  };

  // Reload feed when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      const loadFeed = async () => {
        try {
          setLoading(true);
          setError(null);

          if (!user) {
            setFeedPosts([]);
            setLoading(false);
            return;
          }

          let rawLogs: any[] = [];
          if (feedFilter === 'friends') {
            const { data: friendships, error: friendsError } = await supabase
              .from('Friendship')
              .select('user_id, friend_id')
              .eq('status', 'accepted')
              .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
            if (friendsError) throw friendsError;
            const friendIds = new Set<string>();
            friendships?.forEach((row) => {
              if (row.user_id === user.id) friendIds.add(row.friend_id);
              else if (row.friend_id === user.id) friendIds.add(row.user_id);
            });
            friendIds.add(user.id);
            const idsArray = Array.from(friendIds);
            if (idsArray.length === 0) {
              setFeedPosts([]);
              setLoading(false);
              return;
            }
            const { data, error } = await supabase
              .from('DrinkLog')
              .select(`
              id,
              created_at,
              caption,
              rating,
              image_url,
              visibility,
              user_id,
              Cocktail ( id, name, image_url ),
              Profile ( id, full_name, avatar_url )
            `)
              .in('user_id', idsArray)
              .in('visibility', ['public', 'friends'])
              .order('created_at', { ascending: false })
              .limit(50);
            if (error) throw error;
            rawLogs = (data ?? []) as any[];
          } else {
            const { data, error } = await supabase
              .from('DrinkLog')
              .select(`
              id,
              created_at,
              caption,
              rating,
              image_url,
              visibility,
              user_id,
              Cocktail ( id, name, image_url ),
              Profile ( id, full_name, avatar_url )
            `)
              .eq('visibility', 'public')
              .order('created_at', { ascending: false })
              .limit(50);
            if (error) throw error;
            rawLogs = (data ?? []) as any[];
          }

          if (rawLogs.length === 0) {
            setFeedPosts([]);
            setLoading(false);
            return;
          }

          const logIds = rawLogs.map((r) => r.id as string);
          const { counts: likeCounts, likedByMe } = await getLikesForLogs(logIds, user.id);
          const commentCounts = await getCommentCountsForLogs(logIds);
          const tagsMap = await getTagsForLogs(logIds);

          const mapped: FeedPost[] = rawLogs.map((raw) => {
            const log = raw as DbDrinkLog;
            const fullName = log.Profile?.full_name ?? 'Unknown user';
            const initials = getInitials(fullName);
            const cocktailName = log.Cocktail?.name ?? 'Unknown cocktail';
            const cocktailId = log.Cocktail?.id ?? '';
            const imageUrl = log.image_url ?? log.Cocktail?.image_url ?? '';
            const likes = likeCounts.get(log.id) ?? 0;
            const comments = commentCounts.get(log.id) ?? 0;
            const isLiked = likedByMe.has(log.id);
            const taggedFriends = tagsMap.get(log.id) ?? [];
            return {
              id: log.id,
              cocktailId,
              userName: fullName,
              userInitials: initials,
              userId: log.Profile?.id ?? log.user_id,
              avatarUrl: log.Profile?.avatar_url ?? undefined,
              timeAgo: formatTimeAgo(log.created_at),
              cocktailName,
              rating: log.rating ?? 0,
              imageUrl,
              likes,
              comments,
              caption: log.caption ?? '',
              isLiked,
              taggedFriends,
            };
          });
          setFeedPosts(mapped);
        } catch (err: any) {
          console.error('Error loading feed:', err);
          setError(err.message ?? 'Something went wrong loading the feed.');
          setFeedPosts([]);
        } finally {
          setLoading(false);
        }
      };
      loadFeed();
    }, [feedFilter, user])
  );

  // Handle deep-link param from navigation to open a specific post
  useEffect(() => {
    const id: string | undefined = route?.params?.openDrinkLogId;
    if (id) {
      setPendingOpenPostId(id);
    }
  }, [route?.params?.openDrinkLogId]);

  // Web: handle URL path /log/{id}
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/^\/log\/(.+)$/);
      if (match && match[1]) {
        setPendingOpenPostId(match[1]);
      }
    }
  }, []);

  // Also react on focus to handle cases where params didn't trigger change
  useFocusEffect(
    React.useCallback(() => {
      const id: string | undefined = route?.params?.openDrinkLogId;
      if (id) {
        setPendingOpenPostId(id);
      }
      return () => { };
    }, [route?.params?.openDrinkLogId])
  );

  // Once feed is loaded and contains the post, open comments and clear pending
  useEffect(() => {
    if (pendingOpenPostId && feedPosts.some(p => p.id === pendingOpenPostId)) {
      openComments(pendingOpenPostId);
      setPendingOpenPostId(null);
      // Clear the route param so subsequent navigations with same id work
      try {
        navigation.setParams({ openDrinkLogId: undefined });
      } catch { }
    }
  }, [pendingOpenPostId, feedPosts]);

  // Keep focused post in sync with feed updates (likes/comments)
  useEffect(() => {
    if (activePostId) {
      const latest = feedPosts.find((p) => p.id === activePostId) ?? null;
      setFocusedPost(latest);
    }
  }, [feedPosts, activePostId]);

  // ---------- like toggle ----------

  const handleToggleLike = async (postId: string) => {
    if (!user?.id) return;

    const existing = feedPosts.find((p) => p.id === postId);
    if (!existing) return;

    const prevLiked = existing.isLiked;

    // optimistic UI
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            isLiked: !p.isLiked,
            likes: p.likes + (p.isLiked ? -1 : 1),
          }
          : p,
      ),
    );

    const result = await toggleLike(postId, user.id, prevLiked);
    if (!result.success) {
      // revert if error
      setFeedPosts((prev) => prev.map((p) => (p.id === postId ? existing : p)));
    } else {
      // Track like/unlike
      posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
        feature: prevLiked ? 'post_unliked' : 'post_liked',
        post_id: postId,
      });
    }
  };

  // ---------- comments + post detail helpers ----------

  const loadComments = async (postId: string) => {
    setCommentsLoading(true);
    const rows = await getCommentsForLog(postId);
    setCommentsForPost(rows);
    setCommentsLoading(false);

    // Scroll to bottom after comments load
    setTimeout(() => {
      setScrollToBottom(prev => !prev);
    }, 100);
  };

  // open full-screen post detail (used by both feed + notifications)
  const openComments = async (postId: string) => {
    if (!user) {
      console.log('User not logged in, cannot comment');
      return;
    }

    const post = feedPosts.find((p) => p.id === postId) ?? null;
    setFocusedPost(post);

    setActivePostId(postId);
    setCommentsVisible(true);
    await loadComments(postId);

    // Scroll to bottom after a short delay to ensure content is rendered
    setTimeout(() => {
      setScrollToBottom(prev => !prev);
    }, 100);
  };

  // called from TopBar when a notification is tapped
  const handleNotificationSelect = (payload: {
    id: string;
    type: string;
    drinkLogId?: string | null;
  }) => {
    if (!payload.drinkLogId) return;
    openComments(payload.drinkLogId);
  };

  const closeComments = () => {
    setCommentsVisible(false);
    setActivePostId(null);
    setFocusedPost(null);
    setCommentsForPost([]);
    setNewComment('');
    setLastDeletedComment(null);
  };

  // ---------- cocktail navigation ----------

  const handlePressCocktail = async (cocktailId: string) => {
    if (!cocktailId) {
      console.log('No cocktail ID provided');
      return;
    }

    // Close comments modal first
    closeComments();
    // Fetch the full cocktail data (RLS ensures we only get public or own cocktails)
    const cocktail = await fetchCocktailById(cocktailId);

    if (!cocktail) {
      console.log('Cocktail not found or not accessible');
      return;
    }

    // Navigate to CocktailDetail in the Explore stack
    navigation.navigate('Explore' as never, {
      screen: 'CocktailDetail',
      params: { cocktail }
    } as never);
  };

  const handlePressUser = (userId: string) => {
    if (!userId || userId === user?.id) return;

    // Close comments modal first
    closeComments();

    // Navigate to user profile
    navigation.navigate('UserProfile', { userId });
  };

  const handleSendComment = async () => {
    if (!user?.id || !activePostId || !newComment.trim() || sendingComment) {
      return;
    }

    const content = newComment.trim();
    setSendingComment(true);
    setNewComment('');

    const res = await addComment(activePostId, user.id, content);

    if (!res.success) {
      console.warn(res.error);
    } else {
      // Track comment added
      posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
        feature: 'comment_added',
        post_id: activePostId,
        comment_length: content.length,
      });

      await loadComments(activePostId);

      // bump comment count in feed
      setFeedPosts((prev) =>
        prev.map((p) =>
          p.id === activePostId ? { ...p, comments: p.comments + 1 } : p,
        ),
      );
    }

    setSendingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?.id || !activePostId) return;

    const comment = commentsForPost.find((c) => c.id === commentId);
    if (!comment) return;

    // optimistic: remove from UI
    setCommentsForPost((prev) => prev.filter((c) => c.id !== commentId));
    setLastDeletedComment(comment);

    // Track comment deleted
    posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
      feature: 'comment_deleted',
      post_id: activePostId,
    });

    // Track comment deleted
    posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
      feature: 'comment_deleted',
      post_id: activePostId,
    });

    const res = await deleteComment(commentId, user.id);
    if (!res.success) {
      console.warn(res.error);
      // revert on failure
      setCommentsForPost((prev) =>
        [...prev, comment].sort((a, b) =>
          a.created_at.localeCompare(b.created_at),
        ),
      );
      setLastDeletedComment(null);
      return;
    }

    // decrement comment count in feed list
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === activePostId
          ? { ...p, comments: Math.max(0, p.comments - 1) }
          : p,
      ),
    );
  };

  const handleUndoDeleteComment = async () => {
    if (!user?.id || !activePostId || !lastDeletedComment) return;

    const comment = lastDeletedComment;
    setLastDeletedComment(null);

    const res = await addComment(activePostId, user.id, comment.content);
    if (!res.success) {
      console.warn(res.error);
      return;
    }

    await loadComments(activePostId);

    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === activePostId ? { ...p, comments: p.comments + 1 } : p,
      ),
    );
  };

  return (
    <Box className="flex-1 bg-neutral-50">
      <TopBar title="Sippin'" onNotificationPress={handleNotificationSelect} showLogo />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.screenVertical,
          paddingBottom: spacing.screenBottom,
        }}
      >
        {/* Recently Created Recipes Tip (clickable) */}
        {showRecipeTip && (
          <Box className="mb-4">
            <Pressable
              onPress={() => {
                // Navigate to Profile main with initial grid tab
                try {
                  (navigation as any).navigate('Profile', {
                    screen: 'ProfileMain',
                    params: { initialGridTab: 'recipes' },
                  });
                  // Clear the counter once user chooses to view
                  dismissTip();
                } catch { }
              }}
              className="bg-white rounded-2xl border px-4 py-3"
              style={{ borderColor: '#d1d5db' }}
            >
              <Box className="flex-row items-center justify-between">
                <Text className="text-sm text-neutral-900">You’ve created {showRecipeTip.count} new recipe{showRecipeTip.count > 1 ? 's' : ''}. Tap to view on your profile.</Text>
                <Pressable onPress={dismissTip} className="ml-3">
                  <Text className="text-neutral-500">✕</Text>
                </Pressable>
              </Box>
            </Pressable>
          </Box>
        )}

        {/* Popular Right Now – Swipeable Cocktail Carousel */}
        <CocktailCarousel onCardTap={handleCarouselTap} />

        {/* Feed toggle */}
        <Box className="mb-4">
          <ToggleSwitch
            value={feedFilter === 'friends' ? 'left' : 'right'}
            onChange={(val: 'left' | 'right') => setFeedFilter(val === 'left' ? 'friends' : 'for-you')}
            leftLabel="Friends"
            rightLabel="Public"
          />
        </Box>

        {/* Loading */}
        {loading && (
          <Box className="items-center justify-center py-6">
            <ActivityIndicator />
          </Box>
        )}

        {/* Error */}
        {error && !loading && (
          <Box className="mb-4">
            <Text className="text-xs text-red-500">{error}</Text>
          </Box>
        )}

        {/* Empty state */}
        {!loading && feedPosts.length === 0 && !error && (
          <Box className="py-12 items-center">
            <Box className="mb-4 bg-teal-50 rounded-full p-4">
              <GlassWater size={48} color="#009689" strokeWidth={1.5} />
            </Box>
            <Heading level="h3" className="mb-2 text-center">
              {!user
                ? 'Welcome to Sippin\''
                : feedFilter === 'friends'
                  ? 'Your friends\' cocktails will appear here'
                  : 'The community feed is empty'}
            </Heading>
            <Text className="text-sm text-neutral-500 text-center px-8 mb-6">
              {!user
                ? 'Sign in to see posts from friends and the community'
                : feedFilter === 'friends'
                  ? 'Discover cool people in the community or find your friends to see what they\'re mixing'
                  : 'Be the first to shake things up and share a cocktail'}
            </Text>
            {user && feedFilter === 'friends' && (
              <Box className="flex-col items-center gap-3 w-full px-8">
                <Pressable
                  className="bg-[#009689] px-6 py-3 rounded-lg w-full flex-row items-center justify-center gap-2"
                  onPress={() => setFeedFilter('for-you')}
                >
                  <Sparkles size={18} color="#fff" />
                  <Text className="text-white font-medium text-center">Explore the community</Text>
                </Pressable>
                <Pressable
                  className="border-2 border-[#009689] px-6 py-3 rounded-lg w-full flex-row items-center justify-center gap-2"
                  onPress={() => navigation.navigate('Social')}
                >
                  <Search size={18} color="#009689" />
                  <Text className="text-[#009689] font-medium text-center">Find your friends</Text>
                </Pressable>
              </Box>
            )}
            {user && feedFilter === 'for-you' && (
              <Pressable
                className="bg-[#009689] px-6 py-3 rounded-full flex-row items-center justify-center gap-2"
                onPress={() => navigation.navigate('Add')}
              >
                <GlassWater size={18} color="#fff" />
                <Text className="text-white font-medium">Mix & share your first cocktail</Text>
              </Pressable>
            )}
          </Box>
        )}

        {feedPosts.map((post) => (
          <Box key={post.id} className="mb-4">
            <FeedPostCard
              {...post}
              onToggleLike={() => handleToggleLike(post.id)}
              onPressComments={() => openComments(post.id)}
              onPressUser={() => {
                if (post.userId) {
                  navigation.navigate('UserProfile', { userId: post.userId });
                }
              }}
              onPressTags={() => {
                if (post.taggedFriends && post.taggedFriends.length > 0) {
                  setCurrentTaggedFriends(post.taggedFriends);
                  setTagsModalVisible(true);
                }
              }}
              onPressCocktail={handlePressCocktail}
            />
          </Box>
        ))}
      </ScrollView>

      {/* Full-screen Post + Comments (Instagram-style) */}
      <PostDetailScreen
        visible={commentsVisible}
        post={focusedPost}
        comments={commentsForPost}
        commentsLoading={commentsLoading}
        newComment={newComment}
        sendingComment={sendingComment}
        lastDeletedComment={lastDeletedComment}
        userId={user?.id}
        scrollToBottom={scrollToBottom}
        onClose={closeComments}
        onToggleLike={() => focusedPost && handleToggleLike(focusedPost.id)}
        onPressUser={handlePressUser}
        onPressTags={() => {
          if (focusedPost?.taggedFriends && focusedPost.taggedFriends.length > 0) {
            setCurrentTaggedFriends(focusedPost.taggedFriends);
            setTagsModalVisible(true);
          }
        }}
        onPressCocktail={handlePressCocktail}
        onChangeComment={setNewComment}
        onSendComment={handleSendComment}
        onDeleteComment={handleDeleteComment}
        onUndoDelete={handleUndoDeleteComment}
      />

      {/* Tagged Friends Modal */}
      <TaggedFriendsModal
        visible={tagsModalVisible}
        onClose={() => setTagsModalVisible(false)}
        taggedFriends={currentTaggedFriends}
        onPressFriend={(friendId) => {
          setTagsModalVisible(false);
          closeComments();
          navigation.navigate('UserProfile', { userId: friendId });
        }}
      />
    </Box>
  );
};
