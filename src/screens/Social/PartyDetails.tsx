import React, { useState } from 'react';
import { ScrollView, View, TextInput } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Center } from '@/src/components/ui/center';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SocialStackParamList } from './SocialStack';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { colors } from '@/src/theme/colors';
import { Pressable } from '@/src/components/ui/pressable';
import { PrimaryButton } from '@/src/components/global';
import { Calendar, MapPin, Users, Shirt, DollarSign, MessageCircle, Send } from 'lucide-react-native';

export const PartyDetails: React.FC = () => {
    const route = useRoute<RouteProp<SocialStackParamList, 'PartyDetails'>>();
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const party = route.params?.party;
    const [going, setGoing] = useState(false);
    const [questionText, setQuestionText] = useState('');

    // Sample attendees
    const attendees = [
        { name: 'Mike Rodriguez', initials: 'MR' },
        { name: 'Emma Wilson', initials: 'EW' },
        { name: 'Alex Thompson', initials: 'AT' },
        { name: 'Lisa Anderson', initials: 'LA' },
        { name: 'Tom Harris', initials: 'TH' },
    ];

    // Sample Q&A
    const questions = [
        {
            author: 'Mike Rodriguez',
            question: 'Is there parking available nearby?',
            answer: "Yes! There's a parking garage right next to the building.",
            time: '2 days ago'
        },
        {
            author: 'Emma Wilson',
            question: 'What time does the party usually end?',
            answer: "We usually wrap up around 2 AM, but you can leave whenever you like!",
            time: '1 day ago'
        },
        {
            author: 'Alex Kim',
            question: 'Can I bring a +1?',
            answer: null,
            time: '5 hours ago'
        }
    ];

    if (!party) {
        return (
            <Box className="flex-1 items-center justify-center bg-neutral-50">
                <Text>No party selected</Text>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-gray-100">
            <TopBar title="Party Details" showBack onBackPress={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* Header banner with emoji */}
                <Box className="w-full rounded-2xl overflow-hidden mb-4 relative" style={{ height: 256 }}>
                    <Box className="flex-1 items-center justify-center" style={{ backgroundColor: colors.primary[400] }}>
                        <Text className="text-8xl">{party.emoji ?? '🎉'}</Text>
                    </Box>
                    <View style={{ position: 'absolute', right: 16, top: 16 }}>
                        <Box className="bg-[#e7000b] rounded-lg px-2 py-1">
                            <Text className="text-white text-xs font-medium">{party.status}</Text>
                        </Box>
                    </View>
                </Box>

                {/* Party Info Card */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-semibold text-neutral-950 mb-2">{party.title}</Text>
                    
                    {/* Host Info */}
                    <HStack className="items-center mb-4">
                        <Center className="w-8 h-8 rounded-full bg-[#cbfbf1]">
                            <Text className="text-[#00786f] text-sm font-medium">SC</Text>
                        </Center>
                        <Box className="ml-2">
                            <Text className="text-sm text-neutral-600">Hosted by</Text>
                            <Text className="text-sm text-neutral-950 font-medium">{party.host}</Text>
                        </Box>
                    </HStack>

                    {/* Details with Icons */}
                    <Box className="mt-2 space-y-3">
                        {/* Date & Time */}
                        <HStack className="items-start">
                            <Calendar size={20} color="#6a7282" style={{ marginTop: 2 }} />
                            <Box className="ml-3 flex-1">
                                <Text className="text-sm text-neutral-600">Date & Time</Text>
                                <Text className="text-base text-neutral-950">{party.time}</Text>
                            </Box>
                        </HStack>

                        {/* Location */}
                        <HStack className="items-center">
                            <MapPin size={20} color="#6a7282" />
                            <Text className="text-sm text-neutral-600 ml-3">Location</Text>
                        </HStack>

                        {/* Attendees */}
                        <HStack className="items-start">
                            <Users size={20} color="#6a7282" style={{ marginTop: 2 }} />
                            <Box className="ml-3 flex-1">
                                <Text className="text-sm text-neutral-600">Attendees</Text>
                                <Text className="text-base text-neutral-950">{party.attendees} people going</Text>
                            </Box>
                        </HStack>

                        {/* Dress Code */}
                        <HStack className="items-center">
                            <Shirt size={20} color="#6a7282" />
                            <Text className="text-sm text-neutral-600 ml-3">Dress Code</Text>
                        </HStack>

                        {/* Entry */}
                        <HStack className="items-center">
                            <DollarSign size={20} color="#6a7282" />
                            <Text className="text-sm text-neutral-600 ml-3">Entry</Text>
                        </HStack>
                    </Box>
                </Box>

                {/* About Section */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-semibold text-neutral-950 mb-2">About</Text>
                    <Text className="text-sm text-neutral-700">{party.about ?? 'No additional details provided.'}</Text>
                </Box>

                {/* Q&A Section */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <HStack className="items-center mb-4">
                        <MessageCircle size={20} color="#000" />
                        <Text className="text-base font-semibold text-neutral-950 ml-2">Questions & Answers</Text>
                    </HStack>

                    {/* Ask Question Input */}
                    <Box className="mb-2">
                        <Box className="bg-gray-50 border border-transparent rounded-lg px-3 py-2 mb-2">
                            <TextInput
                                value={questionText}
                                onChangeText={setQuestionText}
                                placeholder="Ask a question about this party..."
                                placeholderTextColor="#717182"
                                className="text-sm text-neutral-700"
                                multiline
                            />
                        </Box>
                        <Pressable 
                            className="bg-[#009689] rounded-lg py-2 flex-row items-center justify-center"
                            style={{ opacity: questionText ? 1 : 0.5 }}
                            disabled={!questionText}
                        >
                            <Send size={16} color="#fff" />
                            <Text className="text-white text-sm font-medium ml-2">Ask Question</Text>
                        </Pressable>
                    </Box>

                    {/* Questions List */}
                    <Box className="mt-4 space-y-3">
                        {questions.map((q, index) => (
                            <Box 
                                key={index}
                                className="bg-gray-50 border-l-4 border-[#00bba7] rounded-br-lg rounded-tr-lg p-3"
                            >
                                <HStack className="justify-between items-center mb-2">
                                    <Text className="text-sm font-medium text-[#009689]">{q.author}</Text>
                                    <Text className="text-xs text-neutral-600">{q.time}</Text>
                                </HStack>
                                <Text className="text-sm text-neutral-950 mb-2">{q.question}</Text>
                                {q.answer && (
                                    <Box className="border-l-2 border-neutral-300 pl-3 ml-3">
                                        <Text className="text-sm italic text-neutral-600">"{q.answer}"</Text>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Going List */}
                <Box className="bg-white rounded-2xl p-4 mb-8">
                    <Text className="text-base font-semibold text-neutral-950 mb-3">Going ({attendees.length})</Text>
                    
                    {/* Attendees List */}
                    <Box className="space-y-2 mb-4">
                        {attendees.map((attendee, index) => (
                            <HStack key={index} className="items-center">
                                <Center className="w-10 h-10 rounded-full bg-[#cbfbf1]">
                                    <Text className="text-[#00786f] text-base font-medium">{attendee.initials}</Text>
                                </Center>
                                <Text className="text-base text-neutral-950 ml-3">{attendee.name}</Text>
                            </HStack>
                        ))}
                    </Box>

                    {/* RSVP Button */}
                    <PrimaryButton
                        title={going ? "I'm Going" : "RSVP"}
                        onPress={() => setGoing(g => !g)}
                    />
                </Box>
            </ScrollView>
        </Box>
    );
};

export default PartyDetails;
