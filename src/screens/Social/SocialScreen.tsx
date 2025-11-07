import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, View, Text } from 'react-native';
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

type ViewType = 'friends' | 'parties';

export const SocialScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const route = useRoute();
    const initialView = (route.params as { initialView?: ViewType })?.initialView || 'friends';
    const [activeView, setActiveView] = useState<ViewType>(initialView);
    const [acceptedFriends, setAcceptedFriends] = useState<number[]>([]);
    const [goingToParties, setGoingToParties] = useState<number[]>([]);

    // Example friend request data
    const friendRequests = [
        { id: 1, name: 'Emmy Wilson', mutualFriends: 12, initials: 'EW' },
        { id: 2, name: 'James Mitchell', mutualFriends: 8, initials: 'JM' }
    ];

    // Example friends data
    const friends = [
        { id: 1, name: 'Sarah Chen', status: 'Active now', initials: 'SC', isActive: true },
        { id: 2, name: 'Alex Kim', status: 'Active now', initials: 'AK', isActive: true },
        { id: 3, name: 'Mike Rodriguez', status: 'Active 2h ago', initials: 'MR', isActive: false },
        { id: 4, name: 'Emma Wilson', status: 'Active now', initials: 'EW', isActive: true },
        { id: 5, name: 'Tom Harris', status: 'Active 1d ago', initials: 'TH', isActive: false }
    ];

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
            <TopBar title="Social" streakCount={12} cocktailCount={47} />
            
            {/* View Toggle */}
            <Box className="bg-[#F3F4F6] p-4">
                <View className="bg-[#E5E7EB] flex-row rounded-xl p-1">
                    <Pressable 
                        onPress={() => setActiveView('friends')}
                        className={activeView === 'friends' ? 'flex-1 rounded-xl py-2 bg-[#00BBA7]' : 'flex-1 rounded-xl py-2'}
                    >
                        <Text className={activeView === 'friends' ? 'text-center text-white' : 'text-center text-neutral-950'}>
                            Friends
                        </Text>
                    </Pressable>
                    <Pressable 
                        onPress={() => setActiveView('parties')}
                        className={activeView === 'parties' ? 'flex-1 rounded-xl py-2 bg-[#00BBA7]' : 'flex-1 rounded-xl py-2'}
                    >
                        <Text className={activeView === 'parties' ? 'text-center text-white' : 'text-center text-neutral-950'}>
                            Parties
                        </Text>
                    </Pressable>
                </View>
            </Box>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {activeView === 'friends' ? (
                    <>
                        {/* Search Bar */}
                        <Box className="mb-4 relative">
                            <TextInput
                                placeholder="Search users..."
                                className="bg-gray-100 px-10 py-3 rounded-xl text-base text-neutral-500"
                            />
                            <Box className="absolute left-3 top-3">
                                {/* Search Icon Placeholder */}
                                <Text>🔍</Text>
                            </Box>
                        </Box>

                        {/* Friend Requests Section */}
                        <Box className="mb-4">
                            <Text className="text-sm text-gray-600 mb-3">
                                Friend Requests ({friendRequests.length})
                            </Text>
                            {friendRequests.map(request => (
                                <Box key={request.id} className="bg-gray-100 p-4 rounded-xl mb-2 border border-gray-200">
                                    <HStack space="md" className="items-center">
                                        <Center className="w-12 h-12 rounded-full bg-[#00a294]">
                                            <Text className="text-white">{request.initials}</Text>
                                        </Center>
                                        <Box className="flex-1">
                                            <Text className="text-base font-medium">{request.name}</Text>
                                            <Text className="text-sm text-gray-600">{request.mutualFriends} mutual friends</Text>
                                        </Box>
                                        <Box className="flex flex-col sm:flex-row gap-2">
                                            {!acceptedFriends.includes(request.id) ? (
                                                <>
                                                    <Button 
                                                        size="sm" 
                                                        className="bg-[#00a294] min-w-[80px]"
                                                        onPress={() => setAcceptedFriends(prev => [...prev, request.id])}
                                                    >
                                                        <Text className="text-white">Accept</Text>
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="min-w-[80px]"
                                                    >
                                                        <Text>Decline</Text>
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    className="bg-[#00a294] min-w-[80px]"
                                                    disabled
                                                >
                                                    <HStack space="xs" className="items-center">
                                                        <Text className="text-white">Added</Text>
                                                        <Text className="text-white">✓</Text>
                                                    </HStack>
                                                </Button>
                                            )}
                                        </Box>
                                    </HStack>
                                </Box>
                            ))}
                        </Box>

                        {/* Friends List Section */}
                        <Box>
                            <Text className="text-sm text-gray-600 mb-3">
                                Friends ({friends.length})
                            </Text>
                            {friends.map(friend => (
                                <Pressable key={friend.id} className="bg-gray-100 p-4 rounded-xl mb-2 border border-gray-200">
                                    <HStack space="md" className="items-center">
                                        <Box className="relative">
                                            <Center className="w-12 h-12 rounded-full bg-[#00a294]">
                                                <Text className="text-white">{friend.initials}</Text>
                                            </Center>
                                            {friend.isActive && (
                                                <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#00c950] rounded-full border-2 border-white" />
                                            )}
                                        </Box>
                                        <Box className="flex-1">
                                            <Text className="text-base font-medium">{friend.name}</Text>
                                            <Text className={friend.isActive ? 'text-sm text-[#00a63e]' : 'text-sm text-gray-600'}>
                                                {friend.status}
                                            </Text>
                                        </Box>
                                    </HStack>
                                </Pressable>
                            ))}
                        </Box>
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