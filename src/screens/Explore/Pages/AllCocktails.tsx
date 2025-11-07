import React, { useEffect, useState } from 'react';
import { Text, ActivityIndicator } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { PageHeader } from '../components/PageHeader';
import { fetchCocktails } from '../../../api/cocktail';
import { Cocktail } from '../../../types/cocktail';

export const AllCocktails = () => {
    const [cocktails, setCocktails] = useState<Cocktail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchCocktails();
            setCocktails(data);
            setLoading(false);
        };
        loadData();
    }, []);

    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="All Cocktails" />
            <Box className="p-4 space-y-2">
                {loading ? (
                    <ActivityIndicator size="large" color="#999" />
                ) : cocktails.length > 0 ? (
                    cocktails.map((c) => (
                        <Box key={c.id} className="p-3 bg-white rounded-2xl shadow">
                            <Text className="text-lg font-semibold">{c.name ?? 'Unnamed Cocktail'}</Text>

                            {/* Ingredients */}
                            {c.ingredients?.length > 0 && (
                                <Text className="text-gray-500 text-sm">
                                    Ingredients: {c.ingredients.map(i => `${i.amount}${i.unit} ${i.name}`).join(', ')}
                                </Text>
                            )}

                            {/* Instructions */}
                            {c.instructions?.length > 0 && (
                                <Text className="text-gray-500 text-sm mt-1">
                                    Instructions: {c.instructions.map(s => `${s.step}. ${s.description}`).join(' ')}
                                </Text>
                            )}

                            {/* Optional metadata */}
                            {c.is_public !== null && (
                                <Text className="text-gray-400 text-xs mt-1">
                                    {c.is_public ? 'Public' : 'Private'}
                                </Text>
                            )}
                        </Box>
                    ))

                ) : (
                    <Text>No cocktails found.</Text>
                )}
            </Box>
        </Box>
    );
};
