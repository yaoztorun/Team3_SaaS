import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, TouchableOpacity, Image, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Button } from '@/src/components/ui/button';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { ChevronDown, User } from 'lucide-react-native';
import { SocialStackParamList } from './SocialStack';
import { fetchAllVisibleEvents, registerForEvent, cancelEventRegistration, getUserEventRegistration, type EventWithDetails } from '@/src/api/event';
import { Heading } from '@/src/components/global';

export const PartiesView = () => {
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const [registrationStatus, setRegistrationStatus] = useState<Record<string, 'registered' | 'cancelled' | 'waitlisted' | null>>({});
    const [processingEvents, setProcessingEvents] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [myEvents, setMyEvents] = useState<EventWithDetails[]>([]);
    const [friendsEvents, setFriendsEvents] = useState<EventWithDetails[]>([]);
    const [publicEvents, setPublicEvents] = useState<EventWithDetails[]>([]);
    const [myEventsCollapsed, setMyEventsCollapsed] = useState(false);
    const [friendsEventsCollapsed, setFriendsEventsCollapsed] = useState(false);

    // Load events on mount
    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        const { myEvents, friendsEvents, publicEvents } = await fetchAllVisibleEvents();
        // console.log('=== LOADED EVENTS ===');
        // console.log('My Events:', myEvents.map(e => ({ id: e.id, name: e.name, isApprovalRequired: e.isApprovalRequired })));
        // console.log('Friends Events:', friendsEvents.map(e => ({ id: e.id, name: e.name, isApprovalRequired: e.isApprovalRequired })));
        // console.log('Public Events:', publicEvents.map(e => ({ id: e.id, name: e.name, isApprovalRequired: e.isApprovalRequired })));

        setMyEvents(myEvents);
        setFriendsEvents(friendsEvents);
        setPublicEvents(publicEvents);

        // Fetch registration status for all events (excluding user's own events)
        const allOtherEvents = [...friendsEvents, ...publicEvents];
        // console.log('=== FETCHING REGISTRATION STATUS ===');
        // console.log('Total events to check:', allOtherEvents.length);

        const statusPromises = allOtherEvents.map(async (event) => {
            const result = await getUserEventRegistration(event.id);
            // console.log(`getUserEventRegistration result for "${event.name}":`, JSON.stringify(result));
            // console.log(`Event "${event.name}" (${event.id}): status = ${result.status}`);
            return { eventId: event.id, status: result.status };
        });
        const statuses = await Promise.all(statusPromises);
        const statusMap: Record<string, 'registered' | 'cancelled' | 'waitlisted' | null> = {};
        statuses.forEach(({ eventId, status }) => {
            statusMap[eventId] = status;
        });
        // console.log('=== FINAL STATUS MAP ===');
        // console.log('Final statusMap:', JSON.stringify(statusMap, null, 2));
        setRegistrationStatus(statusMap);

        setLoading(false);
    };

    // Handle event registration
    const handleRegistration = async (eventId: string, requiresApproval: boolean) => {
        const currentStatus = registrationStatus[eventId];

        // Mark as processing
        setProcessingEvents(prev => new Set(prev).add(eventId));

        if (currentStatus === 'registered' || currentStatus === 'waitlisted') {
            // Cancel registration
            const success = await cancelEventRegistration(eventId);
            if (success) {
                setRegistrationStatus(prev => ({ ...prev, [eventId]: null }));
            }
        } else {
            // Register for event
            const success = await registerForEvent(eventId, requiresApproval);
            if (success) {
                const newStatus = requiresApproval ? 'waitlisted' : 'registered';
                setRegistrationStatus(prev => ({ ...prev, [eventId]: newStatus }));
            }
        }

        // Remove from processing
        setProcessingEvents(prev => {
            const next = new Set(prev);
            next.delete(eventId);
            return next;
        });
    };

    // Format date helper
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Format time helper (extract time from ISO string)
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Render a single party card
    const renderPartyCard = (event: EventWithDetails, isMyEvent: boolean = false) => {
        // Construct location address from Location table (public venues)
        const publicLocationAddress = event.location && event.location.street_name && event.location.city
            ? `${event.location.street_name} ${event.location.street_nr || ''}, ${event.location.city}`.trim()
            : null;

        // Construct user location address from UserLocations table (personal addresses)
        const userLocationAddress = event.user_location && event.user_location.street && event.user_location.city
            ? `${event.user_location.street} ${event.user_location.house_nr || ''}, ${event.user_location.city}`.trim()
            : null;

        const locationAddress = publicLocationAddress || userLocationAddress || 'Location TBA';
        const organizerName = event.organizer_profile?.full_name || 'Unknown';

        const currentStatus = registrationStatus[event.id];
        // console.log(`=== RENDERING CARD ===`);
        // console.log(`Event: "${event.name}" (${event.id})`);
        // console.log(`  - isMyEvent: ${isMyEvent}`);
        // console.log(`  - isApprovalRequired: ${event.isApprovalRequired}`);
        // console.log(`  - registrationStatus[${event.id}]: ${currentStatus}`);
        // console.log(`  - Will show button: ${isMyEvent ? 'Manage Event' :
        //     processingEvents.has(event.id) ? 'Processing...' :
        //         currentStatus === 'registered' ? '✓ Going - Cancel' :
        //             currentStatus === 'waitlisted' ? '⏳ Request Sent - Cancel' :
        //                 event.isApprovalRequired ? 'Request to Join' : "I'm Going"
        //     }`);

        return (
            <TouchableOpacity
                key={event.id}
                onPress={() => navigation.navigate('PartyDetails', { party: event as any })}
                className="bg-white rounded-xl mb-3 border-[3px] border-gray-200 overflow-hidden"
                activeOpacity={0.7}
            >
                {/* Cover Image or Placeholder */}
                {event.cover_image ? (
                    <Image
                        source={{ uri: event.cover_image }}
                        className="w-full h-40"
                        resizeMode="cover"
                    />
                ) : (
                    <Box className="w-full h-40 bg-gray-200 items-center justify-center">
                        <Text className="text-6xl">🎉</Text>
                    </Box>
                )}

                {/* Party Type Badge */}
                <Box className="absolute top-3 left-3">
                    <Box className="px-3 py-1 rounded-full bg-[#00a294]">
                        <Text className="text-white text-xs font-medium">
                            {event.party_type?.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Party'}
                        </Text>
                    </Box>
                </Box>

                {/* Party Info */}
                <Box className="p-3">
                    {/* Title and Price on same line */}
                    <HStack className="justify-between items-center mb-2">
                        <Text className="text-base font-medium text-neutral-900 flex-1 mr-2">{event.name}</Text>
                        {event.price !== null && event.price !== undefined && (
                            <Text className="text-base font-semibold text-neutral-900">
                                {event.price === 0 ? 'Free' : `€${event.price}`}
                            </Text>
                        )}
                    </HStack>

                    {/* Organizer */}
                    <HStack className="items-center mb-2">
                        <User size={16} color="#6b7280" />
                        <Text className="text-sm text-neutral-600 ml-2">Organized by {organizerName}</Text>
                    </HStack>

                    {/* Date & Time */}
                    <HStack className="items-center mb-2">
                        <Text className="text-sm text-neutral-600">📅</Text>
                        <Text className="text-sm text-neutral-600 ml-2">
                            {event.start_time ? formatDate(event.start_time) : 'Date TBA'} · {event.start_time && formatTime(event.start_time)}
                        </Text>
                    </HStack>

                    {/* Attendees and Button */}
                    <HStack className="justify-between items-center pt-2 border-t border-neutral-100">
                        <Text className="text-xs text-neutral-600">
                            {event.attendee_count || 0}{event.max_attendees ? `/${event.max_attendees}` : ''} attending
                        </Text>
                        {isMyEvent ? (
                            <TouchableOpacity
                                className="px-3 py-1.5 rounded-lg bg-[#00a294]"
                                onPress={(e) => {
                                    e.stopPropagation();
                                    navigation.navigate('PartyDetails', { party: event as any });
                                }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-sm font-medium">Manage</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                className={`px-3 py-1.5 rounded-lg border-2 ${
                                    registrationStatus[event.id] === 'registered' || registrationStatus[event.id] === 'waitlisted'
                                        ? 'bg-[#00a294] border-[#00a294]'
                                        : 'bg-white border-[#00a294]'
                                }`}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleRegistration(event.id, event.isApprovalRequired);
                                }}
                                disabled={processingEvents.has(event.id)}
                                activeOpacity={0.8}
                            >
                                <Text className={`text-sm font-medium ${
                                    registrationStatus[event.id] === 'registered' || registrationStatus[event.id] === 'waitlisted'
                                        ? 'text-white'
                                        : 'text-[#00a294]'
                                }`}>
                                    {processingEvents.has(event.id)
                                        ? 'Processing...'
                                        : registrationStatus[event.id] === 'registered'
                                        ? 'Going'
                                        : registrationStatus[event.id] === 'waitlisted'
                                        ? 'Requested'
                                        : event.isApprovalRequired
                                        ? 'Request'
                                        : 'Join'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </HStack>
                </Box>
            </TouchableOpacity>
        );
    };

    return (
        <>
            {/* Create Party Button */}
            <TouchableOpacity
                className="bg-[#00a294] mb-4 py-3 rounded-lg"
                onPress={() => navigation.navigate('CreateParty')}
                activeOpacity={0.8}
            >
                <Text className="text-white text-center font-medium">+ Create New Party</Text>
            </TouchableOpacity>

            {/* Parties List */}
            <Box>
                {loading ? (
                    <Box className="py-8 items-center">
                        <ActivityIndicator size="large" color="#00a294" />
                        <Text className="text-sm text-gray-500 mt-2">Loading parties...</Text>
                    </Box>
                ) : (
                    <>
                        {/* My Events Section */}
                        {myEvents.length > 0 && (
                            <Box className="mb-6">
                                <TouchableOpacity
                                    onPress={() => setMyEventsCollapsed(!myEventsCollapsed)}
                                    className="flex-row items-center justify-between mb-3"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-sm font-semibold text-gray-700">
                                        My Parties ({myEvents.length})
                                    </Text>
                                    <ChevronDown
                                        size={20}
                                        color="#374151"
                                        style={{
                                            transform: [{ rotate: myEventsCollapsed ? '-90deg' : '0deg' }],
                                        }}
                                    />
                                </TouchableOpacity>
                                {!myEventsCollapsed && myEvents.map(event => renderPartyCard(event, true))}
                            </Box>
                        )}

                        {/* Friends Events Section */}
                        {friendsEvents.length > 0 && (
                            <Box className="mb-6">
                                <TouchableOpacity
                                    onPress={() => setFriendsEventsCollapsed(!friendsEventsCollapsed)}
                                    className="flex-row items-center justify-between mb-3"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-sm font-semibold text-gray-700">
                                        Friends' Parties ({friendsEvents.length})
                                    </Text>
                                    <ChevronDown
                                        size={20}
                                        color="#374151"
                                        style={{
                                            transform: [{ rotate: friendsEventsCollapsed ? '-90deg' : '0deg' }],
                                        }}
                                    />
                                </TouchableOpacity>
                                {!friendsEventsCollapsed && friendsEvents.map(event => renderPartyCard(event, false))}
                            </Box>
                        )}

                        {/* Public Events Section */}
                        {publicEvents.length > 0 && (
                            <Box className="mb-6">
                                <Text className="text-sm font-semibold text-gray-700 mb-3">
                                    Public Parties ({publicEvents.length})
                                </Text>
                                {publicEvents.map(event => renderPartyCard(event, false))}
                            </Box>
                        )}

                        {/* Empty State */}
                        {myEvents.length === 0 && friendsEvents.length === 0 && publicEvents.length === 0 && (
                            <Box className="py-12 items-center">
                                <Text className="text-6xl mb-4">🎉</Text>
                                <Heading level="h3" className="mb-2">No parties yet</Heading>
                                <Text className="text-sm text-gray-500 text-center px-8">
                                    Create your first party or wait for your friends to organize one!
                                </Text>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </>
    );
};
