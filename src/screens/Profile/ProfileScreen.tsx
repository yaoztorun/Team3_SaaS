import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileStack';
import { spacing } from '@/src/theme/spacing';
import { useAuth } from '@/src/hooks/useAuth';
import { fetchProfile } from '@/src/api/profile';
import type { Profile } from '@/src/types/profile';
import { supabase } from '@/src/lib/supabase';

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
  }[] | null; // Supabase returns an array here
};

type RecentDrink = {
  id: string;
  name: string;
  subtitle: string; // caption / location
  rating: number;
  time: string;
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
  const [currentView, setCurrentView] = useState<View>('logged-drinks');
  const [isOwnRecipes, setIsOwnRecipes] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // recent drinks state
  const [recentDrinks, setRecentDrinks] = useState<RecentDrink[]>([]);
  const [loadingDrinks, setLoadingDrinks] = useState(false);
  const [drinksError, setDrinksError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (user?.id) {
      setLoadingProfile(true);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setLoadingProfile(false);
    }
  };

  const loadRecentDrinks = async () => {
    if (!user?.id) return;

    try {
      setLoadingDrinks(true);
      setDrinksError(null);

      const { data, error } = await supabase
        .from('DrinkLog')
        .select(
          `
          id,
          created_at,
          caption,
          rating,
          visibility,
          user_id,
          Cocktail (
            id,
            name
          )
        `
        )
        .eq('user_id', user.id) // ✅ all your logs, including private
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const mapped: RecentDrink[] = (data ?? []).map((raw) => {
        const log = raw as DbDrinkLog;

        // Supabase gives Cocktail as an array – use the first one
        const firstCocktail = log.Cocktail?.[0];

        return {
          id: log.id,
          name: firstCocktail?.name ?? 'Unknown cocktail',
          subtitle: log.caption ?? '',
          rating: log.rating ?? 0,
          time: formatTimeAgo(log.created_at),
        };
      });

      setRecentDrinks(mapped);
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
    }, [user]),
  );

  // Dummy stats (UI only for now)
  const userStats = {
    drinksLogged: 47,
    avgRating: 4.1,
    barsVisited: 12,
    popularCocktail: {
      name: 'Mai Tai',
      count: 15,
    },
    cocktailBreakdown: [
      { name: 'Mai Tai', count: 12, color: '#F6339A' },
      { name: 'Mojito', count: 10, color: '#AD46FF' },
      { name: 'Margarita', count: 8, color: '#FF6900' },
      { name: 'Others', count: 17, color: '#F0B100' },
    ],
  };

  return (
    <Box className="flex-1 bg-neutral-50">
      <TopBar
        title="Profile"
        showSettingsIcon
        onSettingsPress={() => navigation.navigate('Settings')}
      />

      {/* User Profile Card */}
      <Box className="mx-4 mt-4 p-6 bg-white rounded-2xl">
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
            <Text className="text-xl font-semibold text-neutral-900">
              {loadingProfile
                ? 'Loading...'
                : profile?.full_name ||
                  user?.email?.split('@')[0] ||
                  'User'}
            </Text>
            <Text className="text-base text-neutral-600">
              {profile?.email || user?.email || 'Cocktail Enthusiast'}
            </Text>
          </Box>
        </HStack>
        <Pressable
          onPress={() => navigation.navigate('EditProfile')}
          className="flex-row justify-center items-center py-2 rounded-lg bg-neutral-100"
        >
          <Text className="text-sm text-teal-500">Edit Profile</Text>
        </Pressable>
      </Box>

      {/* View Toggle */}
      <Box className="mx-4 mt-6 bg-white rounded-2xl p-1 flex-row">
        <Pressable
          onPress={() => setCurrentView('logged-drinks')}
          className={
            currentView === 'logged-drinks'
              ? 'flex-1 py-2 px-4 rounded-xl bg-teal-500'
              : 'flex-1 py-2 px-4 rounded-xl bg-transparent'
          }
        >
          <Text
            className={
              currentView === 'logged-drinks'
                ? 'text-sm text-center text-white'
                : 'text-sm text-center text-neutral-900'
            }
          >
            Logged Drinks
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setCurrentView('stats')}
          className={
            currentView === 'stats'
              ? 'flex-1 py-2 px-4 rounded-xl bg-teal-500'
              : 'flex-1 py-2 px-4 rounded-xl bg-transparent'
          }
        >
          <Text
            className={
              currentView === 'stats'
                ? 'text-sm text-center text-white'
                : 'text-sm text-center text-neutral-900'
            }
          >
            Stats
          </Text>
        </Pressable>
      </Box>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.screenVertical,
          paddingBottom: spacing.screenBottom,
        }}
      >
        {currentView === 'logged-drinks' ? (
          <>
            {/* Logged Drinks Header */}
            <HStack className="justify-between items-center mb-3">
              <Text className="text-base text-neutral-900">
                Recent Logged Drinks
              </Text>
              <TouchableOpacity
                onPress={() => setIsOwnRecipes(!isOwnRecipes)}
                className="flex-row items-center"
              >
                <Box
                  className={
                    isOwnRecipes
                      ? 'h-4 w-4 rounded border mr-2 justify-center items-center bg-teal-500 border-teal-500'
                      : 'h-4 w-4 rounded border mr-2 justify-center items-center bg-neutral-100 border-neutral-300'
                  }
                >
                  {isOwnRecipes && (
                    <Text className="text-white text-xs">✓</Text>
                  )}
                </Box>
                <Text className="text-sm text-neutral-600">Own recipes</Text>
              </TouchableOpacity>
            </HStack>

            {/* Loading / error */}
            {loadingDrinks && (
              <Box className="items-center justify-center py-4">
                <ActivityIndicator />
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

            {/* Recent Drinks List */}
            {!loadingDrinks &&
              !drinksError &&
              recentDrinks.map((drink) => (
                <Box
                  key={drink.id}
                  className="bg-white rounded-2xl p-4 mb-3"
                >
                  <HStack className="justify-between items-center mb-2">
                    <Box>
                      <Text className="text-base text-neutral-900 mb-1">
                        {drink.name}
                      </Text>
                      {!!drink.subtitle && (
                        <Text className="text-sm text-neutral-600">
                          {drink.subtitle}
                        </Text>
                      )}
                    </Box>
                    <Box className="bg-yellow-100 px-2 py-1 rounded-full flex-row items-center">
                      <Text className="text-sm text-neutral-900">
                        ⭐ {drink.rating.toFixed(1)}
                      </Text>
                    </Box>
                  </HStack>
                  <Text className="text-xs text-neutral-500">
                    {drink.time}
                  </Text>
                </Box>
              ))}
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
                    {userStats.drinksLogged}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    Drinks Logged
                  </Text>
                </Box>
                <Box className="items-center">
                  <Text className="text-3xl text-red-500 font-semibold">
                    {userStats.avgRating}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    Avg Rating
                  </Text>
                </Box>
                <Box className="items-center">
                  <Text className="text-3xl text-blue-500 font-semibold">
                    {userStats.barsVisited}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    Bars Visited
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Most Popular Cocktail */}
            <Box className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 mb-4">
              <Text className="text-base text-white mb-2">
                Most Popular Cocktail
              </Text>
              <HStack className="items-center">
                <Text className="text-4xl mr-3">🍹</Text>
                <Box>
                  <Text className="text-xl text-white">
                    {userStats.popularCocktail.name}
                  </Text>
                  <Text className="text-sm text-white opacity-90">
                    Logged {userStats.popularCocktail.count} times
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Rating Trend */}
            <Box className="bg-white rounded-2xl p-4 mb-4">
              <HStack className="justify-between items-center mb-4">
                <Text className="text-base text-neutral-900">
                  Rating Trend
                </Text>
                <Box className="h-5 w-5 bg-neutral-100 rounded-full" />
              </HStack>
              <Box className="h-48 bg-neutral-50 rounded-lg mb-2" />
            </Box>

            {/* Cocktail Breakdown */}
            <Box className="bg-white rounded-2xl p-4">
              <Text className="text-lg text-neutral-900 mb-4">
                Cocktail Breakdown
              </Text>
              <Box className="items-center justify-center mb-4">
                <Box className="h-48 w-48 bg-neutral-50 rounded-full" />
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
                    <Text className="text-sm text-neutral-900">
                      {item.name} - {item.count}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}
      </ScrollView>
    </Box>
  );
};
