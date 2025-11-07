import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Button } from '@/src/components/ui/button';
import { HStack } from '@/src/components/ui/hstack';
import { Center } from '@/src/components/ui/center';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SocialStackParamList } from './SocialStack';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { colors } from '@/src/theme/colors';
import { Pressable } from '@/src/components/ui/pressable';

export const PartyDetails: React.FC = () => {
    const route = useRoute<RouteProp<SocialStackParamList, 'PartyDetails'>>();
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const party = route.params?.party;
    const [going, setGoing] = useState(false);

    if (!party) {
        return (
            <Box className="flex-1 items-center justify-center bg-neutral-50">
                <Text>No party selected</Text>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Party Details" showBack onBackPress={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* Header banner */}
                <Box className="w-full rounded-xl overflow-hidden mb-4" style={{ backgroundColor: colors.primary[400], height: 160 }}>
                    <Center className="flex-1">
                        <Text className="text-5xl">{party.emoji ?? '🎉'}</Text>
                    </Center>
                    <View style={{ position: 'absolute', right: 10, top: 10 }}>
                        <Box className="bg-red-500 rounded-lg px-2 py-1">
                            <Text className="text-white text-xs">{party.status}</Text>
                        </Box>
                    </View>
                </Box>

                {/* Info card */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-semibold mb-1">{party.title}</Text>
                    <Text className="text-sm text-neutral-500 mb-3">Hosted by {party.host}</Text>

                    <HStack className="items-center mb-2">
                        <Text className="text-sm text-neutral-600">🕒</Text>
                        <Text className="text-sm text-neutral-600 ml-2">{party.time}</Text>
                    </HStack>

                    <HStack className="items-center mb-2">
                        <Text className="text-sm text-neutral-600">📍</Text>
                        <Text className="text-sm text-neutral-600 ml-2">Location</Text>
                    </HStack>

                    <HStack className="items-center mb-2">
                        <Text className="text-sm text-neutral-600">👥</Text>
                        <Text className="text-sm text-neutral-600 ml-2">{party.attendees} people going</Text>
                    </HStack>
                </Box>

                {/* About */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-sm text-neutral-600 mb-2">About</Text>
                    <Text className="text-neutral-700">{party.about ?? 'No additional details provided.'}</Text>
                </Box>

                {/* Q&A placeholder */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-sm text-neutral-600 mb-3">Questions & Answers</Text>
                    <Box className="bg-neutral-50 rounded-lg p-3 mb-3">
                        <Text className="text-sm text-neutral-500">Ask a question about this party...</Text>
                    </Box>
                    {/* Example Q&A entries - static for now */}
                    <Box className="mb-3">
                        <Box className="bg-neutral-50 rounded-lg p-3 mb-2">
                            <Text className="text-sm font-medium">Mike Rodriguez</Text>
                            <Text className="text-sm text-neutral-600">Is there parking available nearby?</Text>
                        </Box>
                        <Box className="bg-neutral-50 rounded-lg p-3">
                            <Text className="text-sm font-medium">Emma Wilson</Text>
                            <Text className="text-sm text-neutral-600">What time does the party usually end?</Text>
                        </Box>
                    </Box>
                </Box>

                {/* Going list & CTA */}
                <Box className="bg-white rounded-2xl p-4 mb-8">
                    <Text className="text-sm text-neutral-600 mb-3">Going</Text>
                    {/* For now show a few placeholder initials */}
                    <HStack className="mb-4" space="sm">
                        <Center className="w-10 h-10 rounded-full bg-[#00a294]"><Text className="text-white">MR</Text></Center>
                        <Center className="w-10 h-10 rounded-full bg-[#00a294]"><Text className="text-white">EW</Text></Center>
                        <Center className="w-10 h-10 rounded-full bg-[#00a294]"><Text className="text-white">AT</Text></Center>
                        <Center className="w-10 h-10 rounded-full bg-[#00a294]"><Text className="text-white">LA</Text></Center>
                    </HStack>

                    <Button
                        onPress={() => setGoing(g => !g)}
                        className={going ? 'bg-[#007a63]' : 'bg-[#00a294]'}
                    >
                        <Text className="text-white">{going ? "I'm Going" : "I'm Going"}</Text>
                    </Button>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default PartyDetails;
