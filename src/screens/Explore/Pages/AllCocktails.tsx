import React, { useMemo, useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { PageHeader } from '../components/PageHeader';
import { FlatList, TextInput, TouchableOpacity, Image, View } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';

interface Cocktail {
    id: string;
    title: string;
    rating: number;
    ingredients: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    image: string;
}

const sampleCocktails: Cocktail[] = [
    { id: '1', title: 'Mai Tai', rating: 4.8, ingredients: 5, difficulty: 'Medium', image: 'placeholder.jpg' },
    { id: '2', title: 'Mojito', rating: 4.7, ingredients: 6, difficulty: 'Easy', image: 'placeholder.jpg' },
    { id: '3', title: 'Margarita', rating: 4.9, ingredients: 4, difficulty: 'Easy', image: 'placeholder.jpg' },
    { id: '4', title: 'Old Fashioned', rating: 4.9, ingredients: 4, difficulty: 'Easy', image: 'placeholder.jpg' },
    { id: '5', title: 'Whiskey Sour', rating: 4.7, ingredients: 5, difficulty: 'Easy', image: 'placeholder.jpg' },
    { id: '6', title: 'Cosmopolitan', rating: 4.6, ingredients: 5, difficulty: 'Medium', image: 'placeholder.jpg' },
    { id: '7', title: 'Piña Colada', rating: 4.8, ingredients: 4, difficulty: 'Easy', image: 'placeholder.jpg' },
    { id: '8', title: 'Negroni', rating: 4.5, ingredients: 3, difficulty: 'Easy', image: 'placeholder.jpg' },
];

export const AllCocktails = () => {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Tropical', 'Classic', 'Modern', 'Whiskey'];

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sampleCocktails.filter(c => {
            const matchesQuery = !q || c.title.toLowerCase().includes(q);
            const matchesCategory = activeCategory === 'All' || (activeCategory === 'Whiskey' ? c.title.toLowerCase().includes('whiskey') : true);
            return matchesQuery && matchesCategory;
        });
    }, [query, activeCategory]);

    const renderCard = ({ item }: { item: Cocktail }) => (
        <TouchableOpacity className="flex-1 m-2 bg-white rounded-xl overflow-hidden" activeOpacity={0.8}>
            <View className="h-36 bg-neutral-200 items-center justify-center">
                <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
            </View>
            <Box className="p-3">
                <Text className="text-sm font-medium text-neutral-900">{item.title}</Text>
                <HStack className="justify-between items-center mt-2">
                    <Text className="text-xs text-neutral-600">⭐ {item.rating.toFixed(1)}</Text>
                    <Text className="text-xs bg-[#F3F3F5] px-2 py-1 rounded-full text-neutral-600">{item.difficulty}</Text>
                </HStack>
                <Text className="text-xs text-neutral-500 mt-2">{item.ingredients} ingredients</Text>
            </Box>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <Box className="px-4 pt-3 pb-2">
            <Box className="flex-row items-center bg-[#F3F3F5] rounded-lg px-3 py-2">
                <TextInput
                    className="flex-1 text-sm text-neutral-900"
                    placeholder="Search cocktails..."
                    placeholderTextColor="#6A7282"
                    value={query}
                    onChangeText={setQuery}
                />
            </Box>

            <ScrollViewHorizontal categories={categories} active={activeCategory} onChange={setActiveCategory} />
        </Box>
    );

    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="All Cocktails" />
            <FlatList
                data={filtered}
                keyExtractor={i => i.id}
                renderItem={renderCard}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListHeaderComponent={ListHeader}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8 }}
            />
        </Box>
    );
};

// small horizontal scroll component implemented inline to reuse styling
const ScrollViewHorizontal = ({ categories, active, onChange }: { categories: string[]; active: string; onChange: (v: string) => void }) => {
    return (
        <View className="mt-3">
            <View style={{ flexDirection: 'row' }}>
                {categories.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => onChange(cat)} className={`h-7 min-w-[60px] items-center justify-center px-3 rounded-full mr-2 ${active === cat ? 'bg-[#00BBA7]' : 'bg-[#F3F3F5]'}`}>
                        <Text className={`text-sm ${active === cat ? 'text-white' : 'text-neutral-600'}`}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
