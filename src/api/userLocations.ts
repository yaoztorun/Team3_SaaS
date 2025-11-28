import { supabase } from '../lib/supabase';
import type { Tables } from '../types/supabase';

export type DBUserLocation = Tables<'UserLocations'>;

/**
 * Fetch all user locations for the current authenticated user
 */
export async function fetchUserLocations(): Promise<DBUserLocation[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                console.error('No authenticated user found');
                return [];
        }

        const { data, error } = await supabase
                .from('UserLocations')
                .select('*')
                .eq('creator_id', user.id)
                .order('label', { ascending: true });

        if (error) {
                console.error('Error fetching user locations:', error);
                return [];
        }

        return (data ?? []) as DBUserLocation[];
}

/**
 * Create a new user location
 */
export async function createUserLocation(location: {
        label: string;
        street: string;
        house_nr: number;
        city: string;
}): Promise<DBUserLocation | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
                console.error('No authenticated user found');
                return null;
        }

        const { data, error } = await supabase
                .from('UserLocations')
                .insert({
                        creator_id: user.id,
                        label: location.label,
                        street: location.street,
                        house_nr: location.house_nr,
                        city: location.city,
                })
                .select()
                .single();

        if (error) {
                console.error('Error creating user location:', error);
                return null;
        }

        return data as DBUserLocation;
}

/**
 * Delete a user location
 */
export async function deleteUserLocation(locationId: string): Promise<boolean> {
        const { error } = await supabase
                .from('UserLocations')
                .delete()
                .eq('id', locationId);

        if (error) {
                console.error('Error deleting user location:', error);
                return false;
        }

        return true;
}

/**
 * Update a user location
 */
export async function updateUserLocation(
        locationId: string,
        updates: Partial<{
                label: string;
                street: string;
                house_nr: number;
                city: string;
        }>
): Promise<DBUserLocation | null> {
        const { data, error } = await supabase
                .from('UserLocations')
                .update(updates)
                .eq('id', locationId)
                .select()
                .single();

        if (error) {
                console.error('Error updating user location:', error);
                return null;
        }

        return data as DBUserLocation;
}
