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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/src/components/global';

type RootStackParamList = {
    AllCocktails: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const INGREDIENTS = [
    'Vodka',
    'Gin',
    'Rum',
    'Tequila',
    'Triple Sec',
    'Lime',
    'Lemon',
    'Sugar',
    'Mint',
    'Soda',
    'Tonic',
    'Orange Juice',
    'Cranberry Juice',
    'Pineapple Juice',
    'Angostura Bitters',
    'Sweet Vermouth',
    'Dry Vermouth',
    'Whiskey',
    'Bourbon',
    'Maple Syrup',
];

export const WhatCanIMake = () => {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const navigation = useNavigation<NavigationProp>();

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return INGREDIENTS;
        return INGREDIENTS.filter((i) => i.toLowerCase().includes(q));
    }, [query]);

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
                                    <Box
                                        style={{
                                            backgroundColor: isSelected ? '#E0F7F4' : '#fff',
                                            paddingHorizontal: 24,
                                            paddingVertical: 14,
                                            borderRadius: 999,
                                            borderWidth: 1,
                                            borderColor: isSelected ? '#00BBA7' : '#D1D5DB',
                                        }}
                                    >
                                        <Text style={{ color: isSelected ? '#00BBA7' : '#374151', fontSize: 16 }}>{ing}</Text>
                                    </Box>
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
                        onPress={() => navigation.navigate('AllCocktails')}
                    />
                </Box>
            </ScrollView>
        </Box>
    );
};
