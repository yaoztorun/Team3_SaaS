import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Button } from '@/src/components/ui/button';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { SocialStackParamList } from './SocialStack';
import { fetchAllVisibleEvents, registerForEvent, cancelEventRegistration, getUserEventRegistration, type EventWithDetails } from '@/src/api/event';

export const PartiesView = () => {
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const [registrationStatus, setRegistrationStatus] = useState<Record<string, 'registered' | 'cancelled' | 'waitlisted' | null>>({});
    const [processingEvents, setProcessingEvents] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [myEvents, setMyEvents] = useState<EventWithDetails[]>([]);
    const [friendsEvents, setFriendsEvents] = useState<EventWithDetails[]>([]);
    const [publicEvents, setPublicEvents] = useState<EventWithDetails[]>([]);

    // Load events on mount
    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        const { myEvents, friendsEvents, publicEvents } = await fetchAllVisibleEvents();
        console.log('=== LOADED EVENTS ===');
        console.log('My Events:', myEvents.map(e => ({ id: e.id, name: e.name, isApprovalRequired: e.isApprovalRequired })));
        console.log('Friends Events:', friendsEvents.map(e => ({ id: e.id, name: e.name, isApprovalRequired: e.isApprovalRequired })));
        console.log('Public Events:', publicEvents.map(e => ({ id: e.id, name: e.name, isApprovalRequired: e.isApprovalRequired })));

        setMyEvents(myEvents);
        setFriendsEvents(friendsEvents);
        setPublicEvents(publicEvents);

        // Fetch registration status for all events (excluding user's own events)
        const allOtherEvents = [...friendsEvents, ...publicEvents];
        console.log('=== FETCHING REGISTRATION STATUS ===');
        console.log('Total events to check:', allOtherEvents.length);

        const statusPromises = allOtherEvents.map(async (event) => {
            const result = await getUserEventRegistration(event.id);
            console.log(`getUserEventRegistration result for "${event.name}":`, JSON.stringify(result));
            console.log(`Event "${event.name}" (${event.id}): status = ${result.status}`);
            return { eventId: event.id, status: result.status };
        });
        const statuses = await Promise.all(statusPromises);
        const statusMap: Record<string, 'registered' | 'cancelled' | 'waitlisted' | null> = {};
        statuses.forEach(({ eventId, status }) => {
            statusMap[eventId] = status;
        });
        console.log('=== FINAL STATUS MAP ===');
        console.log('Final statusMap:', JSON.stringify(statusMap, null, 2));
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
        console.log(`=== RENDERING CARD ===`);
        console.log(`Event: "${event.name}" (${event.id})`);
        console.log(`  - isMyEvent: ${isMyEvent}`);
        console.log(`  - isApprovalRequired: ${event.isApprovalRequired}`);
        console.log(`  - registrationStatus[${event.id}]: ${currentStatus}`);
        console.log(`  - Will show button: ${isMyEvent ? 'Manage Event' :
            processingEvents.has(event.id) ? 'Processing...' :
                currentStatus === 'registered' ? '✓ Going - Cancel' :
                    currentStatus === 'waitlisted' ? '⏳ Request Sent - Cancel' :
                        event.isApprovalRequired ? 'Request to Join' : "I'm Going"
            }`);

        return (
            <Pressable
                key={event.id}
                onPress={() => navigation.navigate('PartyDetails', { party: event as any })}
                className="bg-white rounded-xl mb-3 border border-gray-200 overflow-hidden"
            >
                {/* Header Section */}
                <Box className="p-4">
                    <HStack className="justify-between items-start mb-3">
                        <Box className="flex-1 pr-2">
                            <Text className="text-lg font-semibold text-gray-900 mb-1">{event.name}</Text>
                            <Text className="text-sm text-gray-500">Organized by {organizerName}</Text>
                        </Box>
                        {event.price && event.price > 0 && (
                            <Box className="bg-[#00a294] rounded-full w-12 h-12 items-center justify-center">
                                <Text className="text-white text-xs font-semibold">€{event.price}</Text>
                            </Box>
                        )}
                    </HStack>

                    {/* Info Section */}
                    {/* Date & Time Row */}
                    <HStack className="mb-2 items-center">
                        <Box className="w-7 h-7 rounded bg-gray-100 items-center justify-center mr-2">
                            <Text className="text-sm">📅</Text>
                        </Box>
                        <Box>
                            <Text className="text-sm text-gray-900">
                                {event.start_time ? formatDate(event.start_time) : 'Date TBA'}
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {event.start_time && formatTime(event.start_time)}
                                {event.end_time && ` - ${formatTime(event.end_time)}`}
                            </Text>
                        </Box>
                    </HStack>

                    {/* Location Row */}
                    <HStack className="mb-2 items-center">
                        <Box className="w-7 h-7 rounded bg-gray-100 items-center justify-center mr-2">
                            <Text className="text-sm">📍</Text>
                        </Box>
                        <Box className="flex-1">
                            {event.location?.name && (
                                <Text className="text-sm text-gray-900">{event.location.name}</Text>
                            )}
                            <Text className={`text-${event.location?.name ? 'xs' : 'sm'} text-gray-${event.location?.name ? '500' : '900'}`}>
                                {locationAddress}
                            </Text>
                        </Box>
                    </HStack>

                    {/* Attendees Row */}
                    <HStack className="items-center mb-3">
                        <Box className="w-7 h-7 rounded bg-gray-100 items-center justify-center mr-2">
                            <Text className="text-sm">👥</Text>
                        </Box>
                        <Box>
                            <Text className="text-sm text-gray-900">
                                {event.attendee_count || 0}
                                {event.max_attendees ? `/${event.max_attendees}` : ''} attending
                            </Text>
                            {event.max_attendees && event.max_attendees > (event.attendee_count || 0) && (
                                <Text className="text-xs text-gray-500">
                                    {event.max_attendees - (event.attendee_count || 0)} spots left
                                </Text>
                            )}
                        </Box>
                    </HStack>

                    {/* Action Button */}
                    {isMyEvent ? (
                        <Button
                            variant="outline"
                            className="border-gray-300 w-full"
                            onPress={() => navigation.navigate('PartyDetails', { party: event as any })}
                        >
                            <Text className="text-gray-600 font-medium">Manage Event</Text>
                        </Button>
                    ) : (
                        <Button
                            variant={(registrationStatus[event.id] === 'registered' || registrationStatus[event.id] === 'waitlisted') ? "solid" : "outline"}
                            className={(registrationStatus[event.id] === 'registered' || registrationStatus[event.id] === 'waitlisted')
                                ? "bg-[#00a294] w-full"
                                : "border-[#00a294] w-full"}
                            onPress={() => handleRegistration(event.id, event.isApprovalRequired)}
                            disabled={processingEvents.has(event.id)}
                        >
                            {processingEvents.has(event.id) ? (
                                <Text className={(registrationStatus[event.id] === 'registered' || registrationStatus[event.id] === 'waitlisted') ? "text-white font-medium" : "text-[#00a294] font-medium"}>
                                    Processing...
                                </Text>
                            ) : registrationStatus[event.id] === 'registered' ? (
                                <Text className="text-white font-medium">✓ Going - Cancel</Text>
                            ) : registrationStatus[event.id] === 'waitlisted' ? (
                                <Text className="text-white font-medium">Request Sent - Cancel</Text>
                            ) : event.isApprovalRequired ? (
                                <Text className="text-[#00a294] font-medium">Request to Join</Text>
                            ) : (
                                <Text className="text-[#00a294] font-medium">I'm Going</Text>
                            )}
                        </Button>
                    )}
                </Box>
            </Pressable>
        );
    };

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
                                <Text className="text-sm font-semibold text-gray-700 mb-3">
                                    My Parties ({myEvents.length})
                                </Text>
                                {myEvents.map(event => renderPartyCard(event, true))}
                            </Box>
                        )}

                        {/* Friends Events Section */}
                        {friendsEvents.length > 0 && (
                            <Box className="mb-6">
                                <Text className="text-sm font-semibold text-gray-700 mb-3">
                                    Friends' Parties ({friendsEvents.length})
                                </Text>
                                {friendsEvents.map(event => renderPartyCard(event, false))}
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
                                <Text className="text-lg font-medium text-gray-900 mb-2">No parties yet</Text>
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
