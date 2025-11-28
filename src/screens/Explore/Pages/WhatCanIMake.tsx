import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { HStack } from '@/src/components/ui/hstack';
import { Text } from '@/src/components/ui/text';
import { fetchCocktails, fetchIngredientUsage } from '@/src/api/cocktail';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton, SearchBar, FilterChip } from '@/src/components/global';

type RootStackParamList = {
    AllCocktails: undefined;
    MatchingCocktails: { selectedIngredients: string[] };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// will be populated from DB
const INITIAL_INGREDIENTS: string[] = [];

export const WhatCanIMake = () => {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<string[]>(INITIAL_INGREDIENTS);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<NavigationProp>();

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return ingredients.slice(0, 50); // Show only top 50 when no search query otherwise to much options
        return ingredients.filter((i) => i.toLowerCase().includes(q));
    }, [query, ingredients]);

    // Load distinct ingredient names from the Cocktail table
    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                // Prefer server-side aggregation via RPC if available
                try {
                    const usage = await fetchIngredientUsage(500);
                    const names = usage.map(u => u.name).filter(Boolean);
                    if (mounted) setIngredients(names);
                    console.log('Fetched ingredient usage via RPC:', names.length, 'ingredients');
                } catch (rpcErr) {
                    // Fallback to fetching full cocktails and processing client-side
                    console.warn('RPC fetchIngredientUsage failed, falling back to client-side processing.', rpcErr);

                    const data = await fetchCocktails();
                    const countMap = new Map<string, number>();
                    const nameMap = new Map<string, string>();

                    (data || []).forEach((row: any) => {
                        const raw = row?.ingredients;
                        let arr: any[] = [];
                        if (!raw) return;
                        if (typeof raw === 'string') {
                            try { arr = JSON.parse(raw); } catch (e) { return; }
                        } else if (Array.isArray(raw)) {
                            arr = raw;
                        }
                        arr.forEach((ing) => {
                            if (!ing) return;
                            const name = (ing.name || '').toString().trim();
                            if (!name) return;
                            const normalized = name.toLowerCase();
                            countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
                            if (!nameMap.has(normalized)) nameMap.set(normalized, name);
                        });
                    });

                    const sorted = Array.from(countMap.entries())
                        .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
                        .map(([normalized]) => nameMap.get(normalized)!);
                    if (mounted) setIngredients(sorted);
                }
            } catch (e) {
                console.warn('Failed to load ingredients', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const toggle = (name: string) => {
        setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));
    };

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="What Can I Make?" showBack onBackPress={() => navigation.goBack()} />

            {/* Search bar - stays at top */}
            <Box className="px-4 pt-4 pb-2">
                <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search ingredients..."
                />
            </Box>

            {/* Scrollable content - starts below search bar */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
            >
                {/* Instructions */}
                <Box className="mb-3">
                    <Text className="text-sm text-gray-600">Please select ingredients you have available:</Text>
                </Box>

                {/* Chips */}
                <Box>
                    <HStack className="flex-row flex-wrap">
                        {filtered.map((ing) => {
                            const isSelected = selected.includes(ing);
                            return (
                                <Box key={ing} className="mr-2 mb-3">
                                    <FilterChip
                                        label={ing}
                                        selected={isSelected}
                                        onPress={() => toggle(ing)}
                                    />
                                </Box>
                            );
                        })}
                    </HStack>
                </Box>

                {/* Selected summary */}
                <Box className="mt-6 mb-4">
                    <Text className="text-sm text-gray-600">Selected ingredients: {selected.length}</Text>
                </Box>

                {/* Find button */}
                <Box>
                    <PrimaryButton
                        title="Find cocktails"
                        onPress={() => navigation.navigate('MatchingCocktails', { selectedIngredients: selected })}
                    />
                </Box>
            </ScrollView>
        </Box>
    );
};
