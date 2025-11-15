import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Pressable } from '@/src/components/ui/pressable';
import { FeedPostCard } from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';

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
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

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

// ---------- carousel setup (no images, no Animated) ----------

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

// ---------- dummy data (for when DB is empty) ----------

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
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('friends');
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const handleCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    setActiveIndex(index);
  };

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        // not logged in -> show dummy data
        if (!user) {
          if (feedFilter === 'friends') {
            setFeedPosts(DUMMY_POSTS_FRIENDS);
          } else {
            setFeedPosts(DUMMY_POSTS_FOR_YOU);
          }
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

          // include own logs
          friendIds.add(user.id);

          const idsArray = Array.from(friendIds);
          if (idsArray.length === 0) {
            // no friends yet -> dummy
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

        const mapped: FeedPost[] = rawLogs.map((raw) => {
          const log = raw as DbDrinkLog;
          const fullName = log.Profile?.full_name ?? 'Unknown user';
          const initials = getInitials(fullName);
          const cocktailName = log.Cocktail?.name ?? 'Unknown cocktail';
          const imageUrl = log.image_url ?? log.Cocktail?.image_url ?? '';

          return {
            id: log.id,
            userName: fullName,
            userInitials: initials,
            timeAgo: formatTimeAgo(log.created_at),
            cocktailName,
            rating: log.rating ?? 0,
            imageUrl,
            likes: 0,
            comments: 0,
            caption: log.caption ?? '',
            isLiked: false,
          };
        });

        // if DB has no logs yet, still show dummy so you see *something*
        if (mapped.length === 0) {
          setFeedPosts(
            feedFilter === 'friends' ? DUMMY_POSTS_FRIENDS : DUMMY_POSTS_FOR_YOU,
          );
        } else {
          setFeedPosts(mapped);
        }
      } catch (err: any) {
        console.error('Error loading feed:', err);
        setError(err.message ?? 'Something went wrong loading the feed.');
        // show dummy so screen isn’t empty
        setFeedPosts(
          feedFilter === 'friends' ? DUMMY_POSTS_FRIENDS : DUMMY_POSTS_FOR_YOU,
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [feedFilter]);

  return (
    <Box className="flex-1 bg-neutral-50">
      <TopBar title="Feed" streakCount={12} cocktailCount={47} />

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
            Popular Right Now
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

        {/* Feed header + toggle */}
        <Box className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-medium text-neutral-900">Feed</Text>

          <Box className="flex-row bg-neutral-100 rounded-full p-1">
            <Pressable
              onPress={() => setFeedFilter('friends')}
              className={`px-3 py-1 rounded-full ${
                feedFilter === 'friends' ? 'bg-white shadow' : ''
              }`}
            >
              <Text
                className={`text-xs ${
                  feedFilter === 'friends'
                    ? 'text-neutral-900 font-semibold'
                    : 'text-neutral-500'
                }`}
              >
                Friends
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFeedFilter('for-you')}
              className={`px-3 py-1 rounded-full ml-1 ${
                feedFilter === 'for-you' ? 'bg-white shadow' : ''
              }`}
            >
              <Text
                className={`text-xs ${
                  feedFilter === 'for-you'
                    ? 'text-neutral-900 font-semibold'
                    : 'text-neutral-500'
                }`}
              >
                For you
              </Text>
            </Pressable>
          </Box>
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
            <FeedPostCard {...post} />
          </Box>
        ))}
      </ScrollView>
    </Box>
  );
};
