import { supabase } from '../lib/supabase'
import { Cocktail } from '../types/cocktail'

export async function fetchCocktails(): Promise<Cocktail[]> {
        const { data, error } = await supabase
                .from('Cocktail')
                .select('*')
                .order('created_at', { ascending: false }); // or 'name' if preferred

        if (error) {
                console.error('Error fetching cocktails:', error);
                return [];
        }

        return data as Cocktail[];
}