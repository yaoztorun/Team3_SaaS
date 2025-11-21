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