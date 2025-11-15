import { supabase } from '../lib/supabase'
import type { Tables } from '../types/supabase'

export type DBCocktail = Tables<'Cocktail'>;

export async function fetchCocktails(): Promise<DBCocktail[]> {
        const { data, error } = await supabase
                .from('Cocktail')
                .select('*')
                .order('created_at', { ascending: false }); // or 'name' if preferred

        if (error) {
                console.error('Error fetching cocktails:', error);
                return [];
        }

        return (data ?? []) as DBCocktail[];
}