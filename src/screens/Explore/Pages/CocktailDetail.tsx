import React, { useState } from 'react';
import { ScrollView, Image, View, TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { ArrowLeft, Heart, Star, Clock, Info, Users, Minus, Plus } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DBCocktail } from '@/src/api/cocktail';
import { Heading } from '@/src/components/global';

type RootStackParamList = {
    CocktailDetail: { cocktail: DBCocktail };
};

type CocktailDetailRouteProp = RouteProp<RootStackParamList, 'CocktailDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300.png?text=Cocktail';

// Dummy data for fields not in DB
const getDummyData = (cocktailName: string) => ({
    rating: 4.8,
    reviewCount: 2847,
    prepTime: '5 min',
    funFact: `The ${cocktailName || 'cocktail'} is a classic drink that has been enjoyed for generations. Its unique blend of flavors makes it a favorite among cocktail enthusiasts worldwide.`,
});

export const CocktailDetail = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<CocktailDetailRouteProp>();
    const { cocktail } = route.params;

    const [servings, setServings] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);
    const [checkedIngredients, setCheckedIngredients] = useState<{ [key: number]: boolean }>({});

    const dummyData = getDummyData(cocktail.name || '');
    const imageUri = cocktail.image_url ?? PLACEHOLDER_IMAGE;

    // Get difficulty from database, fallback to 'medium' if not set
    const difficulty = cocktail.difficulty ? cocktail.difficulty.charAt(0).toUpperCase() + cocktail.difficulty.slice(1) : 'Medium';

    const parseJsonArray = <T,>(v: any): T[] => {
        if (!v) return [] as T[];
        if (Array.isArray(v)) return v as T[];
        try {
            return typeof v === 'string' ? JSON.parse(v) as T[] : (v as T[]);
        } catch (e) {
            return [] as T[];
        }
    };

    const ingredients = parseJsonArray<{ name?: string; amount?: number; unit?: string }>(cocktail.ingredients);
    const instructions = parseJsonArray<{ step?: number; description?: string }>(cocktail.instructions);

    const toggleIngredient = (index: number) => {
        setCheckedIngredients(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const adjustServings = (delta: number) => {
        setServings(prev => Math.max(1, prev + delta));
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
            case 'medium': return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
            case 'hard': return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
            default: return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
        }
    };

    const difficultyColors = getDifficultyColor(difficulty);

    return (
        <Box className="flex-1 bg-white">
            {/* Hero image moved into ScrollView so it scrolls with content (see inside ScrollView) */}

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
            >
                {/* Hero Image with Back & Favorite Buttons - now part of the scrollable content */}
                <View style={{ position: 'relative', height: 300, width: '100%', borderRadius: 16, overflow: 'hidden' }}>
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                    {/* Back Button (scrolls with image) */}
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            width: 40,
                            height: 40,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft size={24} color="#fff" />
                    </Pressable>
                    {/* Favorite Button (scrolls with image) */}
                    <Pressable
                        onPress={() => setIsFavorited(!isFavorited)}
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 40,
                            height: 40,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Heart
                            size={24}
                            color="#fff"
                            fill={isFavorited ? '#fff' : 'transparent'}
                        />
                    </Pressable>
                </View>
                {/* preserve previous spacing between image and details */}
                <View style={{ height: 24 }} />
                {/* Title and Metadata */}
                <Box className="mb-6">
                    <Heading level="h3" className="text-neutral-950 mb-3">
                        {cocktail.name ?? 'Unnamed Cocktail'}
                    </Heading>
                    <HStack className="items-center gap-4">
                        {/* Rating */}
                        <HStack className="items-center gap-1">
                            <Star size={20} color="#fbbf24" fill="#fbbf24" />
                            <Text className="text-base font-semibold text-neutral-950">
                                {dummyData.rating}
                            </Text>
                            <Text className="text-sm text-neutral-600">
                                ({dummyData.reviewCount})
                            </Text>
                        </HStack>
                        {/* Difficulty Badge */}
                        <View
                            style={{
                                backgroundColor: difficultyColors.bg,
                                borderWidth: 1,
                                borderColor: difficultyColors.border,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            <Clock size={12} color={difficultyColors.text} />
                            <Text style={{ fontSize: 12, color: difficultyColors.text, fontWeight: '600' }}>
                                {difficulty}
                            </Text>
                        </View>
                        {/* Prep Time */}
                        <Text className="text-sm text-neutral-600">{dummyData.prepTime}</Text>
                    </HStack>
                </Box>

                {/* Servings Control */}
                <Box
                    className="mb-6 rounded-2xl px-4 py-4"
                    style={{ backgroundColor: '#f9fafb' }}
                >
                    <HStack className="items-center justify-between">
                        <HStack className="items-center gap-2">
                            <Users size={20} color="#030213" />
                            <Text className="text-base font-semibold text-neutral-950">Servings</Text>
                        </HStack>
                        <HStack className="items-center gap-3">
                            <TouchableOpacity
                                onPress={() => adjustServings(-1)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderWidth: 1,
                                    borderColor: '#d1d5dc',
                                    borderRadius: 16,
                                    backgroundColor: '#fff',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Minus size={16} color="#030213" />
                            </TouchableOpacity>
                            <Text className="text-base font-semibold text-neutral-950 w-8 text-center">
                                {servings}
                            </Text>
                            <TouchableOpacity
                                onPress={() => adjustServings(1)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderWidth: 1,
                                    borderColor: '#d1d5dc',
                                    borderRadius: 16,
                                    backgroundColor: '#fff',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Plus size={16} color="#030213" />
                            </TouchableOpacity>
                        </HStack>
                    </HStack>
                </Box>

                {/* Ingredients Section */}
                <Box className="mb-6">
                    <Heading level="h5" className="text-neutral-950 mb-4">Ingredients</Heading>
                    <Box className="gap-3">
                        {ingredients.map((ingredient, index) => (
                            <Pressable
                                key={index}
                                onPress={() => toggleIngredient(index)}
                                style={{
                                    backgroundColor: '#f9fafb',
                                    borderWidth: 2,
                                    borderColor: '#e5e7eb',
                                    borderRadius: 14,
                                    paddingHorizontal: 18,
                                    paddingVertical: 18,
                                }}
                            >
                                <HStack className="items-center gap-3">
                                    <View
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderWidth: 1,
                                            borderColor: '#030213',
                                            borderRadius: 4,
                                            backgroundColor: checkedIngredients[index] ? '#030213' : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {checkedIngredients[index] && (
                                            <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
                                        )}
                                    </View>
                                    <Box className="flex-1">
                                        <HStack className="items-center justify-between">
                                            <Text className="text-base text-neutral-950">
                                                {ingredient.name}
                                            </Text>
                                            <Text className="text-base text-neutral-600">
                                                {(ingredient.amount ?? 0) * servings} {ingredient.unit ?? ''}
                                            </Text>
                                        </HStack>
                                    </Box>
                                </HStack>
                            </Pressable>
                        ))}
                    </Box>
                </Box>

                {/* Instructions Section */}
                <Box className="mb-6">
                    <Heading level="h5" className="text-neutral-950 mb-4">Instructions</Heading>
                    <Box className="gap-3">
                        {instructions.map((instruction, index) => (
                            <HStack key={index} className="gap-3 items-start">
                                <View
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        backgroundColor: '#009689',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                                        {instruction.step}
                                    </Text>
                                </View>
                                <Box className="flex-1">
                                    <Text className="text-base text-neutral-950 leading-6">
                                        {instruction.description}
                                    </Text>
                                </Box>
                            </HStack>
                        ))}
                    </Box>
                </Box>

                {/* Fun Fact Section */}
                <Box
                    className="mb-6 rounded-2xl px-4 py-4"
                    style={{
                        backgroundColor: '#f0fdfa',
                        borderWidth: 1,
                        borderColor: '#96f7e4',
                    }}
                >
                    <HStack className="items-start gap-3">
                        <Info size={20} color="#0b4f4a" />
                        <Box className="flex-1">
                            <Text className="text-base font-semibold text-[#0b4f4a] mb-2">
                                Fun Fact
                            </Text>
                            <Text className="text-sm text-[#005f5a] leading-5">
                                {dummyData.funFact}
                            </Text>
                        </Box>
                    </HStack>
                </Box>

                {/* Action Buttons */}
                <HStack className="gap-3">
                    <Pressable
                        className="flex-1 rounded-lg"
                        style={{
                            backgroundColor: '#009689',
                            paddingVertical: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Text className="text-white text-sm font-semibold">Log This Drink</Text>
                    </Pressable>
                    <Pressable
                        className="flex-1 rounded-lg"
                        style={{
                            backgroundColor: '#fff',
                            borderWidth: 1,
                            borderColor: '#009689',
                            paddingVertical: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Text className="text-[#009689] text-sm font-semibold">Share Recipe</Text>
                    </Pressable>
                </HStack>
            </ScrollView>
        </Box>
    );
};
