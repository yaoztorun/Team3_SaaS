import { supabase } from '../lib/supabase';
import type { Tables } from '../types/supabase';
import { getFriends } from './friendship';

export type DBEvent = Tables<'Event'>;

// Extended type with organizer profile and location info
export type EventWithDetails = DBEvent & {
        organizer_profile?: {
                id: string;
                full_name: string | null;
                email: string | null;
                avatar_url: string | null;
        };
        location?: {
                id: string;
                name: string | null;
                street_name: string | null;
                street_nr: string | null;
                city: string | null;
        };
        user_location?: {
                id: string;
                label: string | null;
                street: string | null;
                house_nr: number | null;
                city: string | null;
        };
        attendee_count?: number;
};

/**
 * Create a new event/party
 */
export async function createEvent(event: {
        name: string;
        description: string;
        party_type: 'house party' | 'bar meetup' | 'outdoor event' | 'themed party';
        location_id?: string | null;
        user_location_id?: string | null;
        start_time: string;
        end_time?: string | null;
        max_attendees?: number | null;
        price?: number | null;
        isPublic: boolean;
        isApprovalRequired: boolean;
        cover_image?: string | null;
        type: 'party' | 'event';
}): Promise<DBEvent | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                console.error('No authenticated user found');
                return null;
        }

        const { data, error } = await supabase
                .from('Event')
                .insert({
                        organiser_id: user.id,
                        name: event.name,
                        description: event.description,
                        party_type: event.party_type,
                        location_id: event.location_id,
                        user_location_id: event.user_location_id,
                        start_time: event.start_time,
                        end_time: event.end_time,
                        max_attendees: event.max_attendees,
                        price: event.price,
                        isPublic: event.isPublic,
                        isApprovalRequired: event.isApprovalRequired,
                        cover_image: event.cover_image,
                        type: event.type,
                })
                .select()
                .single();

        if (error) {
                console.error('Error creating event:', error);
                return null;
        }

        return data as DBEvent;
}

/**
 * Fetch events organized by the current user
 */
export async function fetchMyEvents(): Promise<DBEvent[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                console.error('No authenticated user found');
                return [];
        }

        const { data, error } = await supabase
                .from('Event')
                .select('*')
                .eq('organiser_id', user.id)
                .order('start_time', { ascending: false });

        if (error) {
                console.error('Error fetching my events:', error);
                return [];
        }

        return (data ?? []) as DBEvent[];
}

/**
 * Fetch all public events
 */
export async function fetchPublicEvents(): Promise<DBEvent[]> {
        const { data, error } = await supabase
                .from('Event')
                .select('*')
                .eq('isPublic', true)
                .order('start_time', { ascending: true });

        if (error) {
                console.error('Error fetching public events:', error);
                return [];
        }

        return (data ?? []) as DBEvent[];
}

/**
 * Fetch public events with full details (organizer, location, attendee count)
 */
export async function fetchPublicEventsWithDetails(): Promise<EventWithDetails[]> {
        const { data, error } = await supabase
                .from('Event')
                .select('*')
                .eq('isPublic', true)
                .order('start_time', { ascending: true });

        if (error) {
                console.error('Error fetching public events:', error);
                return [];
        }

        const events = (data ?? []) as DBEvent[];
        return fetchEventsWithDetails(events);
}

/**
 * Fetch events with full details including organizer profile and location
 */
async function fetchEventsWithDetails(events: DBEvent[]): Promise<EventWithDetails[]> {
        if (events.length === 0) return [];

        const eventIds = events.map(e => e.id);

        // Fetch organizer profiles
        const organizerIds = [...new Set(events.map(e => e.organiser_id).filter(Boolean))];
        const { data: profiles } = await supabase
                .from('Profile')
                .select('id, full_name, email, avatar_url')
                .in('id', organizerIds);

        // Fetch public locations
        const locationIds = [...new Set(events.map(e => e.location_id).filter(Boolean))];
        const { data: locations } = locationIds.length > 0 ? await supabase
                .from('Location')
                .select('id, name, street_name, street_nr, city')
                .in('id', locationIds) : { data: [] };

        // Fetch user locations
        const userLocationIds = [...new Set(events.map(e => e.user_location_id).filter(Boolean))];
        const { data: userLocations } = userLocationIds.length > 0 ? await supabase
                .from('UserLocations')
                .select('id, label, street, house_nr, city')
                .in('id', userLocationIds) : { data: [] };

        // Fetch attendee counts from EventRegistration
        const { data: registrations } = await supabase
                .from('EventRegistration')
                .select('event_id, status')
                .in('event_id', eventIds)
                .eq('status', 'registered');

        const attendeeCounts = (registrations ?? []).reduce((acc, reg) => {
                acc[reg.event_id] = (acc[reg.event_id] || 0) + 1;
                return acc;
        }, {} as Record<string, number>);

        // Map profiles and locations to events
        const profileMap = new Map(profiles?.map(p => [p.id, p]));
        const locationMap = new Map(locations?.map(l => [l.id, l]));
        const userLocationMap = new Map(userLocations?.map(l => [l.id, l]));

        return events.map(event => ({
                ...event,
                organizer_profile: event.organiser_id ? profileMap.get(event.organiser_id) : undefined,
                location: event.location_id ? locationMap.get(event.location_id) : undefined,
                user_location: event.user_location_id ? userLocationMap.get(event.user_location_id) : undefined,
                attendee_count: attendeeCounts[event.id] || 0,
        }));
}

/**
 * Fetch all events visible to the current user, organized by category:
 * - My Events: Events organized by the current user
 * - Friends Events: Events organized by friends (if not public)
 * - Public Events: All public events
 */
export async function fetchAllVisibleEvents(): Promise<{
        myEvents: EventWithDetails[];
        friendsEvents: EventWithDetails[];
        publicEvents: EventWithDetails[];
}> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                console.error('No authenticated user found');
                return { myEvents: [], friendsEvents: [], publicEvents: [] };
        }

        // Fetch all events in parallel
        const [myEventsData, allEventsData, friends] = await Promise.all([
                // 1. My events
                supabase
                        .from('Event')
                        .select('*')
                        .eq('organiser_id', user.id)
                        .order('start_time', { ascending: true }),

                // 2. All events (we'll filter by friends + public)
                supabase
                        .from('Event')
                        .select('*')
                        .neq('organiser_id', user.id) // Exclude my own events
                        .order('start_time', { ascending: true }),

                // 3. Get friend list
                getFriends(user.id)
        ]);

        if (myEventsData.error) console.error('Error fetching my events:', myEventsData.error);
        if (allEventsData.error) console.error('Error fetching all events:', allEventsData.error);

        const myEvents = (myEventsData.data ?? []) as DBEvent[];
        const allEvents = (allEventsData.data ?? []) as DBEvent[];

        // Get friend IDs
        const friendIds = new Set(friends.map(f => f.id));

        // Separate friends' events and public events
        const friendsEvents: DBEvent[] = [];
        const publicEvents: DBEvent[] = [];

        allEvents.forEach(event => {
                const isFriendEvent = event.organiser_id && friendIds.has(event.organiser_id);
                const isPublic = event.isPublic;

                if (isFriendEvent && !isPublic) {
                        // Friend's private event
                        friendsEvents.push(event);
                } else if (isPublic) {
                        // Public event (could be from friend or stranger)
                        publicEvents.push(event);
                }
                // Note: Private events from non-friends are automatically excluded
        });

        // Fetch full details for all events
        const [myEventsWithDetails, friendsEventsWithDetails, publicEventsWithDetails] = await Promise.all([
                fetchEventsWithDetails(myEvents),
                fetchEventsWithDetails(friendsEvents),
                fetchEventsWithDetails(publicEvents),
        ]);

        return {
                myEvents: myEventsWithDetails,
                friendsEvents: friendsEventsWithDetails,
                publicEvents: publicEventsWithDetails,
        };
}

/**
 * Register for an event
 * - If event requires approval: status = 'waitlisted'
 * - If no approval required: status = 'registered'
 * - If user previously cancelled, updates the existing row
 */
export async function registerForEvent(eventId: string, requiresApproval: boolean): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                console.error('No authenticated user found');
                return false;
        }

        const status = requiresApproval ? 'waitlisted' : 'registered';

        // Check if a registration already exists (including cancelled ones)
        const { data: existing } = await supabase
                .from('EventRegistration')
                .select('*')
                .eq('event_id', eventId)
                .eq('user_id', user.id)
                .maybeSingle();

        if (existing) {
                // Update existing registration
                const { error } = await supabase
                        .from('EventRegistration')
                        .update({ status: status })
                        .eq('event_id', eventId)
                        .eq('user_id', user.id);

                if (error) {
                        console.error('Error updating registration:', error);
                        return false;
                }
        } else {
                // Insert new registration
                const { error } = await supabase
                        .from('EventRegistration')
                        .insert({
                                event_id: eventId,
                                user_id: user.id,
                                status: status,
                        });

                if (error) {
                        console.error('Error registering for event:', error);
                        return false;
                }
        }

        return true;
}

/**
 * Cancel event registration (sets status to 'cancelled')
 */
export async function cancelEventRegistration(eventId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                console.error('No authenticated user found');
                return false;
        }

        const { error } = await supabase
                .from('EventRegistration')
                .update({ status: 'cancelled' })
                .eq('event_id', eventId)
                .eq('user_id', user.id);

        if (error) {
                console.error('Error cancelling registration:', error);
                console.error('Error details:', JSON.stringify(error));
                return false;
        }

        return true;
}

/**
 * Get user's registration status for a specific event
 */
export async function getUserEventRegistration(eventId: string): Promise<{
        isRegistered: boolean;
        status: 'registered' | 'cancelled' | 'waitlisted' | null;
}> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                // console.log(`getUserEventRegistration: No user logged in`);
                return { isRegistered: false, status: null };
        }

        // console.log(`getUserEventRegistration: Fetching for eventId=${eventId}, userId=${user.id}`);
        const { data, error } = await supabase
                .from('EventRegistration')
                .select('status')
                .eq('event_id', eventId)
                .eq('user_id', user.id)
                .maybeSingle();

        // console.log(`getUserEventRegistration: data=`, data, `error=`, error);

        if (error || !data) {
                // console.log(`getUserEventRegistration: No registration found`);
                return { isRegistered: false, status: null };
        }

        // If status is 'cancelled', treat it as no registration for UI purposes
        if (data.status === 'cancelled') {
                // console.log(`getUserEventRegistration: Status is 'cancelled', treating as null`);
                return { isRegistered: false, status: null };
        }

        // console.log(`getUserEventRegistration: Returning status=${data.status}`);
        return {
                isRegistered: data.status === 'registered' || data.status === 'waitlisted',
                status: data.status as 'registered' | 'cancelled' | 'waitlisted',
        };
}

/**
 * Update registration status (for organizers to approve/reject)
 */
export async function updateRegistrationStatus(
        eventId: string,
        userId: string,
        status: 'registered' | 'cancelled' | 'waitlisted'
): Promise<boolean> {
        const { error } = await supabase
                .from('EventRegistration')
                .update({ status })
                .eq('event_id', eventId)
                .eq('user_id', userId);

        if (error) {
                console.error('Error updating registration status:', error);
                return false;
        }

        return true;
}

/**
 * Fetch attendees for an event with their profile information
 * Returns separate lists for registered (confirmed) and waitlisted (pending approval) attendees
 */
export async function fetchEventAttendees(eventId: string): Promise<{
        registered: Array<{ id: string; full_name: string | null; avatar_url: string | null }>;
        waitlisted: Array<{ id: string; full_name: string | null; avatar_url: string | null }>;
        pendingCount: number;
}> {
        // Fetch all registrations for this event (excluding cancelled)
        const { data: registrations, error: regError } = await supabase
                .from('EventRegistration')
                .select('user_id, status')
                .eq('event_id', eventId)
                .in('status', ['registered', 'waitlisted']);

        if (regError || !registrations) {
                console.error('Error fetching registrations:', regError);
                return { registered: [], waitlisted: [], pendingCount: 0 };
        }

        // Get unique user IDs
        const userIds = [...new Set(registrations.map(r => r.user_id))];

        if (userIds.length === 0) {
                return { registered: [], waitlisted: [], pendingCount: 0 };
        }

        // Fetch profile data for all attendees
        const { data: profiles, error: profileError } = await supabase
                .from('Profile')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

        if (profileError || !profiles) {
                console.error('Error fetching profiles:', profileError);
                return { registered: [], waitlisted: [], pendingCount: 0 };
        }

        // Map profiles to registrations
        const profileMap = new Map(profiles.map(p => [p.id, p]));

        const registered: Array<{ id: string; full_name: string | null; avatar_url: string | null }> = [];
        const waitlisted: Array<{ id: string; full_name: string | null; avatar_url: string | null }> = [];

        registrations.forEach(reg => {
                const profile = profileMap.get(reg.user_id);
                if (profile) {
                        if (reg.status === 'registered') {
                                registered.push(profile);
                        } else if (reg.status === 'waitlisted') {
                                waitlisted.push(profile);
                        }
                }
        });

        return { registered, waitlisted, pendingCount: waitlisted.length };
}

/**
 * Update an existing event (only by organizer)
 */
export async function updateEvent(
        eventId: string,
        updates: {
                name?: string;
                description?: string;
                party_type?: 'house party' | 'bar meetup' | 'outdoor event' | 'themed party';
                location_id?: string | null;
                user_location_id?: string | null;
                start_time?: string;
                end_time?: string | null;
                max_attendees?: number | null;
                price?: number | null;
                isPublic?: boolean;
                isApprovalRequired?: boolean;
                cover_image?: string | null;
        }
): Promise<EventWithDetails | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                console.error('No authenticated user found');
                return null;
        }

        // Only organizer can update
        const { data, error } = await supabase
                .from('Event')
                .update(updates)
                .eq('id', eventId)
                .eq('organiser_id', user.id) // Ensure user is the organizer
                .select(`
                        *,
                        organizer_profile:Profile!Event_organiser_id_fkey(id, full_name, email, avatar_url),
                        location:Location(id, name, street_name, street_nr, city),
                        user_location:UserLocations(id, label, street, house_nr, city)
                `)
                .single();

        if (error) {
                console.error('Error updating event:', error);
                return null;
        }

        return data as EventWithDetails;
}
