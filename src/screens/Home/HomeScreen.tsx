import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Pressable } from '@/src/components/ui/pressable';
import { FeedPostCard, TextInputField } from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import { getLikesForLogs, toggleLike } from '@/src/api/likes';
import {
  getCommentCountsForLogs,
  getCommentsForLog,
  addComment,
  type CommentRow,
  deleteComment,
} from '@/src/api/comments';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2, ArrowLeft } from 'lucide-react-native';

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
  userName: string;
  userInitials: string;
  timeAgo: string;
  cocktailName: string;
  rating: number;
  imageUrl: string;
  likes: number;
  comments: number;
  caption: string;
  isLiked: boolean;
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

// ---------- carousel (emoji only) ----------

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CarouselItem = {
  id: string;
  name: string;
  emoji: string;
};

const CAROUSEL_ITEM_WIDTH = 160;
const CAROUSEL_SPACING = 16;
const SNAP_INTERVAL = CAROUSEL_ITEM_WIDTH + CAROUSEL_SPACING;

const COCKTAILS: CarouselItem[] = [
  { id: 'mojito', name: 'Mojito', emoji: '🍃' },
  { id: 'margarita', name: 'Margarita', emoji: '🍋' },
  { id: 'mai-tai', name: 'Mai Tai', emoji: '🍹' },
  { id: 'whiskey-sour', name: 'Whiskey Sour', emoji: '🥃' },
];

// ---------- dummy data (when DB is empty / no user) ----------

const DUMMY_POSTS_FRIENDS: FeedPost[] = [
  {
    id: 'dummy-1',
    userName: 'Your Friend',
    userInitials: 'YF',
    timeAgo: '5 min ago',
    cocktailName: 'Margarita',
    rating: 4.5,
    imageUrl: '',
    likes: 3,
    comments: 1,
    caption: 'First drink of the night! 🍸',
    isLiked: false,
  },
];

const DUMMY_POSTS_FOR_YOU: FeedPost[] = [
  {
    id: 'dummy-2',
    userName: 'Community Member',
    userInitials: 'CM',
    timeAgo: '10 min ago',
    cocktailName: 'Negroni',
    rating: 5,
    imageUrl: '',
    likes: 12,
    comments: 4,
    caption: 'Perfect Negroni, perfectly bitter.',
    isLiked: false,
  },
];

// ---------- component ----------

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();

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

  // carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  
  // ref for comments scroll view to scroll to bottom
  const commentsScrollViewRef = useRef<ScrollView>(null);

  const handleCarouselScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    setActiveIndex(index);
  };

  // ---------- load feed + likes + comment counts ----------

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        // no user logged in -> just show dummy data
        if (!user) {
          setFeedPosts(
            feedFilter === 'friends' ? DUMMY_POSTS_FRIENDS : DUMMY_POSTS_FOR_YOU,
          );
          return;
        }

        let rawLogs: any[] = [];

        if (feedFilter === 'friends') {
          // FRIENDS TAB: friends + your own logs
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

          friendIds.add(user.id); // include own logs

          const idsArray = Array.from(friendIds);
          if (idsArray.length === 0) {
            setFeedPosts(DUMMY_POSTS_FRIENDS);
            return;
          }

          const { data, error } = await supabase
            .from('DrinkLog')
            .select(
              `
              id,
              created_at,
              caption,
              rating,
              image_url,
              visibility,
              user_id,
              Cocktail (
                id,
                name,
                image_url
              ),
              Profile (
                id,
                full_name,
                avatar_url
              )
            `,
            )
            .in('user_id', idsArray)
            .in('visibility', ['public', 'friends'])
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;
          rawLogs = (data ?? []) as any[];
        } else {
          // FOR YOU TAB: all public logs
          const { data, error } = await supabase
            .from('DrinkLog')
            .select(
              `
              id,
              created_at,
              caption,
              rating,
              image_url,
              visibility,
              user_id,
              Cocktail (
                id,
                name,
                image_url
              ),
              Profile (
                id,
                full_name,
                avatar_url
              )
            `,
            )
            .eq('visibility', 'public')
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;
          rawLogs = (data ?? []) as any[];
        }

        if (rawLogs.length === 0) {
          setFeedPosts(
            feedFilter === 'friends' ? DUMMY_POSTS_FRIENDS : DUMMY_POSTS_FOR_YOU,
          );
          return;
        }

        // 🔹 add likes + comment counts
        const logIds = rawLogs.map((r) => r.id as string);

        const { counts: likeCounts, likedByMe } = await getLikesForLogs(
          logIds,
          user.id,
        );

        const commentCounts = await getCommentCountsForLogs(logIds);

        const mapped: FeedPost[] = rawLogs.map((raw) => {
          const log = raw as DbDrinkLog;
          const fullName = log.Profile?.full_name ?? 'Unknown user';
          const initials = getInitials(fullName);
          const cocktailName = log.Cocktail?.name ?? 'Unknown cocktail';
          const imageUrl = log.image_url ?? log.Cocktail?.image_url ?? '';

          const likes = likeCounts.get(log.id) ?? 0;
          const comments = commentCounts.get(log.id) ?? 0;
          const isLiked = likedByMe.has(log.id);

          return {
            id: log.id,
            userName: fullName,
            userInitials: initials,
            timeAgo: formatTimeAgo(log.created_at),
            cocktailName,
            rating: log.rating ?? 0,
            imageUrl,
            likes,
            comments,
            caption: log.caption ?? '',
            isLiked,
          };
        });

        setFeedPosts(mapped);
      } catch (err: any) {
        console.error('Error loading feed:', err);
        setError(err.message ?? 'Something went wrong loading the feed.');
        setFeedPosts(
          feedFilter === 'friends' ? DUMMY_POSTS_FRIENDS : DUMMY_POSTS_FOR_YOU,
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [feedFilter, user]);

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
      commentsScrollViewRef.current?.scrollToEnd({ animated: false });
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
      commentsScrollViewRef.current?.scrollToEnd({ animated: false });
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
      <TopBar title="Feed" onNotificationPress={handleNotificationSelect} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.screenVertical,
          paddingBottom: spacing.screenBottom,
        }}
      >
        {/* Popular Right Now – Emoji Carousel */}
        <Box className="mb-6">
          <Text className="text-lg font-medium text-neutral-900 mb-3">
            Drinks for your mood
          </Text>

          <Box className="h-64">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingHorizontal: (SCREEN_WIDTH - CAROUSEL_ITEM_WIDTH) / 2,
                alignItems: 'center',
              }}
              onScroll={handleCarouselScroll}
            >
              {COCKTAILS.map((item, index) => {
                const isCenter = index === activeIndex;
                return (
                  <Box
                    key={item.id}
                    style={{
                      width: CAROUSEL_ITEM_WIDTH,
                      marginRight: CAROUSEL_SPACING,
                    }}
                  >
                    <Box
                      className="items-center justify-center bg-white rounded-3xl"
                      style={{
                        paddingVertical: 32,
                        paddingHorizontal: 12,
                        shadowColor: '#000',
                        shadowOpacity: isCenter ? 0.2 : 0.05,
                        shadowOffset: { width: 0, height: 6 },
                        shadowRadius: 12,
                        elevation: isCenter ? 5 : 1,
                        opacity: isCenter ? 1 : 0.4,
                      }}
                    >
                      <Text className="text-4xl mb-2">{item.emoji}</Text>
                      <Text className="text-base font-semibold text-neutral-900">
                        {item.name}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </ScrollView>

            {/* Dots */}
            <Box className="flex-row justify-center mt-4">
              {COCKTAILS.map((_, index) => (
                <Box
                  key={index}
                  className={`h-2 rounded-full mx-1 ${
                    activeIndex === index ? 'w-6 bg-[#9810fa]' : 'w-2 bg-[#d1d5dc]'
                  }`}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Feed toggle - centered with same style as Social page */}
        <Box className="bg-[#F3F4F6] px-4 py-3 mb-2">
          <View className="bg-[#E5E7EB] flex-row rounded-xl p-1">
            <Pressable
              onPress={() => setFeedFilter('friends')}
              className={feedFilter === 'friends' ? 'flex-1 rounded-xl py-2 bg-[#00BBA7]' : 'flex-1 rounded-xl py-2'}
            >
              <Text className={feedFilter === 'friends' ? 'text-center text-white font-medium' : 'text-center text-neutral-950'}>
                Friends
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFeedFilter('for-you')}
              className={feedFilter === 'for-you' ? 'flex-1 rounded-xl py-2 bg-[#00BBA7]' : 'flex-1 rounded-xl py-2'}
            >
              <Text className={feedFilter === 'for-you' ? 'text-center text-white font-medium' : 'text-center text-neutral-950'}>
                For you
              </Text>
            </Pressable>
          </View>
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

        {/* Feed list */}
        {feedPosts.map((post) => (
          <Box key={post.id} className="mb-4">
            <FeedPostCard
              {...post}
              onToggleLike={() => handleToggleLike(post.id)}
              onPressComments={() => openComments(post.id)}
            />
          </Box>
        ))}
      </ScrollView>

      {/* Full-screen Post + Comments (Instagram-style) */}
      <Modal
        visible={commentsVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeComments}
      >
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <KeyboardAvoidingView
            style={{ flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center', backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Box className="flex-1 bg-white">
              {/* Header with back button */}
              <Box className="flex-row items-center px-4 py-4 border-b border-neutral-200">
                <Pressable onPress={closeComments} className="mr-3">
                  <ArrowLeft size={24} color="#000" />
                </Pressable>
                <Text className="text-base font-semibold text-neutral-900">
                  Post
                </Text>
              </Box>

              {/* Post + comments */}
              <ScrollView
                ref={commentsScrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
              >
              {/* Focused post card */}
              {focusedPost && (
                <Box className="mb-4">
                  <FeedPostCard
                    {...focusedPost}
                    onToggleLike={() => handleToggleLike(focusedPost.id)}
                    // comments button does nothing here (we're already in detail)
                    onPressComments={() => {}}
                  />
                </Box>
              )}

              {/* Comments title */}
              <Text className="text-sm font-semibold text-neutral-900 mb-2">
                Comments
              </Text>

              {/* Comments list */}
              {commentsLoading && (
                <Box className="py-3 items-center">
                  <ActivityIndicator />
                </Box>
              )}

              {!commentsLoading &&
                commentsForPost.map((c) => {
                  const canDelete = c.user_id === user?.id;
                  const userName = c.Profile?.full_name ?? 'Unknown user';
                  const initials = getInitials(userName);
                  return (
                    <Swipeable
                      key={c.id}
                      enabled={canDelete}
                      renderRightActions={() => (
                        <Pressable
                          className="bg-red-500 justify-center items-center w-16 rounded-lg"
                          onPress={() => handleDeleteComment(c.id)}
                        >
                          <Trash2 size={20} color="#fff" />
                        </Pressable>
                      )}
                      onSwipeableOpen={() => {
                        if (canDelete) handleDeleteComment(c.id);
                      }}
                    >
                      <Box className="mb-4 bg-white">
                        <Box className="flex-row items-start">
                          <Box className="w-8 h-8 rounded-full bg-[#009689] items-center justify-center mr-3">
                            <Text className="text-white text-xs font-medium">{initials}</Text>
                          </Box>
                          <Box className="flex-1">
                            <Text className="text-sm font-semibold text-neutral-900 mb-1">
                              {userName}
                            </Text>
                            <Text className="text-sm text-neutral-700">
                              {c.content}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    </Swipeable>
                  );
                })}

              {!commentsLoading && commentsForPost.length === 0 && (
                <Text className="text-sm text-neutral-500">
                  Be the first to comment.
                </Text>
              )}

              {/* Undo bar */}
              {lastDeletedComment && (
                <Box className="flex-row items-center justify-between mt-2 px-3 py-2 rounded-lg bg-neutral-100">
                  <Text className="text-xs text-neutral-700">
                    Comment deleted
                  </Text>
                  <Pressable onPress={handleUndoDeleteComment}>
                    <Text className="text-xs font-semibold text-[#009689]">
                      Undo
                    </Text>
                  </Pressable>
                </Box>
              )}
            </ScrollView>

            {/* Input row at bottom */}
            {user && (
              <Box className="px-4 py-3 border-t border-neutral-200 bg-white">
                <Box className="flex-row items-center gap-2">
                  <Box className="flex-1">
                    <TextInputField
                      value={newComment}
                      onChangeText={setNewComment}
                      placeholder="Add a comment..."
                    />
                  </Box>
                  <Pressable
                    className="px-4 py-2 rounded-full bg-[#009689]"
                    onPress={handleSendComment}
                    disabled={sendingComment || !newComment.trim()}
                  >
                    <Text className="text-white text-sm font-medium">
                      {sendingComment ? '...' : 'Send'}
                    </Text>
                  </Pressable>
                </Box>
              </Box>
            )}
          </Box>
        </KeyboardAvoidingView>
        </View>
      </Modal>
    </Box>
  );
};
