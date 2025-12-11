import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Center } from '@/src/components/ui/center';
import { Button } from '@/src/components/ui/button';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SocialStackParamList } from './SocialStack';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { colors } from '@/src/theme/colors';
import { Pressable } from '@/src/components/ui/pressable';
import { PrimaryButton, Heading, Avatar, FriendSelectorModal } from '@/src/components/global';
import { Calendar, MapPin, Users, Shirt, DollarSign, Edit, UserPlus } from 'lucide-react-native';
import type { EventWithDetails } from '@/src/api/event';
import { fetchEventAttendees, updateRegistrationStatus, getUserEventRegistration, registerForEvent, cancelEventRegistration, inviteFriendsToParty, fetchEventById } from '@/src/api/event';
import { supabase } from '@/src/lib/supabase';

export const PartyDetails: React.FC = () => {
    const route = useRoute<RouteProp<SocialStackParamList, 'PartyDetails'>>();
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const initialParty = route.params?.party;
    const partyId = route.params?.partyId;
    const [party, setParty] = useState<EventWithDetails | null>(initialParty || null);
    const [isLoadingParty, setIsLoadingParty] = useState(!initialParty && !!partyId);
    const [registeredAttendees, setRegisteredAttendees] = useState<Array<{ id: string; full_name: string | null; avatar_url: string | null }>>([]);
    const [waitlistedAttendees, setWaitlistedAttendees] = useState<Array<{ id: string; full_name: string | null; avatar_url: string | null }>>([]);
    const [invitedAttendees, setInvitedAttendees] = useState<Array<{ id: string; full_name: string | null; avatar_url: string | null }>>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
    const [userRegistrationStatus, setUserRegistrationStatus] = useState<'registered' | 'waitlisted' | 'invited' | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null);
    const [inviteWarningMessage, setInviteWarningMessage] = useState<string | null>(null);

    // Fetch party by ID if only partyId is provided
    useEffect(() => {
        const loadParty = async () => {
            if (partyId && !initialParty) {
                setIsLoadingParty(true);
                const fetchedParty = await fetchEventById(partyId);
                if (fetchedParty) {
                    setParty(fetchedParty);
                } else {
                    console.error('Failed to fetch party');
                    navigation.goBack();
                }
                setIsLoadingParty(false);
            }
        };
        loadParty();
    }, [partyId, initialParty]);

    // Fetch party details from database
    const fetchPartyDetails = async () => {
        if (!party?.id) return;

        try {
            const { data, error } = await supabase
                .from('Event')
                .select(`
                    *,
                    organizer_profile:Profile!Event_organiser_id_fkey(id, full_name, email, avatar_url),
                    location:Location(id, name, street_name, street_nr, city),
                    user_location:UserLocations(id, label, street, house_nr, city)
                `)
                .eq('id', party.id)
                .single();

            if (error) {
                console.error('Error fetching party details:', error);
                return;
            }

            if (data) {
                // Fetch attendee count
                const { data: registrations } = await supabase
                    .from('EventRegistration')
                    .select('event_id, status')
                    .eq('event_id', data.id)
                    .eq('status', 'registered');

                const attendee_count = registrations?.length || 0;

                setParty({
                    ...data,
                    attendee_count,
                } as EventWithDetails);
            }
        } catch (error) {
            console.error('Error fetching party details:', error);
        }
    };

    // Fetch current user and attendees on mount and when screen focuses
    useFocusEffect(
        React.useCallback(() => {
            const loadUserAndAttendees = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                }
                if (party?.id) {
                    await fetchPartyDetails();
                    await loadAttendees();
                    await loadUserRegistrationStatus();
                }
            };
            loadUserAndAttendees();
        }, [party?.id])
    );

    const loadAttendees = async () => {
        if (!party?.id) return;
        const { registered, waitlisted, invited } = await fetchEventAttendees(party.id);
        setRegisteredAttendees(registered);
        setWaitlistedAttendees(waitlisted);
        setInvitedAttendees(invited);
    };

    const loadUserRegistrationStatus = async () => {
        if (!party?.id) return;
        const { status } = await getUserEventRegistration(party.id);
        // Treat cancelled as null
        setUserRegistrationStatus(status === 'cancelled' ? null : status);
    };

    // Check if current user is the host
    const isHost = currentUserId && party?.organiser_id === currentUserId;

    // Check if max attendees is reached
    const isMaxAttendeesReached = party?.max_attendees ? registeredAttendees.length >= party.max_attendees : false;

    // Handle user registration toggle
    const handleRegistrationToggle = async () => {
        if (!party) return;
        setIsRegistering(true);
        try {
            if (userRegistrationStatus === 'registered' || userRegistrationStatus === 'waitlisted' || userRegistrationStatus === 'invited') {
                // Cancel registration
                await cancelEventRegistration(party.id);
                setUserRegistrationStatus(null);
            } else {
                // Register for event
                const success = await registerForEvent(party.id, party.isApprovalRequired);
                if (success) {
                    setUserRegistrationStatus(party.isApprovalRequired ? 'waitlisted' : 'registered');
                }
            }
            // Reload attendees to reflect changes
            await loadAttendees();
        } catch (error) {
            // console.error('Failed to toggle registration:', error);
        } finally {
            setIsRegistering(false);
        }
    };

    // Handle approval/rejection of waitlisted users
    const handleApproval = async (userId: string, approve: boolean) => {
        if (!party?.id) return;
        setProcessingRequests(prev => new Set(prev).add(userId));
        try {
            const newStatus = approve ? 'registered' : 'cancelled';
            await updateRegistrationStatus(party.id, userId, newStatus);
            // Reload attendees to reflect changes
            await loadAttendees();
        } catch (error) {
            // console.error('Failed to update registration status:', error);
        } finally {
            setProcessingRequests(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    // Handle inviting friends to party
    const handleInviteFriends = async (friendIds: string[]) => {
        if (friendIds.length === 0) return;
        
        setIsInviting(true);
        const result = await inviteFriendsToParty(party!.id, friendIds);
        
        if (result.success) {
            const invitedCount = friendIds.length - (result.alreadyInvited?.length || 0);
            const skippedCount = result.alreadyInvited?.length || 0;
            
            let message = `Successfully invited ${invitedCount} friend${invitedCount !== 1 ? 's' : ''}!`;
            if (skippedCount > 0) {
                message += ` (${skippedCount} already invited/registered)`;
            }
            setInviteSuccessMessage(message);
            setShowInviteModal(false);
            await loadAttendees(); // Refresh to show newly invited users
            
            // Clear message after 3 seconds
            setTimeout(() => setInviteSuccessMessage(null), 3000);
        } else {
            // Show warning for already invited/registered friends
            if (result.alreadyInvited && result.alreadyInvited.length > 0) {
                const count = result.alreadyInvited.length;
                setInviteWarningMessage(
                    count === 1 
                        ? 'This friend has already been invited or registered for this party'
                        : `All ${count} selected friends have already been invited or registered`
                );
                setTimeout(() => setInviteWarningMessage(null), 4000);
            } else {
                setInviteWarningMessage(result.error || 'Failed to send invites');
                setTimeout(() => setInviteWarningMessage(null), 3000);
            }
            setShowInviteModal(false);
        }
        setIsInviting(false);
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

    if (isLoadingParty) {
        return (
            <Box className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-600">Loading party details...</Text>
            </Box>
        );
    }

    if (!party) {
        return (
            <Box className="flex-1 items-center justify-center bg-neutral-50">
                <Text>No party selected</Text>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-gray-50">
            <TopBar title="Party Details" showBack onBackPress={() => navigation.goBack()} />
            
            {/* Success Message Banner */}
            {inviteSuccessMessage && (
                <Box className="bg-green-500 px-4 py-3">
                    <Text className="text-white text-center font-medium">{inviteSuccessMessage}</Text>
                </Box>
            )}
            
            {/* Warning Message Banner */}
            {inviteWarningMessage && (
                <Box className="bg-orange-500 px-4 py-3">
                    <Text className="text-white text-center font-medium">{inviteWarningMessage}</Text>
                </Box>
            )}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    contentContainerStyle={{
                        paddingHorizontal: spacing.screenHorizontal,
                        paddingTop: spacing.screenVertical,
                        paddingBottom: spacing.screenBottom,
                    }}
                >
                    {/* Header banner with cover image or emoji */}
                    <Box className="w-full rounded-2xl overflow-hidden mb-4 relative border-[3px] border-gray-200" style={{ height: 256 }}>
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
                        {/* Action Buttons - Positioned on Cover Image */}
                        <HStack className="absolute left-4 bottom-4 gap-2">
                            {/* Edit button - only for host */}
                            {isHost && (
                                <Pressable
                                    onPress={() => navigation.navigate('EditParty', { party })}
                                    className="bg-[#00a294] rounded-lg px-4 py-2 flex-row items-center shadow-lg"
                                >
                                    <Edit size={18} color="#fff" />
                                    <Text className="text-white text-sm font-semibold ml-2">Edit</Text>
                                </Pressable>
                            )}
                            {/* Invite button - host can always invite, registered users can invite to public events, invited users cannot */}
                            {(isHost || (party.isPublic && userRegistrationStatus === 'registered')) && (
                                <Pressable
                                    onPress={() => setShowInviteModal(true)}
                                    className="bg-white rounded-lg px-4 py-2 flex-row items-center shadow-lg"
                                >
                                    <UserPlus size={18} color="#00a294" />
                                    <Text className="text-[#00a294] text-sm font-semibold ml-2">Invite</Text>
                                </Pressable>
                            )}
                        </HStack>
                    </Box>

                    {/* Party Info Card */}
                    <Box className="bg-white rounded-2xl p-4 mb-4">
                        {/* Title and Price on same line */}
                        <HStack className="justify-between items-center mb-2">
                            <Heading level="h5" className="flex-1 mr-2">{party.name}</Heading>
                            {party.price !== null && party.price !== undefined && (
                                <Text className="text-lg font-semibold text-neutral-900">
                                    {party.price === 0 ? 'Free' : `€${party.price}`}
                                </Text>
                            )}
                        </HStack>

                        {/* Host Info */}
                        <Pressable 
                            onPress={() => {
                                if (party.organiser_id) {
                                    navigation.navigate('UserProfile', { userId: party.organiser_id });
                                }
                            }}
                        >
                            <HStack className="items-center mb-4">
                                <Avatar
                                    avatarUrl={party.organizer_profile?.avatar_url}
                                    initials={organizerInitials}
                                    size={32}
                                    fallbackColor="#cbfbf1"
                                />
                                <Box className="ml-2">
                                    <Text className="text-sm text-neutral-600">Hosted by</Text>
                                    <Text className="text-sm text-neutral-950 font-medium underline">{organizerName}</Text>
                                </Box>
                            </HStack>
                        </Pressable>

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
                                        {registeredAttendees.length}
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
                        </Box>
                    </Box>

                    {/* About Section */}
                    <Box className="bg-white rounded-2xl p-4 mb-4">
                        <Heading level="h5" className="mb-2">About</Heading>
                        <Text className="text-sm text-neutral-700">{party.description || 'No additional details provided.'}</Text>
                    </Box>

                    {/* Going List */}
                    <Box className="bg-white rounded-2xl p-4 mb-8">
                        <Text className="text-base font-semibold text-neutral-950 mb-4">
                            Attendees ({registeredAttendees.length + waitlistedAttendees.length})
                        </Text>

                        {/* Confirmed Attendees */}
                        {registeredAttendees.length > 0 && (
                            <Box className="mb-4">
                                <Text className="text-sm font-medium text-neutral-700 mb-3">
                                    ✓ Going ({registeredAttendees.length})
                                </Text>
                                <Box className="space-y-3">
                                    {registeredAttendees.map((attendee) => (
                                        <Pressable
                                            key={attendee.id}
                                            onPress={() => navigation.navigate('UserProfile', { userId: attendee.id })}
                                        >
                                            <HStack className="items-center">
                                                <Avatar
                                                    avatarUrl={attendee.avatar_url}
                                                    initials={getInitials(attendee.full_name)}
                                                    size={40}
                                                    fallbackColor="#cbfbf1"
                                                />
                                                <Text className="text-base text-neutral-950 ml-3 underline">
                                                    {attendee.full_name || 'Unknown User'}
                                                </Text>
                                            </HStack>
                                        </Pressable>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Pending Approval (Waitlisted) */}
                        {party.isApprovalRequired && waitlistedAttendees.length > 0 && (
                            <Box className="mb-4">
                                <Text className="text-sm font-medium text-neutral-700 mb-3">
                                    ⏳ Pending Approval ({waitlistedAttendees.length})
                                </Text>
                                <Box className="space-y-3">
                                    {waitlistedAttendees.map((attendee) => (
                                        <Box key={attendee.id} className="bg-gray-50 rounded-xl p-3">
                                            <Box className="space-y-3">
                                                <Pressable
                                                    onPress={() => navigation.navigate('UserProfile', { userId: attendee.id })}
                                                >
                                                    <HStack className="items-center">
                                                        <Avatar
                                                            avatarUrl={attendee.avatar_url}
                                                            initials={getInitials(attendee.full_name)}
                                                            size={40}
                                                            fallbackColor="#d1d5db"
                                                        />
                                                        <Text className="text-base text-neutral-950 ml-3 flex-1 underline">
                                                            {attendee.full_name || 'Unknown User'}
                                                        </Text>
                                                    </HStack>
                                                </Pressable>
                                                {isHost && (
                                                    <Box className="gap-2">
                                                        <Pressable
                                                            className="rounded-lg px-4 py-2 w-full"
                                                            onPress={() => handleApproval(attendee.id, true)}
                                                            disabled={processingRequests.has(attendee.id) || isMaxAttendeesReached}
                                                            style={{
                                                                backgroundColor: '#00a294',
                                                                opacity: (processingRequests.has(attendee.id) || isMaxAttendeesReached) ? 0.5 : 1
                                                            }}
                                                        >
                                                            <Text className="text-sm font-semibold text-center" style={{ color: '#ffffff' }}>
                                                                {isMaxAttendeesReached ? 'Full' : 'Accept'}
                                                            </Text>
                                                        </Pressable>
                                                        <Pressable
                                                            className="rounded-lg px-4 py-2 w-full"
                                                            onPress={() => handleApproval(attendee.id, false)}
                                                            disabled={processingRequests.has(attendee.id)}
                                                            style={{
                                                                backgroundColor: '#ffffff',
                                                                borderWidth: 1,
                                                                borderColor: '#d1d5db',
                                                                opacity: processingRequests.has(attendee.id) ? 0.5 : 1
                                                            }}
                                                        >
                                                            <Text className="text-sm font-semibold text-center" style={{ color: '#000000' }}>Decline</Text>
                                                        </Pressable>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Empty State */}
                        {registeredAttendees.length === 0 && waitlistedAttendees.length === 0 && (
                            <Text className="text-sm text-neutral-600 mb-4">No attendees yet</Text>
                        )}

                        {/* Registration Button - Only for non-hosts */}
                        {!isHost && userRegistrationStatus === 'invited' && (
                            <Box>
                                <Text className="text-sm text-neutral-600 mb-2">You've been invited to this party</Text>
                                <HStack className="gap-2">
                                    <Button
                                        variant="solid"
                                        className="bg-[#00a294] flex-1"
                                        onPress={async () => {
                                            setIsRegistering(true);
                                            const success = await registerForEvent(party.id, false);
                                            if (success) {
                                                setUserRegistrationStatus('registered');
                                                await loadAttendees();
                                            }
                                            setIsRegistering(false);
                                        }}
                                        disabled={isRegistering}
                                    >
                                        <Text className="text-white font-medium">✓ Accept</Text>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-red-500 flex-1"
                                        onPress={async () => {
                                            setIsRegistering(true);
                                            await cancelEventRegistration(party.id);
                                            setUserRegistrationStatus(null);
                                            await loadAttendees();
                                            setIsRegistering(false);
                                        }}
                                        disabled={isRegistering}
                                    >
                                        <Text className="text-red-500 font-medium">✕ Decline</Text>
                                    </Button>
                                </HStack>
                            </Box>
                        )}
                        {!isHost && userRegistrationStatus !== 'invited' && (
                            <Button
                                variant={(userRegistrationStatus === 'registered' || userRegistrationStatus === 'waitlisted') ? "solid" : "outline"}
                                className={(userRegistrationStatus === 'registered' || userRegistrationStatus === 'waitlisted')
                                    ? "bg-[#00a294] w-full"
                                    : "border-[#00a294] w-full"}
                                onPress={handleRegistrationToggle}
                                disabled={isRegistering}
                            >
                                {isRegistering ? (
                                    <Text className={(userRegistrationStatus === 'registered' || userRegistrationStatus === 'waitlisted') ? "text-white font-medium" : "text-[#00a294] font-medium"}>
                                        Processing...
                                    </Text>
                                ) : userRegistrationStatus === 'registered' ? (
                                    <Text className="text-white font-medium">✓ Going - Cancel</Text>
                                ) : userRegistrationStatus === 'waitlisted' ? (
                                    <Text className="text-white font-medium">Request Sent - Cancel</Text>
                                ) : party.isApprovalRequired ? (
                                    <Text className="text-[#00a294] font-medium">Request to Join</Text>
                                ) : (
                                    <Text className="text-[#00a294] font-medium">I'm Going</Text>
                                )}
                            </Button>
                        )}
                    </Box>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Friend Invite Modal */}
            <FriendSelectorModal
                visible={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                selectedFriendIds={[]}
                onConfirm={handleInviteFriends}
            />
        </Box>
    );
};

export default PartyDetails;
