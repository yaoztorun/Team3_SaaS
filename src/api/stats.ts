import { supabase } from '../lib/supabase';

export type UserStats = {
    drinksLogged: number;
    avgRating: number;
    popularCocktail: {
        name: string;
        count: number;
    } | null;
    topCocktails: Array<{
        id: string;
        name: string;
        count: number;
    }>;
    ratingTrend: Array<{
        rating: number;
        count: number;
    }>;
    cocktailBreakdown: Array<{
        name: string;
        count: number;
        color: string;
    }>;
};

const CHART_COLORS = [
    '#F6339A', // Pink
    '#AD46FF', // Purple
    '#FF6900', // Orange
    '#00BBA7', // Teal
    '#F0B100', // Yellow
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
];

export async function fetchUserStats(userId: string): Promise<UserStats> {
    try {
        // 1. Drinks Logged - count all drink logs for user
        const { count: drinksLogged } = await supabase
            .from('DrinkLog')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // 2. Average Rating - get average of rating column
        const { data: ratingData } = await supabase
            .from('DrinkLog')
            .select('rating')
            .eq('user_id', userId)
            .not('rating', 'is', null);

        const ratings = ratingData?.map(d => d.rating).filter(r => r !== null) || [];
        const avgRating = ratings.length > 0
            ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
            : 0;

        // 4. Top Cocktails - most logged cocktails (top 3)
        const { data: cocktailCounts } = await supabase
            .from('DrinkLog')
            .select('cocktail_id, Cocktail(id, name)')
            .eq('user_id', userId)
            .not('cocktail_id', 'is', null);

        const cocktailMap = new Map<string, { name: string; count: number }>();
        
        cocktailCounts?.forEach((log: any) => {
            const cocktailId = log.cocktail_id;
            const cocktailName = log.Cocktail?.name || 'Unknown';
            
            if (cocktailMap.has(cocktailId)) {
                cocktailMap.get(cocktailId)!.count++;
            } else {
                cocktailMap.set(cocktailId, { name: cocktailName, count: 1 });
            }
        });

        const allCocktailsSorted = Array.from(cocktailMap.entries())
            .map(([id, data]) => ({ id, name: data.name, count: data.count }))
            .sort((a, b) => b.count - a.count);

        const topCocktails = allCocktailsSorted.slice(0, 3);

        const popularCocktail = topCocktails.length > 0
            ? { name: topCocktails[0].name, count: topCocktails[0].count }
            : null;

        // 5. Rating Trend - distribution of ratings (0-5)
        const ratingTrend = Array.from({ length: 6 }, (_, i) => ({
            rating: i,
            count: ratings.filter(r => Math.round(r) === i).length,
        }));

        // 6. Cocktail Breakdown - for pie chart
        // Show top cocktails with smart grouping
        const totalCocktailsCount = Array.from(cocktailMap.values()).reduce((sum, c) => sum + c.count, 0);
        const minSliceSize = totalCocktailsCount * 0.0833; // 1/12 of total (~8.3%)
        const maxSlices = 8; // Maximum number of individual slices before grouping
        
        const cocktailBreakdown: Array<{ name: string; count: number; color: string }> = [];
        let othersCount = 0;
        
        for (let i = 0; i < allCocktailsSorted.length; i++) {
            const cocktail = allCocktailsSorted[i];
            
            // Show top cocktails: either under max slices OR above minimum size threshold
            const shouldShowIndividually = 
                cocktailBreakdown.length < maxSlices || 
                (cocktailBreakdown.length < maxSlices && cocktail.count >= minSliceSize);
            
            if (shouldShowIndividually && cocktailBreakdown.length < maxSlices) {
                cocktailBreakdown.push({
                    name: cocktail.name,
                    count: cocktail.count,
                    color: CHART_COLORS[cocktailBreakdown.length % CHART_COLORS.length],
                });
            } else {
                othersCount += cocktail.count;
            }
        }
        
        // Add "Others" category if we grouped any cocktails
        if (othersCount > 0) {
            cocktailBreakdown.push({
                name: 'Others',
                count: othersCount,
                color: CHART_COLORS[cocktailBreakdown.length % CHART_COLORS.length],
            });
        }

        return {
            drinksLogged: drinksLogged || 0,
            avgRating,
            popularCocktail,
            topCocktails,
            ratingTrend,
            cocktailBreakdown: cocktailBreakdown.length > 0 ? cocktailBreakdown : [],
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            drinksLogged: 0,
            avgRating: 0,
            popularCocktail: null,
            topCocktails: [],
            ratingTrend: Array.from({ length: 6 }, (_, i) => ({ rating: i, count: 0 })),
            cocktailBreakdown: [],
        };
    }
}
