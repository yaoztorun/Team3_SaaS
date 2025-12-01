import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
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
import { fetchUserStats, UserStats } from '@/src/api/stats';
import { Heading } from '@/src/components/global';
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
  } | null;
};

type RecentDrink = {
  id: string;
  name: string;
  subtitle: string; // caption / location
  rating: number;
  time: string;
  creatorId: string | null;
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
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // recent drinks state
  const [recentDrinks, setRecentDrinks] = useState<RecentDrink[]>([]);
  const [loadingDrinks, setLoadingDrinks] = useState(false);
  const [drinksError, setDrinksError] = useState<string | null>(null);

  // stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // badges state
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  // topbar stats (streak + total drinks)
  const [streakCount, setStreakCount] = useState(0);
  const [totalDrinks, setTotalDrinks] = useState(0);

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
          Cocktail (
            id,
            name,
            creator_id
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

        return {
          id: raw.id,
          name: cocktailName,
          subtitle: raw.caption ?? '',
          rating: raw.rating ?? 0,
          time: formatTimeAgo(raw.created_at),
          creatorId: raw.Cocktail?.creator_id ?? null,
        };
      });

      // Filter by own recipes if toggle is enabled
      if (isOwnRecipes) {
        mapped = mapped.filter(drink => drink.creatorId === user.id);
      }

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
      loadStats();
      loadBadges();
      loadTopBarStats();
    }, [user?.id, isOwnRecipes])
  );



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
                      style={{ width: 50 }}
                    >
                      <Image
                        source={{ uri: badge.imageUrl }}
                        style={{ width: 48, height: 48 }}
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
      <Box className="mb-4 bg-white rounded-2xl p-1 flex-row">
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
                ? 'text-sm text-center text-white font-medium'
                : 'text-sm text-center text-neutral-900 font-medium'
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
                ? 'text-sm text-center text-white font-medium'
                : 'text-sm text-center text-neutral-900 font-medium'
            }
          >
            Stats
          </Text>
        </Pressable>
      </Box>

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
                    {userStats?.drinksLogged || 0}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    Drinks Logged
                  </Text>
                </Box>
                <Box className="items-center">
                  <Text className="text-3xl text-red-500 font-semibold">
                    {userStats?.avgRating || 0}
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
                      labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                      datasets: [{
                        data: userStats.ratingTrend.map(item => item.count),
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
    </Box>
  );
};
