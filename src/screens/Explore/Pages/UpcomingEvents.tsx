import React, { useState, useEffect } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';
import { SearchBar, FilterChip } from '@/src/components/global';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchPublicEventsWithDetails, getUserEventRegistration, registerForEvent, cancelEventRegistration } from '@/src/api/event';
import type { EventWithDetails } from '@/src/api/event';
import { spacing } from '@/src/theme/spacing';
import { supabase } from '@/src/lib/supabase';

type EventType = 'All' | 'house party' | 'bar meetup' | 'outdoor event' | 'themed party';

export const UpcomingEvents = () => {
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState<EventType>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState<EventWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [registrationStatus, setRegistrationStatus] = useState<Record<string, 'registered' | 'waitlisted' | null>>({});
    const [processingEvents, setProcessingEvents] = useState<Set<string>>(new Set());
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const filterTypes: EventType[] = ['All', 'house party', 'bar meetup', 'outdoor event', 'themed party'];

    const loadEvents = async () => {
        setLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        const publicEvents = await fetchPublicEventsWithDetails();

        // Filter out events created by current user to avoid showing duplicates
        const filteredEvents = publicEvents.filter(event => event.organiser_id !== user?.id);
        setEvents(filteredEvents);

        // Fetch registration status for all events
        const statusPromises = filteredEvents.map(async (event) => {
            const result = await getUserEventRegistration(event.id);
            return { eventId: event.id, status: result.status };
        });
        const statuses = await Promise.all(statusPromises);
        const statusMap: Record<string, 'registered' | 'waitlisted' | null> = {};
        statuses.forEach(({ eventId, status }) => {
            statusMap[eventId] = status === 'cancelled' ? null : status;
        });
        setRegistrationStatus(statusMap);

        setLoading(false);
    };

    useEffect(() => {
        loadEvents();
    }, []);

    // Refresh events when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadEvents();
        }, [])
    );

    const filteredEvents = events.filter(event =>
        (selectedType === 'All' || event.party_type === selectedType) &&
        (searchQuery === '' || event.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'TBA';
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const formatTime = (dateStr: string | null, endDateStr: string | null) => {
        if (!dateStr) return '';
        const startTime = new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        if (endDateStr) {
            const endTime = new Date(endDateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            return `${startTime} - ${endTime}`;
        }
        return startTime;
    };

    const getLocationString = (event: EventWithDetails) => {
        if (event.location?.name) {
            return event.location.name;
        } else if (event.user_location?.label) {
            return event.user_location.label;
        } else if (event.location?.city) {
            return event.location.city;
        } else if (event.user_location?.city) {
            return event.user_location.city;
        }
        return 'Location TBA';
    };

    const getOrganizerName = (event: EventWithDetails) => {
        return event.organizer_profile?.full_name || 'Unknown Organizer';
    };

    const handleRegistration = async (eventId: string, requiresApproval: boolean) => {
        const currentStatus = registrationStatus[eventId];
        setProcessingEvents(prev => new Set(prev).add(eventId));

        try {
            if (currentStatus === 'registered' || currentStatus === 'waitlisted') {
                await cancelEventRegistration(eventId);
                setRegistrationStatus(prev => ({ ...prev, [eventId]: null }));
                // Update attendee count
                setEvents(prevEvents => prevEvents.map(e =>
                    e.id === eventId && currentStatus === 'registered'
                        ? { ...e, attendee_count: Math.max(0, (e.attendee_count || 0) - 1) }
                        : e
                ));
            } else {
                const success = await registerForEvent(eventId, requiresApproval);
                if (success) {
                    setRegistrationStatus(prev => ({
                        ...prev,
                        [eventId]: requiresApproval ? 'waitlisted' : 'registered'
                    }));
                    // Update attendee count only if registered (not waitlisted)
                    if (!requiresApproval) {
                        setEvents(prevEvents => prevEvents.map(e =>
                            e.id === eventId
                                ? { ...e, attendee_count: (e.attendee_count || 0) + 1 }
                                : e
                        ));
                    }
                }
            }
        } catch (error) {
            // Handle error silently
        } finally {
            setProcessingEvents(prev => {
                const next = new Set(prev);
                next.delete(eventId);
                return next;
            });
        }
    };

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Upcoming Events" showBack onBackPress={() => navigation.goBack()} />

            {/* Search Bar */}
            <Box className="px-4 pt-2 pb-1">
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search events..."
                />
            </Box>

            {/* Filter Categories */}
            <Box className="bg-white border-b border-neutral-200">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-4 py-2"
                    contentContainerStyle={{ flexGrow: 0 }}
                >
                    <Box className="flex-row gap-2">
                        {filterTypes.map((type) => (
                            <FilterChip
                                key={type}
                                label={type}
                                selected={selectedType === type}
                                onPress={() => setSelectedType(type)}
                            />
                        ))}
                    </Box>
                </ScrollView>
            </Box>

            {/* Social Events Header */}
            <Box className="bg-blue-50 border-b border-blue-200 px-4 py-2">
                <Text className="text-xs text-blue-700 font-medium">
                    📍 These are public social events. Manage your own events in the Social tab.
                </Text>
            </Box>

            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {loading ? (
                    <Box className="pt-8 items-center">
                        <ActivityIndicator size="large" color="#00BBA7" />
                        <Text className="text-sm text-gray-500 mt-2">Loading events...</Text>
                    </Box>
                ) : filteredEvents.length === 0 ? (
                    <Box className="pt-8 items-center">
                        <Text className="text-base text-gray-500">No events found</Text>
                    </Box>
                ) : (
                    <Box className="pt-2 space-y-3">
                        {filteredEvents.map((event) => {
                            const priceStr = event.price === null || event.price === 0 ? 'Free' : `€${event.price}`;
                            const dateStr = formatDate(event.start_time);
                            const timeStr = formatTime(event.start_time, event.end_time);
                            const locationStr = getLocationString(event);
                            const currentStatus = registrationStatus[event.id];

                            return (
                                <TouchableOpacity
                                    key={event.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm"
                                    activeOpacity={0.7}
                                    onPress={() => navigation.navigate('PartyDetails' as any, { party: event })}
                                >
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
                                    <Box className="absolute top-3 left-3">
                                        <Box className="px-2 py-1 rounded-full bg-[#00BBA7]">
                                            <Text className="text-white text-xs font-medium capitalize">{event.party_type}</Text>
                                        </Box>
                                    </Box>
                                    {/* Separator line */}
                                    <Box className="h-px bg-gray-200" />
                                    <Box className="p-3 space-y-1.5">
                                        <HStack className="justify-between items-start">
                                            <Text className="text-base font-medium text-neutral-900">{event.name}</Text>
                                            <Text className="text-base font-medium text-neutral-900">
                                                {priceStr}
                                            </Text>
                                        </HStack>
                                        <HStack space="xs" className="items-center">
                                            <Text className="text-sm text-neutral-600">📍</Text>
                                            <Text className="text-sm text-neutral-600">{locationStr}</Text>
                                        </HStack>
                                        <HStack space="xs" className="items-center">
                                            <Text className="text-sm text-neutral-600">📅</Text>
                                            <Text className="text-sm text-neutral-600">{dateStr} · {timeStr}</Text>
                                        </HStack>
                                        <HStack className="justify-between items-center pt-2 border-t border-neutral-100">
                                            <Text className="text-xs text-neutral-600">
                                                {event.attendee_count || 0}{event.max_attendees ? ` / ${event.max_attendees}` : ''} attending
                                            </Text>
                                            <TouchableOpacity
                                                className="px-3 py-1.5 rounded-lg"
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleRegistration(event.id, event.isApprovalRequired);
                                                }}
                                                disabled={processingEvents.has(event.id)}
                                                style={{
                                                    backgroundColor: (currentStatus === 'registered' || currentStatus === 'waitlisted') ? '#00a294' : '#ffffff',
                                                    borderWidth: (currentStatus === 'registered' || currentStatus === 'waitlisted') ? 0 : 1,
                                                    borderColor: '#00a294',
                                                    opacity: processingEvents.has(event.id) ? 0.5 : 1
                                                }}
                                            >
                                                <Text
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: (currentStatus === 'registered' || currentStatus === 'waitlisted') ? '#ffffff' : '#00a294'
                                                    }}
                                                >
                                                    {processingEvents.has(event.id) ? 'Processing...' :
                                                        currentStatus === 'registered' ? '✓ Going' :
                                                            currentStatus === 'waitlisted' ? 'Request Sent' :
                                                                event.isApprovalRequired ? 'Request to Join' : "I'm Going"}
                                                </Text>
                                            </TouchableOpacity>
                                        </HStack>
                                    </Box>
                                </TouchableOpacity>
                            );
                        })}
                    </Box>
                )}
            </ScrollView>
        </Box>
    );
};