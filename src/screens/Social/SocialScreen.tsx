import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, Text, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@/src/components/ui/box';
import { SocialStackParamList } from './SocialStack';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/button';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { SearchBar } from '@/src/components/global';
import { useAuth } from '@/src/hooks/useAuth';
import { 
    searchUsers, 
    sendFriendRequest, 
    getPendingFriendRequests, 
    getSentFriendRequests,
    acceptFriendRequest, 
    rejectFriendRequest, 
    getFriends,
    getFriendshipStatus 
} from '@/src/api/friendship';
import type { Profile } from '@/src/types/profile';
import type { FriendRequest, Friend } from '@/src/types/friendship';

type ViewType = 'friends' | 'parties';

export const SocialScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const route = useRoute();
    const { user } = useAuth();
    const initialView = (route.params as { initialView?: ViewType })?.initialView || 'friends';
    const [activeView, setActiveView] = useState<ViewType>(initialView);
    const [goingToParties, setGoingToParties] = useState<number[]>([]);
    
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
    const [friendshipStatuses, setFriendshipStatuses] = useState<Map<string, 'none' | 'pending' | 'accepted'>>(new Map());

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

    // Example parties data
    const parties = [
        {
            id: 1,
            title: 'Saturday Rooftop Party',
            host: 'Sarah Chen',
            time: 'Today at 9 PM',
            attendees: 12,
            status: 'Live',
            emoji: '🎉'
        },
        {
            id: 2,
            title: 'Cocktail Tasting Night',
            host: 'Mike Murray',
            time: 'Tomorrow at 7 PM',
            attendees: 8,
            status: 'Upcoming',
            emoji: '🎉'
        },
        {
            id: 3,
            title: 'Friday Vibes Weekend',
            host: 'DJ Alex James',
            time: 'Fri 24 at 10 PM',
            attendees: 23,
            status: 'Upcoming',
            emoji: '🎉'
        }
    ];

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Social" showLogo />
            
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* View Toggle */}
                <Box className="mb-4">
                    <View className="flex-row rounded-xl p-1">
                        <Pressable 
                            onPress={() => setActiveView('friends')}
                            className={activeView === 'friends' ? 'flex-1 rounded-xl py-2 bg-[#00BBA7]' : 'flex-1 rounded-xl py-2'}
                        >
                            <Text className={activeView === 'friends' ? 'text-center text-white font-medium' : 'text-center text-neutral-950'}>
                                Friends
                            </Text>
                        </Pressable>
                        <Pressable 
                            onPress={() => setActiveView('parties')}
                            className={activeView === 'parties' ? 'flex-1 rounded-xl py-2 bg-[#00BBA7]' : 'flex-1 rounded-xl py-2'}
                        >
                            <Text className={activeView === 'parties' ? 'text-center text-white font-medium' : 'text-center text-neutral-950'}>
                                Parties
                            </Text>
                        </Pressable>
                    </View>
                </Box>
                {activeView === 'friends' ? (
                    <>
                        {/* Search Bar */}
                        <Box className="mb-4">
                            <SearchBar
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search users by name or email..."
                            />
                        </Box>

                        {/* Search Results */}
                        {searchQuery.trim() && (
                            <Box className="mb-4">
                                <Text className="text-sm text-gray-600 mb-3">Search Results</Text>
                                {searchingUsers ? (
                                    <Box className="py-4 items-center">
                                        <ActivityIndicator size="small" color="#14b8a6" />
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
                                                {userResult.avatar_url ? (
                                                    <Box className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                                        <Image 
                                                            source={{ uri: userResult.avatar_url }} 
                                                            style={{ width: 48, height: 48 }}
                                                            resizeMode="cover"
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Center className="w-12 h-12 rounded-full bg-[#00a294]">
                                                        <Text className="text-white">
                                                            {userResult.full_name?.charAt(0)?.toUpperCase() || userResult.email?.charAt(0)?.toUpperCase() || '?'}
                                                        </Text>
                                                    </Center>
                                                )}
                                                <Box className="flex-1">
                                                    <Text className="text-base font-medium">{userResult.full_name || 'User'}</Text>
                                                    <Text className="text-sm text-gray-600">{userResult.email}</Text>
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
                                <ActivityIndicator size="large" color="#14b8a6" />
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
                                                    {request.sender_profile.avatar_url ? (
                                                        <Box className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                                            <Image 
                                                                source={{ uri: request.sender_profile.avatar_url }} 
                                                                style={{ width: 48, height: 48 }}
                                                                resizeMode="cover"
                                                            />
                                                        </Box>
                                                    ) : (
                                                        <Center className="w-12 h-12 rounded-full bg-[#00a294]">
                                                            <Text className="text-white">
                                                                {request.sender_profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                            </Text>
                                                        </Center>
                                                    )}
                                                    <Box className="flex-1">
                                                        <Text className="text-base font-medium">
                                                            {request.sender_profile.full_name || 'User'}
                                                        </Text>
                                                        <Text className="text-sm text-gray-600">
                                                            {request.sender_profile.email}
                                                        </Text>
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
                                            {targetProfile?.avatar_url ? (
                                            <Box className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                                <Image
                                                source={{ uri: targetProfile.avatar_url }}
                                                style={{ width: 48, height: 48 }}
                                                resizeMode="cover"
                                                />
                                            </Box>
                                            ) : (
                                            <Center className="w-12 h-12 rounded-full bg-gray-400">
                                                <Text className="text-white">
                                                {targetProfile?.full_name?.charAt(0)?.toUpperCase() ??
                                                    targetProfile?.email?.charAt(0)?.toUpperCase() ??
                                                    '?'}
                                                </Text>
                                            </Center>
                                            )}

                                            <Box className="flex-1">
                                            <Text className="text-base font-medium">
                                                {targetProfile?.full_name || 'User'}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                Friend request sent · Pending
                                            </Text>
                                            </Box>
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
                                                    {friend.profile.avatar_url ? (
                                                        <Box className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                                            <Image 
                                                                source={{ uri: friend.profile.avatar_url }} 
                                                                style={{ width: 48, height: 48 }}
                                                                resizeMode="cover"
                                                            />
                                                        </Box>
                                                    ) : (
                                                        <Center className="w-12 h-12 rounded-full bg-[#00a294]">
                                                            <Text className="text-white">
                                                                {friend.profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                            </Text>
                                                        </Center>
                                                    )}
                                                    <Box className="flex-1">
                                                        <Text className="text-base font-medium">
                                                            {friend.profile.full_name || 'User'}
                                                        </Text>
                                                        <Text className="text-sm text-gray-600">
                                                            {friend.profile.email}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                            </Pressable>
                                        ))
                                    )}
                                </Box>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* Create Party Button */}
                        <Button
                            className="bg-[#00a294] mb-4 flex-row items-center justify-center"
                            onPress={() => navigation.navigate('CreateParty')}
                        >
                            <Text className="text-white">+ Create New Party</Text>
                        </Button>

                        {/* Parties List */}
                        <Box>
                            <Text className="text-sm text-gray-600 mb-3">
                                Active & Upcoming Parties
                            </Text>
                            {parties.map(party => (
                                <Pressable
                                    key={party.id}
                                    onPress={() => navigation.navigate('PartyDetails', { party })}
                                    className="bg-gray-100 p-4 rounded-xl mb-2 border border-gray-200"
                                >
                                    <HStack className="justify-between items-start sm:items-center mb-4 flex-wrap gap-2">
                                        <HStack space="sm" className="items-center flex-shrink min-w-0">
                                            <Text className="text-2xl">{party.emoji}</Text>
                                            <Box className="flex-shrink min-w-0">
                                                <Text className="text-lg font-medium" numberOfLines={1}>{party.title}</Text>
                                                <Text className="text-sm text-[#4a5565]" numberOfLines={1}>{party.host}</Text>
                                            </Box>
                                        </HStack>
                                        <Box 
                                            className={party.status === 'Live' 
                                                ? 'bg-[#ffe2e2] px-2 py-1 rounded-lg flex-shrink-0' 
                                                : 'bg-[#e6f0ff] px-2 py-1 rounded-lg flex-shrink-0'}
                                        >
                                            <Text 
                                                className={party.status === 'Live' ? 'text-[#c10007] text-xs' : 'text-[#1447e6] text-xs'}
                                            >
                                                {party.status}
                                            </Text>
                                        </Box>
                                    </HStack>
                                    <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <HStack space="md" className="flex-wrap">
                                            <HStack space="xs" className="items-center min-w-[120px]">
                                                <Text>🕒</Text>
                                                <Text className="text-sm text-[#4a5565]">{party.time}</Text>
                                            </HStack>
                                            <HStack space="xs" className="items-center min-w-[100px]">
                                                <Text>👥</Text>
                                                <Text className="text-sm text-[#4a5565]">{party.attendees} attending</Text>
                                            </HStack>
                                        </HStack>
                                        <Button 
                                            variant={goingToParties.includes(party.id) ? "solid" : "outline"}
                                            className={goingToParties.includes(party.id) ? "bg-[#00a294] min-w-[100px]" : "border-[#00a294] min-w-[100px]"}
                                            onPress={() => {
                                                if (goingToParties.includes(party.id)) {
                                                    setGoingToParties(prev => prev.filter(id => id !== party.id));
                                                } else {
                                                    setGoingToParties(prev => [...prev, party.id]);
                                                }
                                            }}
                                        >
                                            {goingToParties.includes(party.id) ? (
                                                <HStack space="xs" className="items-center">
                                                    <Text className="text-white">Going</Text>
                                                    <Text className="text-white">✓</Text>
                                                </HStack>
                                            ) : (
                                                <Text className="text-[#00a294]">I'm Going</Text>
                                            )}
                                        </Button>
                                    </Box>
                                </Pressable>
                            ))}
                        </Box>
                    </>
                )}
            </ScrollView>
        </Box>
    );
};