import React, { useMemo, useState } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { PageHeader } from '../components/PageHeader';
import { HStack } from '@/src/components/ui/hstack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Check } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchCocktails } from '@/src/api/cocktail';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/src/components/global';

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
                const data = await fetchCocktails();
                
                // Count ingredient usage (case-insensitive to avoid duplicates) 
                const countMap = new Map<string, number>();
                const nameMap = new Map<string, string>(); // normalized -> display name
                
                (data || []).forEach((row: any) => {
                    const raw = row?.ingredients;
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

                    arr.forEach((ing) => {
                        if (!ing) return;
                        const name = (ing.name || '').toString().trim();
                        if (!name) return;
                        
                        // Normalize to lowercase for deduplication
                        const normalized = name.toLowerCase();
                        countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
                        
                        // Store the first occurrence as display name (or prefer capitalized)
                        if (!nameMap.has(normalized)) {
                            nameMap.set(normalized, name);
                        } else {
                            // Prefer the version with proper capitalization
                            const current = nameMap.get(normalized)!;
                            if (name[0] === name[0].toUpperCase() && current[0] !== current[0].toUpperCase()) {
                                nameMap.set(normalized, name);
                            }
                        }
                    });
                });

                // Sort by usage count (most popular first), then alphabetically
                const sorted = Array.from(countMap.entries())
                    .sort((a, b) => {
                        const countDiff = b[1] - a[1];
                        if (countDiff !== 0) return countDiff;
                        return a[0].localeCompare(b[0]);
                    })
                    .map(([normalized]) => nameMap.get(normalized)!);

                if (mounted) setIngredients(sorted);
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
            <PageHeader title="What Can I Make?" />

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Search input */}
                <Box className="mb-4">
                    <TextInput
                        placeholder="Search ingredients..."
                        value={query}
                        onChangeText={setQuery}
                        style={{
                            backgroundColor: '#fff',
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderRadius: 999,
                        }}
                        placeholderTextColor="#9CA3AF"
                    />
                </Box>

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
                                <Pressable
                                    key={ing}
                                    onPress={() => toggle(ing)}
                                    className="mr-2 mb-3"
                                >
                                    <LinearGradient
                                        colors={isSelected ? [colors.primary[400], colors.primary[600]] : ['#fff', '#fff']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            paddingHorizontal: 12,
                                            paddingVertical: 8,
                                            borderRadius: 999,
                                            borderWidth: isSelected ? 0 : 1,
                                            borderColor: isSelected ? 'transparent' : '#E5E7EB',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {isSelected ? (
                                            <Check size={14} color="#fff" />
                                        ) : null}
                                        <Text className={isSelected ? 'text-white ml-2' : 'text-gray-700'}>{ing}</Text>
                                    </LinearGradient>
                                </Pressable>
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
