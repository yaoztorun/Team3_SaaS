import React, { useState, useEffect } from 'react';
import { ScrollView, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Button } from '@/src/components/ui/button';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { SearchBar, Heading, Avatar } from '@/src/components/global';
import { useAuth } from '@/src/hooks/useAuth';
import {
        searchUsers,
        sendFriendRequest,
        getPendingFriendRequests,
        getSentFriendRequests,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        getFriends,
} from '@/src/api/friendship';
import type { Profile } from '@/src/types/profile';
import type { FriendRequest, Friend } from '@/src/types/friendship';
import { SocialStackParamList } from './SocialStack';

export const FriendsView = () => {
        const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
        const { user } = useAuth();

        // Search state
        const [searchQuery, setSearchQuery] = useState('');
        const [searchResults, setSearchResults] = useState<Profile[]>([]);
        const [searchingUsers, setSearchingUsers] = useState(false);

        // Friend requests state
        const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
        const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
        const [friends, setFriends] = useState<Friend[]>([]);
        const [loading, setLoading] = useState(true);
        const [processingRequest, setProcessingRequest] = useState<string | null>(null);

        // Load friend data
        const loadFriendData = async () => {
                if (!user?.id) return;

                setLoading(true);
                const [pending, sent, friendsList] = await Promise.all([
                        getPendingFriendRequests(user.id),
                        getSentFriendRequests(user.id),
                        getFriends(user.id)
                ]);

                setPendingRequests(pending);
                setSentRequests(sent);
                setFriends(friendsList);
                setLoading(false);
        };

        useEffect(() => {
                loadFriendData();
        }, [user]);

        // Search users with debounce
        useEffect(() => {
                if (!searchQuery.trim() || !user?.id) {
                        setSearchResults([]);
                        return;
                }

                const timeoutId = setTimeout(async () => {
                        setSearchingUsers(true);
                        const results = await searchUsers(searchQuery, user.id);
                        setSearchResults(results);
                        setSearchingUsers(false);
                }, 300);

                return () => clearTimeout(timeoutId);
        }, [searchQuery, user]);

        const handleSendRequest = async (friendId: string) => {
                if (!user?.id) return;

                setProcessingRequest(friendId);
                const result = await sendFriendRequest(user.id, friendId);

                if (result.success) {
                        await loadFriendData();
                        setSearchQuery('');
                        setSearchResults([]);
                } else {
                        alert(result.error || 'Failed to send friend request');
                }
                setProcessingRequest(null);
        };

        const handleAcceptRequest = async (friendshipId: string) => {
                setProcessingRequest(friendshipId);
                const result = await acceptFriendRequest(friendshipId);

                if (result.success) {
                        await loadFriendData();
                } else {
                        alert(result.error || 'Failed to accept friend request');
                }
                setProcessingRequest(null);
        };

        const handleRejectRequest = async (friendshipId: string) => {
                setProcessingRequest(friendshipId);
                const result = await rejectFriendRequest(friendshipId);

                if (result.success) {
                        await loadFriendData();
                } else {
                        alert(result.error || 'Failed to reject friend request');
                }
                setProcessingRequest(null);
        };

        const handleCancelRequest = async (friendshipId: string) => {
                setProcessingRequest(friendshipId);
                const result = await cancelFriendRequest(friendshipId);

                if (result.success) {
                        await loadFriendData();
                } else {
                        alert(result.error || 'Failed to cancel friend request');
                }
                setProcessingRequest(null);
        };

        // Get friendship status for a specific user
        const getFriendshipStatusForUser = (userId: string): 'none' | 'pending' | 'accepted' => {
                // Check if already friends
                if (friends.some(f => f.id === userId)) {
                        return 'accepted';
                }
                // Check if there's a pending request from them
                if (pendingRequests.some(r => r.user_id === userId)) {
                        return 'pending';
                }
                // Check if we sent them a request
                if (sentRequests.some(r => r.friend_id === userId)) {
                        return 'pending';
                }
                return 'none';
        };

        return (
                <>
                        {/* Search Bar */}
                        <Box className="mb-4">
                                <SearchBar
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Search users by name..."
                                />
                        </Box>

                        {/* Search Results */}
                        {searchQuery.trim() && (
                                <Box className="mb-4">
                                        <Text className="text-sm text-gray-600 mb-3">Search Results</Text>
                                        {searchingUsers ? (
                                                <Box className="py-4 items-center">
                                                        <ActivityIndicator size="small" color="#00BBA7" />
                                                </Box>
                                        ) : searchResults.length === 0 ? (
                                                <Text className="text-sm text-gray-500 text-center py-4">No users found</Text>
                                        ) : (
                                                searchResults.map(userResult => (
                                                        <Pressable
                                                                key={userResult.id}
                                                                className="bg-white p-4 rounded-xl mb-2 border border-gray-200"
                                                                onPress={() => navigation.navigate('UserProfile', { userId: userResult.id })}
                                                        >
                                                                <HStack space="md" className="items-center">
                                                                        <Avatar
                                                                                avatarUrl={userResult.avatar_url}
                                                                                initials={userResult.full_name?.charAt(0)?.toUpperCase() || userResult.email?.charAt(0)?.toUpperCase() || '?'}
                                                                                size={48}
                                                                                fallbackColor="#00a294"
                                                                        />
                                                                        <Box className="flex-1">
                                                                                <Heading level="h6">{userResult.full_name || 'User'}</Heading>
                                                                        </Box>
                                                                        {(() => {
                                                                                const status = getFriendshipStatusForUser(userResult.id);

                                                                                if (status === 'accepted') {
                                                                                        return (
                                                                                                <Button size="sm" className="bg-gray-400 min-w-[100px]" disabled>
                                                                                                        <HStack space="xs" className="items-center">
                                                                                                                <Text className="text-white">Friends</Text>
                                                                                                        </HStack>
                                                                                                </Button>
                                                                                        );
                                                                                }

                                                                                if (status === 'pending') {
                                                                                        return (
                                                                                                <Button size="sm" className="bg-gray-400 min-w-[100px]" disabled>
                                                                                                        <Text className="text-white">Pending</Text>
                                                                                                </Button>
                                                                                        );
                                                                                }

                                                                                return (
                                                                                        <Button
                                                                                                size="sm"
                                                                                                className="bg-[#00a294] min-w-[100px]"
                                                                                                onPress={() => handleSendRequest(userResult.id)}
                                                                                                disabled={processingRequest === userResult.id}
                                                                                        >
                                                                                                <Text className="text-white">
                                                                                                        {processingRequest === userResult.id ? 'Sending...' : 'Add Friend'}
                                                                                                </Text>
                                                                                        </Button>
                                                                                );
                                                                        })()}
                                                                </HStack>
                                                        </Pressable>
                                                ))
                                        )}
                                </Box>
                        )}

                        {loading ? (
                                <Box className="py-8 items-center">
                                        <ActivityIndicator size="large" color="#00BBA7" />
                                </Box>
                        ) : (
                                <>
                                        {/* Pending Friend Requests Section */}
                                        {pendingRequests.length > 0 && (
                                                <Box className="mb-4">
                                                        <Text className="text-sm text-gray-600 mb-3">
                                                                Friend Requests ({pendingRequests.length})
                                                        </Text>
                                                        {pendingRequests.map(request => (
                                                                <Pressable
                                                                        key={request.id}
                                                                        className="bg-gray-100 p-4 rounded-xl mb-2 border border-gray-200"
                                                                        onPress={() => navigation.navigate('UserProfile', { userId: request.user_id })}
                                                                >
                                                                        <HStack space="md" className="items-center">
                                                                                <Avatar
                                                                                        avatarUrl={request.sender_profile.avatar_url}
                                                                                        initials={request.sender_profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                                                        size={48}
                                                                                        fallbackColor="#00a294"
                                                                                />
                                                                                <Box className="flex-1">
                                                                                        <Heading level="h6">
                                                                                                {request.sender_profile.full_name || 'User'}
                                                                                        </Heading>
                                                                                </Box>
                                                                                <Box className="flex flex-col sm:flex-row gap-2">
                                                                                        <Button
                                                                                                size="sm"
                                                                                                className="bg-[#00a294] min-w-[80px]"
                                                                                                onPress={() => handleAcceptRequest(request.id)}
                                                                                                disabled={processingRequest === request.id}
                                                                                        >
                                                                                                <Text className="text-white">
                                                                                                        {processingRequest === request.id ? '...' : 'Accept'}
                                                                                                </Text>
                                                                                        </Button>
                                                                                        <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                className="min-w-[80px]"
                                                                                                onPress={() => handleRejectRequest(request.id)}
                                                                                                disabled={processingRequest === request.id}
                                                                                        >
                                                                                                <Text>Decline</Text>
                                                                                        </Button>
                                                                                </Box>
                                                                        </HStack>
                                                                </Pressable>
                                                        ))}
                                                </Box>
                                        )}

                                        {/* Sent Requests Section */}
                                        {sentRequests.length > 0 && (
                                                <Box className="mb-4">
                                                        <HStack className="justify-between items-center mb-3">
                                                                <Text className="text-sm text-gray-600">
                                                                        Sent Requests
                                                                </Text>
                                                                <Box className="bg-gray-100 px-2 py-1 rounded-full">
                                                                        <Text className="text-[11px] text-gray-700">
                                                                                {sentRequests.length} pending
                                                                        </Text>
                                                                </Box>
                                                        </HStack>

                                                        {sentRequests.map((request) => {
                                                                // make TS happy and be flexible with what the API returns
                                                                const anyRequest = request as any;

                                                                // for outgoing requests, we want to show the *other person*:
                                                                // try receiver_profile / friend_profile, fall back to sender_profile
                                                                const targetProfile =
                                                                        anyRequest.receiver_profile ||
                                                                        anyRequest.friend_profile ||
                                                                        anyRequest.sender_profile;

                                                                const targetId = request.friend_id ?? targetProfile?.id;

                                                                return (
                                                                        <Pressable
                                                                                key={request.id}
                                                                                className="bg-white p-4 rounded-xl mb-2 border border-gray-200"
                                                                                onPress={() =>
                                                                                        navigation.navigate('UserProfile', {
                                                                                                userId: targetId,
                                                                                        })
                                                                                }
                                                                        >
                                                                                <HStack space="md" className="items-center">
                                                                                        <Avatar
                                                                                                avatarUrl={targetProfile?.avatar_url}
                                                                                                initials={targetProfile?.full_name?.charAt(0)?.toUpperCase() || targetProfile?.email?.charAt(0)?.toUpperCase() || '?'}
                                                                                                size={48}
                                                                                                fallbackColor="#9ca3af"
                                                                                        />

                                                                                        <Box className="flex-1">
                                                                                                <Heading level="h6">
                                                                                                        {targetProfile?.full_name || 'User'}
                                                                                                </Heading>
                                                                                                <Text className="text-sm text-gray-500">
                                                                                                        Friend request sent · Pending
                                                                                                </Text>
                                                                                        </Box>

                                                                                        <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                className="min-w-[80px]"
                                                                                                onPress={() => handleCancelRequest(request.id)}
                                                                                                disabled={processingRequest === request.id}
                                                                                        >
                                                                                                <Text>
                                                                                                        {processingRequest === request.id ? '...' : 'Cancel'}
                                                                                                </Text>
                                                                                        </Button>
                                                                                </HStack>
                                                                        </Pressable>
                                                                );
                                                        })}
                                                </Box>
                                        )}

                                        {/* Friends List Section */}
                                        <Box>
                                                <Text className="text-sm text-gray-600 mb-3">
                                                        Friends ({friends.length})
                                                </Text>
                                                {friends.length === 0 ? (
                                                        <Text className="text-sm text-gray-500 text-center py-8">
                                                                No friends yet. Search for users to add them!
                                                        </Text>
                                                ) : (
                                                        friends.map(friend => (
                                                                <Pressable
                                                                        key={friend.id}
                                                                        className="bg-gray-100 p-4 rounded-xl mb-2 border border-gray-200"
                                                                        onPress={() => navigation.navigate('UserProfile', { userId: friend.id })}
                                                                >
                                                                        <HStack space="md" className="items-center">
                                                                                <Avatar
                                                                                        avatarUrl={friend.profile.avatar_url}
                                                                                        initials={friend.profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                                                        size={48}
                                                                                        fallbackColor="#00a294"
                                                                                />
                                                                                <Box className="flex-1">
                                                                                        <Heading level="h6">
                                                                                                {friend.profile.full_name || 'User'}
                                                                                        </Heading>
                                                                                </Box>
                                                                        </HStack>
                                                                </Pressable>
                                                        ))
                                                )}
                                        </Box>
                                </>
                        )}
                </>
        );
};
