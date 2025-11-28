import React, { useEffect, useState } from 'react';
import { ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Profile } from '@/src/types/profile';
import { Button } from '@/src/components/ui/button';
import { useAuth } from '@/src/hooks/useAuth';
import { 
    sendFriendRequest, 
    getFriendshipStatus,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends
} from '@/src/api/friendship';
import { fetchUserStats, UserStats } from '@/src/api/stats';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { fetchUserBadges, Badge } from '@/src/api/badges';

type RouteParams = {
    UserProfile: { userId: string };
};

type UserProfileRouteProp = RouteProp<RouteParams, 'UserProfile'>;

export const UserProfile = () => {
    const route = useRoute<UserProfileRouteProp>();
    const navigation = useNavigation();
    const { user: currentUser } = useAuth();
    const { userId } = route.params;
    
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted'>('none');
    const [processingRequest, setProcessingRequest] = useState(false);
    const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loadingBadges, setLoadingBadges] = useState(false);

    useEffect(() => {
        loadUserProfile();
    }, [userId, currentUser]);

    const loadUserProfile = async () => {
        if (!currentUser?.id) return;

        setLoading(true);
        
        // Fetch profile
        const { fetchProfile } = await import('@/src/api/profile');
        const profileData = await fetchProfile(userId);
        setProfile(profileData);

        // Check friendship status
        const status = await getFriendshipStatus(currentUser.id, userId);
        setFriendshipStatus(status);

        // If pending, check if current user is the recipient
        if (status === 'pending') {
            const { getPendingFriendRequests } = await import('@/src/api/friendship');
            const requests = await getPendingFriendRequests(currentUser.id);
            const request = requests.find(r => r.user_id === userId);
            if (request) {
                setPendingRequestId(request.id);
            }
        }

        setLoading(false);
        
        // Load stats
        loadStats();
        
        // Load badges
        loadBadges();
    };

    const loadStats = async () => {
        setLoadingStats(true);
        try {
            const stats = await fetchUserStats(userId);
            setUserStats(stats);
        } catch (error) {
            console.error('Failed to load user stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const loadBadges = async () => {
        setLoadingBadges(true);
        try {
            const userBadges = await fetchUserBadges(userId);
            setBadges(userBadges);
        } catch (error) {
            console.error('Failed to load badges:', error);
        } finally {
            setLoadingBadges(false);
        }
    };

    const handleSendRequest = async () => {
        if (!currentUser?.id) return;
        
        setProcessingRequest(true);
        const result = await sendFriendRequest(currentUser.id, userId);
        
        if (result.success) {
            setFriendshipStatus('pending');
        } else {
            alert(result.error || 'Failed to send friend request');
        }
        setProcessingRequest(false);
    };

    const handleAcceptRequest = async () => {
        if (!pendingRequestId) return;
        
        setProcessingRequest(true);
        const result = await acceptFriendRequest(pendingRequestId);
        
        if (result.success) {
            setFriendshipStatus('accepted');
        } else {
            alert(result.error || 'Failed to accept friend request');
        }
        setProcessingRequest(false);
    };

    const handleRejectRequest = async () => {
        if (!pendingRequestId) return;
        
        setProcessingRequest(true);
        const result = await rejectFriendRequest(pendingRequestId);
        
        if (result.success) {
            setFriendshipStatus('none');
        } else {
            alert(result.error || 'Failed to reject friend request');
        }
        setProcessingRequest(false);
    };

    if (loading) {
        return (
            <Box className="flex-1 bg-neutral-50">
                <TopBar title="Profile" showBack onBackPress={() => navigation.goBack()} />
                <Center className="flex-1">
                    <ActivityIndicator size="large" color="#14b8a6" />
                </Center>
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box className="flex-1 bg-neutral-50">
                <TopBar title="Profile" showBack onBackPress={() => navigation.goBack()} />
                <Center className="flex-1">
                    <Text className="text-gray-500">User not found</Text>
                </Center>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Profile" showBack onBackPress={() => navigation.goBack()} />
            
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* User Profile Card */}
                <Box className="p-6 bg-white rounded-2xl mb-4">
                    <Center className="mb-4">
                        {profile.avatar_url ? (
                            <Box className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                                <Image 
                                    source={{ uri: profile.avatar_url }} 
                                    style={{ width: 96, height: 96 }}
                                    resizeMode="cover"
                                />
                            </Box>
                        ) : (
                            <Center className="h-24 w-24 rounded-full bg-teal-500">
                                <Text className="text-3xl text-white">
                                    {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || '?'}
                                </Text>
                            </Center>
                        )}
                    </Center>

                    <Center>
                        <Text className="text-2xl font-semibold text-neutral-900 mb-1">
                            {profile.full_name || 'User'}
                        </Text>
                        
                        {/* Badges */}
                        <Box className="mt-2">
                            {loadingBadges ? (
                                <Text className="text-xs text-neutral-500">Loading badges...</Text>
                            ) : badges.length > 0 ? (
                                <HStack className="flex-wrap gap-2 justify-center">
                                    {badges.slice(0, 6).map((badge) => (
                                        <Box 
                                            key={badge.type}
                                            className="items-center"
                                            style={{ width: 50 }}
                                        >
                                            <Image
                                                source={{ uri: badge.imageUrl }}
                                                style={{ width: 48, height: 48 }}
                                                resizeMode="contain"
                                            />
                                        </Box>
                                    ))}
                                </HStack>
                            ) : (
                                <Text className="text-xs text-neutral-500">No badges earned yet</Text>
                            )}
                        </Box>
                    </Center>

                    {/* Friend Action Button */}
                    {currentUser?.id !== userId && (
                        <Box className="mt-4">
                            {friendshipStatus === 'none' && (
                                <Button
                                    className="bg-[#00a294]"
                                    onPress={handleSendRequest}
                                    disabled={processingRequest}
                                >
                                    <Text className="text-white">
                                        {processingRequest ? 'Sending...' : 'Add Friend'}
                                    </Text>
                                </Button>
                            )}
                            
                            {friendshipStatus === 'pending' && !pendingRequestId && (
                                <Button className="bg-gray-400" disabled>
                                    <Text className="text-white">Request Sent</Text>
                                </Button>
                            )}

                            {friendshipStatus === 'pending' && pendingRequestId && (
                                <HStack space="sm">
                                    <Box className="flex-1">
                                        <Button
                                            className="bg-[#00a294]"
                                            onPress={handleAcceptRequest}
                                            disabled={processingRequest}
                                        >
                                            <Text className="text-white">Accept</Text>
                                        </Button>
                                    </Box>
                                    <Box className="flex-1">
                                        <Button
                                            variant="outline"
                                            onPress={handleRejectRequest}
                                            disabled={processingRequest}
                                        >
                                            <Text>Decline</Text>
                                        </Button>
                                    </Box>
                                </HStack>
                            )}

                            {friendshipStatus === 'accepted' && (
                                <Button className="bg-[#00a294]" disabled>
                                    <HStack space="xs" className="items-center justify-center">
                                        <Text className="text-white">Friends</Text>
                                        <Text className="text-white">✓</Text>
                                    </HStack>
                                </Button>
                            )}

                        </Box>
                    )}
                </Box>

                {/* Stats Section */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-base text-neutral-900 mb-4">Stats</Text>
                    {loadingStats ? (
                        <Center className="py-4">
                            <ActivityIndicator color="#14b8a6" />
                        </Center>
                    ) : (
                        <HStack className="justify-around">
                            <Box className="items-center">
                                <Text className="text-2xl text-teal-500 font-semibold">
                                    {userStats?.drinksLogged || 0}
                                </Text>
                                <Text className="text-xs text-neutral-500">Drinks Logged</Text>
                            </Box>
                            <Box className="items-center">
                                <Text className="text-2xl text-red-500 font-semibold">
                                    {userStats?.avgRating || 0}
                                </Text>
                                <Text className="text-xs text-neutral-500">Avg Rating</Text>
                            </Box>
                            <Box className="items-center">
                                <Text className="text-2xl text-blue-500 font-semibold">
                                    {userStats?.barsVisited || 0}
                                </Text>
                                <Text className="text-xs text-neutral-500">Bars Visited</Text>
                            </Box>
                        </HStack>
                    )}
                </Box>

                {/* Top Cocktails */}
                {userStats?.topCocktails && userStats.topCocktails.length > 0 && (
                    <Box className="bg-white rounded-2xl p-4 mb-4">
                        <Text className="text-base text-neutral-900 mb-3">
                            Most Popular
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
                {userStats?.ratingTrend && userStats.ratingTrend.some(item => item.count > 0) && (
                    <Box className="bg-white rounded-2xl p-4 mb-4">
                        <Text className="text-base text-neutral-900 mb-4">
                            Rating Trend
                        </Text>
                        <Box className="items-center justify-center">
                            <LineChart
                                data={{
                                    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                                    datasets: [{
                                        data: userStats.ratingTrend.map(item => item.count),
                                    }],
                                }}
                                width={300}
                                height={180}
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
                    </Box>
                )}

                {/* Cocktail Breakdown */}
                {userStats?.cocktailBreakdown && userStats.cocktailBreakdown.length > 0 && (
                    <Box className="bg-white rounded-2xl p-4">
                        <Text className="text-lg text-neutral-900 mb-4">
                            Cocktail Breakdown
                        </Text>
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
                    </Box>
                )}
            </ScrollView>
        </Box>
    );
};
