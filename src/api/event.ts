import { supabase } from '../lib/supabase';
import type { Tables } from '../types/supabase';

export type DBEvent = Tables<'Event'>;

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
