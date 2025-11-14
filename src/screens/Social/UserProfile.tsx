import React, { useEffect, useState } from 'react';
import { ScrollView, Image, ActivityIndicator } from 'react-native';
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

                    <Center className="mb-4">
                        <Text className="text-2xl font-semibold text-neutral-900 mb-1">
                            {profile.full_name || 'User'}
                        </Text>
                        <Text className="text-base text-neutral-600">
                            {profile.email}
                        </Text>
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

                {/* Stats Section - Placeholder */}
                <Box className="bg-white rounded-2xl p-4">
                    <Text className="text-base text-neutral-900 mb-4">Stats</Text>
                    <HStack className="justify-around">
                        <Box className="items-center">
                            <Text className="text-2xl text-teal-500 font-semibold">--</Text>
                            <Text className="text-xs text-neutral-500">Drinks Logged</Text>
                        </Box>
                        <Box className="items-center">
                            <Text className="text-2xl text-red-500 font-semibold">--</Text>
                            <Text className="text-xs text-neutral-500">Avg Rating</Text>
                        </Box>
                        <Box className="items-center">
                            <Text className="text-2xl text-blue-500 font-semibold">--</Text>
                            <Text className="text-xs text-neutral-500">Bars Visited</Text>
                        </Box>
                    </HStack>
                </Box>
            </ScrollView>
        </Box>
    );
};
