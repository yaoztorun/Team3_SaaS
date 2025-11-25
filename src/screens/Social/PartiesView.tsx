import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Button } from '@/src/components/ui/button';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { SocialStackParamList } from './SocialStack';

export const PartiesView = () => {
        const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
        const [goingToParties, setGoingToParties] = useState<number[]>([]);

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
        );
};
