import React, { useState, useEffect } from 'react';
import { ScrollView, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { ArrowLeft, Heart, Star, Clock, Info, Users, Minus, Plus } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DBCocktail } from '@/src/api/cocktail';
import { Heading } from '@/src/components/global';
import { shareCocktailSystemSheet } from '@/src/utils/share';
import { supabase } from '@/src/lib/supabase';

type RootStackParamList = {
    CocktailDetail: { cocktail: DBCocktail; returnTo?: string };
};

type CocktailDetailRouteProp = RouteProp<RootStackParamList, 'CocktailDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300.png?text=Cocktail';

// Dummy data for fields not in DB
const getDummyData = (cocktailName: string) => ({
    rating: 4.8,
    reviewCount: 2847,
    prepTime: '5 min',
});

export const CocktailDetail = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<CocktailDetailRouteProp>();
    const { cocktail, returnTo } = route.params;

    const [servings, setServings] = useState(1);
    const [isFavorited, setIsFavorited] = useState(false);
    const [checkedIngredients, setCheckedIngredients] = useState<{ [key: number]: boolean }>({});
    const [funFact, setFunFact] = useState<string | null>(cocktail.fun_fact || null);
    const [loadingFunFact, setLoadingFunFact] = useState(false);
    const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasFetchedFromDB, setHasFetchedFromDB] = useState(false);

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

    // Fetch the latest cocktail data from database to get updated fun_fact
    useEffect(() => {
        const fetchLatestCocktail = async () => {
            console.log('------------ DB FETCH START ------------');
            console.log(`Fetching cocktail: ${cocktail.name} (${cocktail.id})`);

            try {
                const { data, error } = await supabase
                    .from('Cocktail')
                    .select('*')
                    .eq('id', cocktail.id)
                    .single();

                if (error) {
                    console.error('DB fetch error:', error);
                    setHasFetchedFromDB(true);
                    return;
                }

                if (data?.fun_fact) {
                    console.log('✓ Found fun_fact in DB:', data.fun_fact.substring(0, 80) + '...');
                    setFunFact(data.fun_fact);
                } else {
                    console.log('✗ No fun_fact in DB');
                }

                setHasFetchedFromDB(true);
            } catch (error) {
                console.error('DB fetch exception:', error);
                setHasFetchedFromDB(true);
            }

            console.log('------------ DB FETCH END ------------');
        };

        fetchLatestCocktail();
    }, [cocktail.id]);

    // Generate fun fact if not already in database
    useEffect(() => {
        // Wait for DB fetch to complete before deciding to generate
        if (!hasFetchedFromDB) {
            console.log('Waiting for DB fetch...');
            return;
        }

        if (isGenerating) {
            return;
        }

        if (!hasAttemptedGeneration && !funFact) {
            console.log('------------ GENERATION START ------------');
            console.log('No fun fact found, starting generation...');
            setHasAttemptedGeneration(true);
            generateFunFact();
        } else if (funFact) {
            console.log('Fun fact already available, skipping generation');
        }
    }, [funFact, isGenerating, hasFetchedFromDB]);

    const generateFunFact = async () => {
        if (isGenerating) {
            console.log('Generation already in progress, skipping');
            return;
        }

        console.log(`Generating fun fact for: ${cocktail.name}`);
        setIsGenerating(true);
        setLoadingFunFact(true);

        try {
            // Format ingredients for the prompt
            const ingredientsList = ingredients
                .map(ing => `${ing.name} (${ing.amount} ${ing.unit || ''})`.trim())
                .join(', ');

            const prompt = `Generate ONE surprising or interesting fact about the "${cocktail.name}" cocktail. Make it fun and casual, like you're telling a friend at a bar.

Ingredients: ${ingredientsList}

Pick ONE and make it conversational:
- When/where/who invented it (e.g., "Created in 1987 by bartender Dale DeGroff at the Rainbow Room")
- Pop culture moment (e.g., "James Bond ordered this in Casino Royale" or "Became famous after appearing in Sex and the City")
- Surprising name origin (e.g., "Named after the bartender's pet cat" or "Originally called something completely different")
- A fun historical tidbit (e.g., "Was Hemingway's favorite drink in Cuba" or "Banned in the US until 1995")
- Unexpected connection (e.g., "Despite the name, has no actual whiskey in it")

Rules:
- Write like you're chatting with a friend, not writing an encyclopedia
- 1-2 short sentences max
- Make it surprising or interesting, not technical
- NO words like: "structurally", "differentiates", "application", "components", "ratio"
- NO boring flavor descriptions
- Be specific with names/dates/places when you can`;

            const { data, error } = await supabase.functions.invoke('gemini-chat', {
                body: { message: prompt }
            });

            if (error || !data?.response) {
                console.error('Gemini error:', error);
                setFunFact(`${cocktail.name} is crafted from ${ingredients.length} carefully selected ingredients.`);
                return;
            }

            const generatedFact = data.response.trim();
            console.log('✓ Generated:', generatedFact.substring(0, 80) + '...');
            setFunFact(generatedFact);

            // Save to database
            try {
                console.log('Saving to DB...');
                const { error: updateError } = await supabase
                    .from('Cocktail')
                    .update({ fun_fact: generatedFact })
                    .eq('id', cocktail.id);

                if (updateError) {
                    console.error('DB update error:', updateError);
                } else {
                    console.log('✓ Saved to DB');
                }
            } catch (dbError) {
                console.error('DB save exception:', dbError);
            }
        } catch (error) {
            console.error('Generation exception:', error);
            setFunFact(`${cocktail.name} is crafted from ${ingredients.length} carefully selected ingredients.`);
        } finally {
            setLoadingFunFact(false);
            setIsGenerating(false);
            console.log('------------ GENERATION END ------------');
        }
    };

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
                        onPress={() => {
                            if (returnTo === 'Profile') {
                                // Navigate back to Profile tab
                                (navigation as any).navigate('Profile');
                            } else {
                                navigation.goBack();
                            }
                        }}
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
                    <Heading level="h3" className="mb-3">
                        {cocktail.name ?? 'Unnamed Cocktail'}
                    </Heading>

                    {/* Creator Info - Show if it's a user-created cocktail */}
                    {cocktail.origin_type === 'user' && (cocktail as any).Profile && (
                        <Box className="mb-3">
                            <HStack className="items-center gap-2">
                                <Text className="text-sm text-neutral-600">Created by</Text>
                                <Text className="text-sm font-semibold text-primary-500">
                                    {((cocktail as any).Profile.full_name) || 'Unknown User'}
                                </Text>
                            </HStack>
                        </Box>
                    )}

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
                    <Heading level="h5" className="mb-4">Ingredients</Heading>
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
                    <Heading level="h5" className="mb-4">Instructions</Heading>
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
                            {loadingFunFact ? (
                                <HStack className="items-center gap-2">
                                    <ActivityIndicator size="small" color="#0b4f4a" />
                                    <Text className="text-sm text-[#005f5a]">Generating fun fact...</Text>
                                </HStack>
                            ) : (
                                <Text className="text-sm text-[#005f5a] leading-5">
                                    {funFact || `${cocktail.name} is a carefully crafted cocktail.`}
                                </Text>
                            )}
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
                        onPress={() => {
                            // Navigate to Add screen with pre-filled cocktail info
                            (navigation as any).navigate('Add', {
                                prefilledCocktailId: cocktail.id,
                                prefilledCocktailName: cocktail.name || ''
                            });
                        }}
                    >
                        <Text className="text-white text-sm font-semibold">Post This Drink</Text>
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
                        onPress={() => shareCocktailSystemSheet(cocktail.id, cocktail.name || undefined)}
                    >
                        <Text className="text-[#009689] text-sm font-semibold">Share Recipe</Text>
                    </Pressable>
                </HStack>
            </ScrollView>
        </Box>
    );
};
