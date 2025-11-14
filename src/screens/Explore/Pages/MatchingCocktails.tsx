import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, Image, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { PageHeader } from '../components/PageHeader';
import { HStack } from '@/src/components/ui/hstack';
import { fetchCocktails } from '@/src/api/cocktail';
import { Cocktail } from '@/src/types/cocktail';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    MatchingCocktails: { selectedIngredients: string[] };
    CocktailDetail: { cocktail: Cocktail };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type MatchingCocktailsRouteProp = RouteProp<RootStackParamList, 'MatchingCocktails'>;

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x300.png?text=Cocktail';

type CocktailMatch = {
    cocktail: Cocktail;
    matchPercentage: number;
    matchedCount: number;
    totalCount: number;
};

export const MatchingCocktails = () => {
    const route = useRoute<MatchingCocktailsRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { selectedIngredients = [] } = route.params || {};
    
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const data = await fetchCocktails();
                if (mounted) setCocktails(data);
            } catch (e) {
                console.warn('Failed to load cocktails', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const matches = useMemo(() => {
        if (!selectedIngredients.length) return [];
        
        const normalizedSelected = selectedIngredients.map(i => i.toLowerCase().trim());
        const results: CocktailMatch[] = [];

        cocktails.forEach(cocktail => {
            const raw = cocktail.ingredients;
            let arr: any[] = [];
            
            if (!raw) return;
            if (typeof raw === 'string') {
                try {
                    arr = JSON.parse(raw);
                } catch (e) {
                    return;
                }
            } else if (Array.isArray(raw)) {
                arr = raw;
            }

            const cocktailIngredients = arr
                .map(ing => (ing?.name || '').toString().trim().toLowerCase())
                .filter(Boolean);

            if (!cocktailIngredients.length) return;

            const matchedCount = cocktailIngredients.filter(ing =>
                normalizedSelected.includes(ing)
            ).length;

            if (matchedCount > 0) {
                const matchPercentage = Math.round((matchedCount / cocktailIngredients.length) * 100);
                results.push({
                    cocktail,
                    matchPercentage,
                    matchedCount,
                    totalCount: cocktailIngredients.length,
                });
            }
        });

        // Sort by match percentage (descending), then by name
        return results.sort((a, b) => {
            const percentDiff = b.matchPercentage - a.matchPercentage;
            if (percentDiff !== 0) return percentDiff;
            return (a.cocktail.name || '').localeCompare(b.cocktail.name || '');
        });
    }, [cocktails, selectedIngredients]);

    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="Matching Cocktails" />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {loading && (
                    <Text className="text-gray-600 mb-4">Loading cocktails...</Text>
                )}
                
                {!loading && selectedIngredients.length === 0 && (
                    <Text className="text-gray-600">No ingredients selected</Text>
                )}

                {!loading && selectedIngredients.length > 0 && matches.length === 0 && (
                    <Text className="text-gray-600">No cocktails found with your ingredients</Text>
                )}

                {matches.map(({ cocktail, matchPercentage, matchedCount, totalCount }) => {
                    const imageUri = cocktail.image_url || PLACEHOLDER_IMAGE;
                    return (
                        <TouchableOpacity
                            key={cocktail.id}
                            className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('CocktailDetail', { cocktail })}
                        >
                            <HStack>
                                <View className="bg-neutral-200 items-center justify-center" style={{ width: 100, height: 100 }}>
                                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                </View>
                                <Box className="flex-1 p-3 justify-center">
                                    <Text className="text-base font-semibold mb-1">{cocktail.name}</Text>
                                    <Text className="text-sm text-gray-600 mb-2">
                                        {matchedCount} of {totalCount} ingredients
                                    </Text>
                                    <Box className="flex-row items-center">
                                        <Box className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                                            <Box
                                                style={{ 
                                                    width: `${matchPercentage}%`,
                                                    height: 8,
                                                    borderRadius: 999,
                                                    backgroundColor: '#14b8a6'
                                                }}
                                            />
                                        </Box>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#14b8a6' }}>
                                            {matchPercentage}%
                                        </Text>
                                    </Box>
                                </Box>
                            </HStack>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </Box>
    );
};
