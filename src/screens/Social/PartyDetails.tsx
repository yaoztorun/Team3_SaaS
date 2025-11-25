import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, Image } from 'react-native';
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
import type { EventWithDetails } from '@/src/api/event';
import { fetchEventAttendees } from '@/src/api/event';

export const PartyDetails: React.FC = () => {
    const route = useRoute<RouteProp<SocialStackParamList, 'PartyDetails'>>();
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const party = route.params?.party as EventWithDetails;
    const [going, setGoing] = useState(false);
    const [questionText, setQuestionText] = useState('');
    const [registeredAttendees, setRegisteredAttendees] = useState<Array<{ id: string; full_name: string | null; avatar_url: string | null }>>([]);
    const [waitlistedAttendees, setWaitlistedAttendees] = useState<Array<{ id: string; full_name: string | null; avatar_url: string | null }>>([]);

    // Fetch attendees on mount
    useEffect(() => {
        if (party?.id) {
            loadAttendees();
        }
    }, [party?.id]);

    const loadAttendees = async () => {
        const { registered, waitlisted } = await fetchEventAttendees(party.id);
        setRegisteredAttendees(registered);
        setWaitlistedAttendees(waitlisted);
    };

    // Format date helper
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Format time helper
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Construct location address
    const publicLocationAddress = party?.location && party.location.street_name && party.location.city
        ? `${party.location.street_name} ${party.location.street_nr || ''}, ${party.location.city}`.trim()
        : null;
    const userLocationAddress = party?.user_location && party.user_location.street && party.user_location.city
        ? `${party.user_location.street} ${party.user_location.house_nr || ''}, ${party.user_location.city}`.trim()
        : null;
    const locationAddress = publicLocationAddress || userLocationAddress || 'Location TBA';
    const locationName = party?.location?.name;

    // Get organizer initials
    const getInitials = (name: string | null | undefined) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const organizerName = party?.organizer_profile?.full_name || 'Unknown';
    const organizerInitials = getInitials(organizerName);

    // Sample Q&A - TODO: Fetch from database
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
                {/* Header banner with cover image or emoji */}
                <Box className="w-full rounded-2xl overflow-hidden mb-4 relative" style={{ height: 256 }}>
                    {party.cover_image ? (
                        <Image
                            source={{ uri: party.cover_image }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Box className="flex-1 items-center justify-center" style={{ backgroundColor: colors.primary[400] }}>
                            <Text className="text-8xl">🎉</Text>
                        </Box>
                    )}
                    {party.price && party.price > 0 && (
                        <View style={{ position: 'absolute', right: 16, top: 16 }}>
                            <Box className="bg-[#00a294] rounded-lg px-2 py-1">
                                <Text className="text-white text-xs font-semibold">€{party.price}</Text>
                            </Box>
                        </View>
                    )}
                </Box>

                {/* Party Info Card */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-semibold text-neutral-950 mb-2">{party.name}</Text>

                    {/* Host Info */}
                    <HStack className="items-center mb-4">
                        {party.organizer_profile?.avatar_url ? (
                            <Image
                                source={{ uri: party.organizer_profile.avatar_url }}
                                style={{ width: 32, height: 32, borderRadius: 16 }}
                            />
                        ) : (
                            <Center className="w-8 h-8 rounded-full bg-[#cbfbf1]">
                                <Text className="text-[#00786f] text-sm font-medium">{organizerInitials}</Text>
                            </Center>
                        )}
                        <Box className="ml-2">
                            <Text className="text-sm text-neutral-600">Hosted by</Text>
                            <Text className="text-sm text-neutral-950 font-medium">{organizerName}</Text>
                        </Box>
                    </HStack>

                    {/* Details with Icons */}
                    <Box className="mt-2 space-y-3">
                        {/* Date & Time */}
                        <HStack className="items-start">
                            <Calendar size={20} color="#6a7282" style={{ marginTop: 2 }} />
                            <Box className="ml-3 flex-1">
                                <Text className="text-sm text-neutral-600">Date & Time</Text>
                                <Text className="text-base text-neutral-950">{party.start_time && formatDate(party.start_time)}</Text>
                                <Text className="text-sm text-neutral-600">
                                    {party.start_time && formatTime(party.start_time)}
                                    {party.end_time && ` - ${formatTime(party.end_time)}`}
                                </Text>
                            </Box>
                        </HStack>

                        {/* Location */}
                        <HStack className="items-start">
                            <MapPin size={20} color="#6a7282" style={{ marginTop: 2 }} />
                            <Box className="ml-3 flex-1">
                                <Text className="text-sm text-neutral-600">Location</Text>
                                {locationName && (
                                    <Text className="text-base text-neutral-950 font-medium">{locationName}</Text>
                                )}
                                <Text className="text-sm text-neutral-700">{locationAddress}</Text>
                            </Box>
                        </HStack>

                        {/* Attendees */}
                        <HStack className="items-start">
                            <Users size={20} color="#6a7282" style={{ marginTop: 2 }} />
                            <Box className="ml-3 flex-1">
                                <Text className="text-sm text-neutral-600">Attendees</Text>
                                <Text className="text-base text-neutral-950">
                                    {party.attendee_count || 0}
                                    {party.max_attendees ? `/${party.max_attendees}` : ''} people going
                                </Text>
                            </Box>
                        </HStack>

                        {/* Party Type */}
                        <HStack className="items-start">
                            <Shirt size={20} color="#6a7282" style={{ marginTop: 2 }} />
                            <Box className="ml-3 flex-1">
                                <Text className="text-sm text-neutral-600">Party Type</Text>
                                <Text className="text-base text-neutral-950 capitalize">{party.party_type}</Text>
                            </Box>
                        </HStack>

                        {/* Entry Fee */}
                        {party.price !== null && party.price !== undefined && (
                            <HStack className="items-start">
                                <DollarSign size={20} color="#6a7282" style={{ marginTop: 2 }} />
                                <Box className="ml-3 flex-1">
                                    <Text className="text-sm text-neutral-600">Entry Fee</Text>
                                    <Text className="text-base text-neutral-950">
                                        {party.price === 0 ? 'Free' : `€${party.price}`}
                                    </Text>
                                </Box>
                            </HStack>
                        )}
                    </Box>
                </Box>

                {/* About Section */}
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-semibold text-neutral-950 mb-2">About</Text>
                    <Text className="text-sm text-neutral-700">{party.description || 'No additional details provided.'}</Text>
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
                    <Text className="text-base font-semibold text-neutral-950 mb-3">
                        Attendees ({registeredAttendees.length + waitlistedAttendees.length})
                    </Text>

                    {/* Confirmed Attendees */}
                    {registeredAttendees.length > 0 && (
                        <Box className="mb-4">
                            <Text className="text-sm font-medium text-neutral-700 mb-2">
                                ✓ Going ({registeredAttendees.length})
                            </Text>
                            <Box className="space-y-2">
                                {registeredAttendees.map((attendee) => (
                                    <HStack key={attendee.id} className="items-center">
                                        {attendee.avatar_url ? (
                                            <Image
                                                source={{ uri: attendee.avatar_url }}
                                                style={{ width: 40, height: 40, borderRadius: 20 }}
                                            />
                                        ) : (
                                            <Center className="w-10 h-10 rounded-full bg-[#cbfbf1]">
                                                <Text className="text-[#00786f] text-base font-medium">
                                                    {getInitials(attendee.full_name)}
                                                </Text>
                                            </Center>
                                        )}
                                        <Text className="text-base text-neutral-950 ml-3">
                                            {attendee.full_name || 'Unknown User'}
                                        </Text>
                                    </HStack>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Pending Approval (Waitlisted) */}
                    {party.isApprovalRequired && waitlistedAttendees.length > 0 && (
                        <Box className="mb-4">
                            <Text className="text-sm font-medium text-neutral-700 mb-2">
                                ⏳ Pending Approval ({waitlistedAttendees.length})
                            </Text>
                            <Box className="space-y-2">
                                {waitlistedAttendees.map((attendee) => (
                                    <HStack key={attendee.id} className="items-center">
                                        {attendee.avatar_url ? (
                                            <Image
                                                source={{ uri: attendee.avatar_url }}
                                                style={{ width: 40, height: 40, borderRadius: 20 }}
                                            />
                                        ) : (
                                            <Center className="w-10 h-10 rounded-full bg-gray-200">
                                                <Text className="text-gray-600 text-base font-medium">
                                                    {getInitials(attendee.full_name)}
                                                </Text>
                                            </Center>
                                        )}
                                        <Text className="text-base text-neutral-700 ml-3">
                                            {attendee.full_name || 'Unknown User'}
                                        </Text>
                                    </HStack>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Empty State */}
                    {registeredAttendees.length === 0 && waitlistedAttendees.length === 0 && (
                        <Text className="text-sm text-neutral-600 mb-4">No attendees yet</Text>
                    )}

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
