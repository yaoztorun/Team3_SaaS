import { supabase } from '../lib/supabase'
import type { Tables } from '../types/supabase'

export type DBCocktail = Tables<'Cocktail'>;

/**
 * Fetch public cocktails (both system and user-created public recipes)
 * Includes creator profile information for user-created cocktails
 */
export async function fetchPublicCocktails(): Promise<DBCocktail[]> {
        const { data, error } = await supabase
                .from('Cocktail')
                .select(`
                        *,
                        Profile (
                                id,
                                full_name,
                                avatar_url
                        )
                `)
                .eq('is_public', true) // Only show public cocktails
                .order('created_at', { ascending: false });

        if (error) {
                console.error('Error fetching public cocktails:', error);
                return [];
        }

        return (data ?? []) as DBCocktail[];
}

/**
 * Fetch the current user's personal recipes only
 */
export async function fetchPersonalRecipes(): Promise<DBCocktail[]> {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
                return [];
        }

        const { data, error } = await supabase
                .from('Cocktail')
                .select('*')
                .eq('creator_id', user.id) // Only user's own recipes
                .order('created_at', { ascending: false });

        if (error) {
                console.error('Error fetching personal recipes:', error);
                return [];
        }

        return (data ?? []) as DBCocktail[];
}

/**
 * Fetch a single cocktail by ID with creator profile
 * Access control is handled by RLS policies:
 * - Returns public cocktails (is_public = true)
 * - Returns user's own cocktails (creator_id = auth.uid())
 * - Returns null for private cocktails owned by others
 */
export async function fetchCocktailById(cocktailId: string): Promise<DBCocktail | null> {
        const { data, error } = await supabase
                .from('Cocktail')
                .select(`
                        *,
                        Profile (
                                id,
                                full_name,
                                avatar_url
                        )
                `)
                .eq('id', cocktailId)
                .single();

        if (error) {
                console.error('Error fetching cocktail:', error);
                return null;
        }

        return data as DBCocktail;
}

/**
 * Fetch distinct cocktail types from the database
 */
export async function fetchCocktailTypes(): Promise<string[]> {
        try {
                const { data, error } = await supabase
                        .from('Cocktail')
                        .select('cocktail_type')
                        .is('creator_id', null) // Only system cocktails
                        .not('cocktail_type', 'is', null);

                if (error) {
                        console.error('Error fetching cocktail types:', error);
                        return [];
                }

                // Get distinct values
                const types = [...new Set(data.map(item => item.cocktail_type).filter(Boolean))];
                return types as string[];
        } catch (e) {
                console.error('Unexpected error fetching cocktail types:', e);
                return [];
        }
}

/**
 * Fetch distinct ingredient names and their usage counts from the DB.
 *
 * NOTE: This calls a Postgres RPC/function named `ingredient_usage(limit integer)`
 * which must exist in your Supabase DB. Run the SQL below in Supabase SQL editor
 * to create it (adjust column/table names if needed):
 *
 * CREATE OR REPLACE FUNCTION public.ingredient_usage(p_limit integer DEFAULT 100)
 * RETURNS TABLE(name text, count bigint) AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT
 *     trim(both ' "' from lower(coalesce((ing->> 'name')::text, ''))) as name,
 *     count(*) as count
 *   FROM public."Cocktail",
 *     LATERAL jsonb_array_elements(coalesce(ingredients::jsonb, '[]'::jsonb)) AS ing
 *   WHERE (ing->> 'name') IS NOT NULL AND trim(ing->> 'name') <> ''
 *   GROUP BY 1
 *   ORDER BY 2 DESC, 1 ASC
 *   LIMIT p_limit;
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * After creating the function, call it from the client with `supabase.rpc('ingredient_usage', { p_limit: 200 })`.
 */
export async function fetchIngredientUsage(limit = 200): Promise<{ name: string; count: number }[]> {
        try {
                const { data, error } = await supabase.rpc('ingredient_usage', { p_limit: limit });
                if (error) {
                        console.error('Error fetching ingredient usage via RPC:', error);
                        return [];
                }

                return (data ?? []) as { name: string; count: number }[];
        } catch (e) {
                console.error('Unexpected error fetching ingredient usage:', e);
                return [];
        }
}