import React, { useEffect, useRef, useState, } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Pressable } from '@/src/components/ui/pressable';
import { FeedPostCard, TextInputField, Heading, TaggedFriendsModal } from '@/src/components/global';
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
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';

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

// ---------- carousel (images) ----------

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CarouselItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

// paths: src/screens/Home/HomeScreen.tsx -> ../../../assets/cocktails
const COCKTAILS: CarouselItem[] = [
  { id: 'margarita', name: 'Margarita', image: require('../../../assets/cocktails/margarita.png') },
  { id: 'clover-club', name: 'Clover Club', image: require('../../../assets/cocktails/clover_club.png') },
  { id: 'espresso-martini', name: 'Espresso Martini', image: require('../../../assets/cocktails/espresso_martini.png') },
  { id: 'whiskey-sour', name: 'Whiskey Sour', image: require('../../../assets/cocktails/whiskey_sour.png') },
  { id: 'hemingway', name: 'Hemingway', image: require('../../../assets/cocktails/hemingway.png') },
  { id: 'jungle-bird', name: 'Jungle Bird', image: require('../../../assets/cocktails/jungle_bird.png') },
];

// ---------- dummy data (when DB is empty / no user) ----------

const DUMMY_POSTS_FRIENDS: FeedPost[] = [
  {
    id: 'dummy-1',
    cocktailId: '',
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
    cocktailId: '',
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

  // tagged friends modal state
  const [tagsModalVisible, setTagsModalVisible] = useState(false);
  const [currentTaggedFriends, setCurrentTaggedFriends] = useState<TaggedUser[]>([]);

  // carousel state - swipe + fade
  const [currentCocktailIndex, setCurrentCocktailIndex] = useState(0);
  const dragX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const commentsScrollViewRef = useRef<ScrollView | null>(null);

  // PanResponder for swipe gestures
  const swipeThreshold = 80; // px drag required to trigger swipe
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        dragX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        const { dx } = gesture;
        if (Math.abs(dx) < swipeThreshold) {
          // snap back
          Animated.spring(dragX, { toValue: 0, useNativeDriver: true })?.start();
          return;
        }
        const direction = dx < 0 ? -1 : 1; // -1 = next (left swipe), 1 = previous (right swipe)
        Animated.parallel([
          Animated.timing(dragX, {
            toValue: direction * Dimensions.get('window').width,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // update index
          setCurrentCocktailIndex((prev) => {
            if (direction === -1) return (prev + 1) % COCKTAILS.length; // left swipe -> next
            return (prev - 1 + COCKTAILS.length) % COCKTAILS.length; // right swipe -> previous
          });
          // prepare new card off-screen opposite side
          dragX.setValue(-direction * Dimensions.get('window').width);
          cardOpacity.setValue(0);
          Animated.parallel([
            Animated.timing(dragX, {
              toValue: 0,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        });
      },
    })
  ).current;
  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setFeedPosts(
            feedFilter === 'friends' ? DUMMY_POSTS_FRIENDS : DUMMY_POSTS_FOR_YOU,
          );
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
            setFeedPosts(DUMMY_POSTS_FRIENDS);
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
          setFeedPosts(
            feedFilter === 'friends' ? DUMMY_POSTS_FRIENDS : DUMMY_POSTS_FOR_YOU,
          );
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
        setFeedPosts(
          feedFilter === 'friends' ? DUMMY_POSTS_FRIENDS : DUMMY_POSTS_FOR_YOU,
        );
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, [feedFilter, user]);

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
      return () => {};
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
      } catch {}
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

  // ---------- cocktail navigation ----------

  const handlePressCocktail = async (cocktailId: string) => {
    if (!cocktailId) {
      console.log('No cocktail ID provided');
      return;
    }
    
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
      <TopBar title="Sippin'" onNotificationPress={handleNotificationSelect} showLogo />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.screenVertical,
          paddingBottom: spacing.screenBottom,
        }}
      >
        {/* Popular Right Now – Swipeable Cocktail Carousel */}
        <Box className="mb-6">
          <Heading level="h3" className="mb-3">Popular right now</Heading>
          <Box className="h-80 items-center justify-center">
            <View style={{ width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
              {/* Side previews */}
              <Animated.View style={{ position: 'absolute', left: 30, zIndex: 1, transform: [{ scale: 0.8 }], opacity: 0.55 }} pointerEvents="none">
                <View style={{
                  width: 120,
                  height: 200,
                  borderRadius: 26,
                  backgroundColor: '#f1f5f9',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  overflow: 'hidden',
                }}>
                  <Image
                    source={COCKTAILS[(currentCocktailIndex - 1 + COCKTAILS.length) % COCKTAILS.length].image}
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                  />
                </View>
              </Animated.View>
              <Animated.View style={{ position: 'absolute', right: 30, zIndex: 1, transform: [{ scale: 0.8 }], opacity: 0.55 }} pointerEvents="none">
                <View style={{
                  width: 120,
                  height: 200,
                  borderRadius: 26,
                  backgroundColor: '#f1f5f9',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  overflow: 'hidden',
                }}>
                  <Image
                    source={COCKTAILS[(currentCocktailIndex + 1) % COCKTAILS.length].image}
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                  />
                </View>
              </Animated.View>
              {/* Active card */}
              <Animated.View
                {...panResponder.panHandlers}
                style={{
                  width: 240,
                  height: 320,
                  borderRadius: 32,
                  backgroundColor: '#ffffff',
                  shadowColor: '#009689',
                  shadowOpacity: 0.25,
                  shadowOffset: { width: 0, height: 12 },
                  shadowRadius: 18,
                  elevation: 10,
                  borderWidth: 2,
                  borderColor: 'rgba(0,150,137,0.35)',
                  padding: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  transform: [{ translateX: dragX }],
                  opacity: cardOpacity,
                  zIndex: 2,
                }}
              >
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: colors.primary[500],
                  opacity: 0.08,
                }} />
                <Image
                  source={COCKTAILS[currentCocktailIndex].image}
                  style={{ width: '100%', height: '92%', resizeMode: 'contain' }}
                />
                <Text className="mt-3 text-lg font-semibold text-neutral-900 text-center">
                  {COCKTAILS[currentCocktailIndex].name}
                </Text>
              </Animated.View>
            </View>
            {/* Pagination dots below card */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
              {COCKTAILS.map((c, idx) => (
                <View
                  key={c.id}
                  style={{
                    width: idx === currentCocktailIndex ? 10 : 7,
                    height: idx === currentCocktailIndex ? 10 : 7,
                    borderRadius: 10,
                    marginHorizontal: 5,
                    backgroundColor: idx === currentCocktailIndex ? colors.primary[500] : '#d1d5db',
                    opacity: idx === currentCocktailIndex ? 1 : 0.55,
                  }}
                />
              ))}
            </View>
          </Box>
        </Box>

        {/* Feed toggle */}
        <Box className="mb-4 bg-white rounded-2xl p-1 flex-row">
          <Pressable
            onPress={() => setFeedFilter('friends')}
            className={
              feedFilter === 'friends'
                ? 'flex-1 py-2 px-4 rounded-xl bg-teal-500'
                : 'flex-1 py-2 px-4 rounded-xl bg-transparent'
            }
          >
            <Text
              className={
                feedFilter === 'friends'
                  ? 'text-sm text-center text-white font-medium'
                  : 'text-sm text-center text-neutral-900 font-medium'
              }
            >
              Friends
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFeedFilter('for-you')}
            className={
              feedFilter === 'for-you'
                ? 'flex-1 py-2 px-4 rounded-xl bg-teal-500'
                : 'flex-1 py-2 px-4 rounded-xl bg-transparent'
            }
          >
            <Text
              className={
                feedFilter === 'for-you'
                  ? 'text-sm text-center text-white font-medium'
                  : 'text-sm text-center text-neutral-900 font-medium'
              }
            >
              For you
            </Text>
          </Pressable>
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
                    onPressTags={() => {
                      if (focusedPost.taggedFriends && focusedPost.taggedFriends.length > 0) {
                        setCurrentTaggedFriends(focusedPost.taggedFriends);
                        setTagsModalVisible(true);
                      }
                    }}
                    onPressCocktail={handlePressCocktail}
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

      {/* Tagged Friends Modal */}
      <TaggedFriendsModal
        visible={tagsModalVisible}
        onClose={() => setTagsModalVisible(false)}
        taggedFriends={currentTaggedFriends}
        onPressFriend={(friendId) => {
          navigation.navigate('UserProfile', { userId: friendId });
        }}
      />
    </Box>
  );
};
