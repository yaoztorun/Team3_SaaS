import { supabase } from '../lib/supabase';
import { Location } from '../types/location';

export async function fetchLocations(): Promise<Location[]> {
    const { data, error } = await supabase
        .from('Location')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching locations:', error);
        return [];
    }

    return data as Location[];
}
