import React, { useEffect, useState } from 'react';
import { ScrollView, Image, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Profile } from '@/src/types/profile';
import { Button } from '@/src/components/ui/button';
import { Avatar } from '@/src/components/global';
import { useAuth } from '@/src/hooks/useAuth';
import { useUserStats } from '@/src/hooks/useUserStats';
import {
    sendFriendRequest,
    getFriendshipStatus,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    unfriendUser,
    getFriends
} from '@/src/api/friendship';
import { Heading, ToggleSwitch, FeedPostCard, TextInputField } from '@/src/components/global';
import { ProfileStats } from '@/src/screens/Profile/components/ProfileStats';
import { GridGallery, type RecentDrink as GridRecentDrink } from '@/src/screens/Profile/components/GridGallery';
import { fetchUserBadges, Badge } from '@/src/api/badges';
import { BadgeModal } from '@/src/components/global/BadgeModal';
import { supabase } from '@/src/lib/supabase';
import { getCommentsForLog, addComment, type CommentRow } from '@/src/api/comments';
import { getLikesForLogs, toggleLike } from '@/src/api/likes';
import { getTagsForLogs } from '@/src/api/tags';
import { fetchCocktailById } from '@/src/api/cocktail';
import { ArrowLeft } from 'lucide-react-native';

type RouteParams = {
    UserProfile: { userId: string };
};

type UserProfileRouteProp = RouteProp<RouteParams, 'UserProfile'>;

type View = 'drinks' | 'stats';

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
    } | null;
    image_url?: string | null;
};

type RecentDrink = GridRecentDrink;

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
    const [friendshipId, setFriendshipId] = useState<string | null>(null);

    // Use centralized stats hook
    const { userStats, loadingStats, avgRatingOutOf5, ratingTrendCounts5 } = useUserStats(userId);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loadingBadges, setLoadingBadges] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [currentView, setCurrentView] = useState<View>('drinks');
    const [recentDrinks, setRecentDrinks] = useState<RecentDrink[]>([]);
    const [loadingDrinks, setLoadingDrinks] = useState(false);

    // Post detail modal state
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [focusedPost, setFocusedPost] = useState<any>(null);
    const [commentsForPost, setCommentsForPost] = useState<CommentRow[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);

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
            const { getPendingFriendRequests, getSentFriendRequests } = await import('@/src/api/friendship');
            const requests = await getPendingFriendRequests(currentUser.id);
            const request = requests.find(r => r.user_id === userId);
            if (request) {
                setPendingRequestId(request.id);
                setFriendshipId(request.id);
            } else {
                // Check sent requests to get the friendship ID
                const sentRequests = await getSentFriendRequests(currentUser.id);
                const sentRequest = sentRequests.find(r => r.friend_id === userId);
                if (sentRequest) {
                    setFriendshipId(sentRequest.id);
                }
            }
        }

        // If accepted, get the friendship_id
        if (status === 'accepted') {
            const friends = await getFriends(currentUser.id);
            const friend = friends.find(f => f.id === userId);
            if (friend) {
                setFriendshipId(friend.friendship_id);
            }
        }

        setLoading(false);

        // Stats are loaded automatically by useUserStats hook

        // Load badges
        loadBadges();

        // Load drinks
        loadRecentDrinks();
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

    const loadRecentDrinks = async () => {
        if (!userId) return;

        try {
            setLoadingDrinks(true);

            // Fetch only public and friends visibility posts
            const { data, error } = await supabase
                .from('DrinkLog')
                .select(`
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
                        image_url
                    )
                `)
                .eq('user_id', userId)
                .in('visibility', ['public', 'friends'])
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            const mapped: RecentDrink[] = (data ?? []).map((raw: any) => {
                const cocktailName = raw.Cocktail?.name ?? 'Unknown cocktail';
                const preview = raw.image_url || raw.Cocktail?.image_url || '';

                return {
                    id: raw.id,
                    name: cocktailName,
                    subtitle: raw.caption ?? '',
                    rating: raw.rating ?? 0,
                    time: formatTimeAgo(raw.created_at),
                    createdAt: raw.created_at,
                    creatorId: raw.user_id,
                    imageUrl: preview,
                    type: 'log' as const,
                    visibility: raw.visibility as any,
                    cocktailId: raw.Cocktail?.id ?? null,
                };
            });

            setRecentDrinks(mapped);
        } catch (err: any) {
            console.error('Error loading recent drinks:', err);
            setRecentDrinks([]);
        } finally {
            setLoadingDrinks(false);
        }
    };

    const loadComments = async (postId: string) => {
        setCommentsLoading(true);
        const rows = await getCommentsForLog(postId);
        setCommentsForPost(rows);
        setCommentsLoading(false);
    };

    const openPostModal = async (drink: RecentDrink) => {
        if (!currentUser) return;

        setSelectedPostId(drink.id);
        setShowPostModal(true);

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

            const likesMap = await getLikesForLogs([drink.id], currentUser.id);
            const tagsMap = await getTagsForLogs([drink.id]);
            const likes = {
                count: likesMap.counts.get(drink.id) || 0,
                isLiked: likesMap.likedByMe.has(drink.id)
            };
            const taggedFriends = tagsMap.get(drink.id) || [];

            const { count: commentCount } = await supabase
                .from('DrinkLogComment')
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
        if (!currentUser?.id || !selectedPostId || !newComment.trim() || sendingComment) {
            return;
        }

        const content = newComment.trim();
        setSendingComment(true);
        setNewComment('');

        const res = await addComment(selectedPostId, currentUser.id, content);

        if (!res.success) {
            console.warn(res.error);
        } else {
            await loadComments(selectedPostId);

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
        if (!currentUser?.id || !focusedPost) return;

        const prevLiked = focusedPost.isLiked;

        setFocusedPost({
            ...focusedPost,
            isLiked: !focusedPost.isLiked,
            likes: focusedPost.likes + (focusedPost.isLiked ? -1 : 1),
        });

        const result = await toggleLike(postId, currentUser.id, prevLiked);
        if (!result.success) {
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

        console.log('UserProfile: Closing modal and navigating to cocktail:', cocktail.name);
        closePostModal();

        // Navigate to Main (BottomTabs), then to Explore tab, then to CocktailDetail
        navigation.dispatch(
            CommonActions.navigate({
                name: 'Main',
                params: {
                    screen: 'Explore',
                    params: {
                        screen: 'CocktailDetail',
                        params: { cocktail }
                    }
                }
            })
        );
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
            setFriendshipId(null);
            setPendingRequestId(null);
        } else {
            alert(result.error || 'Failed to reject friend request');
        }
        setProcessingRequest(false);
    };

    const handleCancelRequest = async () => {
        if (!friendshipId) return;

        setProcessingRequest(true);
        const result = await cancelFriendRequest(friendshipId);

        if (result.success) {
            setFriendshipStatus('none');
            setFriendshipId(null);
        } else {
            alert(result.error || 'Failed to cancel friend request');
        }
        setProcessingRequest(false);
    };

    const handleUnfriend = async () => {
        if (!friendshipId) return;

        setProcessingRequest(true);
        const result = await unfriendUser(friendshipId);

        if (result.success) {
            setFriendshipStatus('none');
            setFriendshipId(null);
        } else {
            alert(result.error || 'Failed to unfriend user');
        }
        setProcessingRequest(false);
    };

    if (loading) {
        return (
            <Box className="flex-1 bg-neutral-50">
                <TopBar title="Profile" showBack onBackPress={() => navigation.goBack()} />
                <Center className="flex-1">
                    <ActivityIndicator size="large" color="#00BBA7" />
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
        <Box className="flex-1 bg-neutral-50" style={{ height: '100vh', maxHeight: '100vh' } as any}>
            <TopBar title="Profile" showBack onBackPress={() => navigation.goBack()} />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* User Profile Card */}
                <Box className="p-6 bg-white rounded-2xl mb-4">
                    <Center className="mb-4">
                        <Avatar
                            avatarUrl={profile.avatar_url}
                            initials={profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || '?'}
                            size={96}
                            fallbackColor="#14b8a6"
                        />
                    </Center>

                    <Center className="mb-4">
                        <Heading level="h3" className="mb-1">
                            {profile.full_name || 'User'}
                        </Heading>

                        {/* Badges - only visible to friends or own profile */}
                        {(friendshipStatus === 'accepted' || currentUser?.id === userId) && (
                            <Box className="mt-2">
                                {loadingBadges ? (
                                    <Text className="text-xs text-neutral-500">Loading badges...</Text>
                                ) : badges.length > 0 ? (
                                    <HStack className="flex-wrap gap-2 justify-center">
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
                        )}
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
                                <Button
                                    variant="outline"
                                    onPress={handleCancelRequest}
                                    disabled={processingRequest}
                                >
                                    <Text>{processingRequest ? 'Cancelling...' : 'Cancel Request'}</Text>
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
                                <Button
                                    variant="outline"
                                    onPress={handleUnfriend}
                                    disabled={processingRequest}
                                >
                                    <Text>{processingRequest ? 'Unfriending...' : 'Unfriend'}</Text>
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Show content only if friends or viewing own profile */}
                {(friendshipStatus === 'accepted' || currentUser?.id === userId) ? (
                    <>
                        {/* View Toggle */}
                        <Box className="mb-4 bg-white rounded-2xl p-1">
                            <ToggleSwitch
                                value={currentView === 'drinks' ? 'left' : 'right'}
                                onChange={(val: 'left' | 'right') => setCurrentView(val === 'left' ? 'drinks' : 'stats')}
                                leftLabel="Drinks"
                                rightLabel="Stats"
                            />
                        </Box>

                        {currentView === 'drinks' ? (
                            <>
                                {/* Drinks Grid */}
                                {loadingDrinks && (
                                    <Box className="items-center justify-center py-4">
                                        <ActivityIndicator size="large" color="#00BBA7" />
                                    </Box>
                                )}

                                {!loadingDrinks && recentDrinks.length === 0 && (
                                    <Box className="py-4">
                                        <Text className="text-sm text-neutral-500">
                                            No drinks logged yet.
                                        </Text>
                                    </Box>
                                )}

                                {!loadingDrinks && recentDrinks.length > 0 && (
                                    <GridGallery
                                        items={recentDrinks}
                                        onPress={(item) => openPostModal(item)}
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
                                    title="Stats"
                                />
                            </>
                        )}
                    </>
                ) : (
                    /* Private Profile Message */
                    <Box className="bg-white rounded-2xl p-8">
                        <Center>
                            <Box className="w-16 h-16 rounded-full bg-neutral-200 items-center justify-center mb-4">
                                <Text className="text-3xl">🔒</Text>
                            </Box>
                            <Heading level="h3" className="mb-2">
                                This Profile is Private
                            </Heading>
                            <Text className="text-sm text-neutral-500 text-center">
                                Add this user as a friend to see their drinks and stats
                            </Text>
                        </Center>
                    </Box>
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
                                    <FeedPostCard
                                        {...focusedPost}
                                        onToggleLike={() => handleToggleLike(focusedPost.id)}
                                        onPressComments={() => { }}
                                        onPressCocktail={handlePressCocktail}
                                    />
                                )}

                                <Box className="mt-4" />
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
                                                    <Box className="mr-3">
                                                        <Avatar
                                                            avatarUrl={avatarUrl}
                                                            initials={initials}
                                                            size={32}
                                                            fallbackColor="#009689"
                                                        />
                                                    </Box>
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