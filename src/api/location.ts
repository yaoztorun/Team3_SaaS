import { supabase } from '../lib/supabase';
dimport type { Tables } from '../types/supabase';

export type DBLocation = Tables<'Location'>;

export async function fetchLocations(): Promise<DBLocation[]> {
        const { data, error } = await supabase
                .from('Location')
                .select('*')
                .order('name', { ascending: true });

        if (error) {
                console.error('Error fetching locations:', error);
                return [];
        }

        return (data ?? []) as DBLocation[];
}

export default fetchLocations;
