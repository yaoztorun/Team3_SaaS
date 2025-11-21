import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@/src/components/ui/box';
import { PageHeader } from '../components/PageHeader';
import { HStack } from '@/src/components/ui/hstack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { ChevronDown } from 'lucide-react-native';
import { PrimaryButton, SearchBar, FilterChip } from '@/src/components/global';
import { fetchShopItems, DBShopItem } from '@/src/api/shop';

type RootStackParamList = {
    ItemDetail: { itemId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ProductCardProps = {
    item: DBShopItem;
    onPress: () => void;
};

const ProductCard = ({ item, onPress }: ProductCardProps) => (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-xl p-3 mb-4 shadow-sm w-[48%]" style={{ height: 300 }}>
        <Box className="h-36 bg-neutral-100 rounded-lg mb-3 items-center justify-center overflow-hidden">
            {item.image ? (
                <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
            ) : (
                <Text className="text-gray-400">No Image</Text>
            )}
        </Box>
        <Text className="font-semibold" numberOfLines={2} style={{ minHeight: 40 }}>{item.name || 'Unnamed Item'}</Text>
        {item.category && (
            <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>{item.category}</Text>
        )}
        <Box className="mt-2">
            <Text className="font-bold text-lg">€{item.price?.toFixed(2) || '0.00'}</Text>
        </Box>
        <Box className="mt-2">
            <PrimaryButton
                title="View"
                onPress={onPress}
            />
        </Box>
    </TouchableOpacity>
);

export const Shop = () => {
    const navigation = useNavigation<NavigationProp>();
    const [items, setItems] = useState<DBShopItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<'all' | 'under20' | '20to50' | 'over50'>('all');
    const [showPriceFilter, setShowPriceFilter] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const data = await fetchShopItems();
                if (mounted) setItems(data);
            } catch (e) {
                console.warn('Failed to load shop items', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        items.forEach(item => {
            if (item.category) cats.add(item.category);
        });
        return Array.from(cats).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Search filter
            if (searchQuery && !item.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Category filter - if categories are selected, item must match one of them
            if (selectedCategories.length > 0 && !selectedCategories.includes(item.category || '')) {
                return false;
            }

            // Price filter
            if (item.price === null) return priceRange === 'all';
            if (priceRange === 'under20' && item.price >= 20) return false;
            if (priceRange === '20to50' && (item.price < 20 || item.price > 50)) return false;
            if (priceRange === 'over50' && item.price <= 50) return false;

            return true;
        });
    }, [items, searchQuery, selectedCategories, priceRange]);

    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="Shop" />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Search bar */}
                <Box className="mb-3">
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search products..."
                    />
                </Box>

                {/* Category Filters */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
                    className="mb-3"
                >
                    {categories.map((cat) => (
                        <FilterChip
                            key={cat}
                            label={cat}
                            selected={selectedCategories.includes(cat)}
                            onPress={() => {
                                setSelectedCategories(prev => 
                                    prev.includes(cat) 
                                        ? prev.filter(c => c !== cat)
                                        : [...prev, cat]
                                );
                            }}
                        />
                    ))}
                </ScrollView>

                {/* Price Filter */}
                <Box className="mb-3">
                    <TouchableOpacity
                        onPress={() => setShowPriceFilter(!showPriceFilter)}
                        className="bg-white rounded-lg px-4 py-3 flex-row items-center justify-between"
                    >
                        <Text className="text-sm font-medium">
                            {priceRange === 'all' ? 'All Prices' :
                             priceRange === 'under20' ? 'Under €20' :
                             priceRange === '20to50' ? '€20 - €50' : 'Over €50'}
                        </Text>
                        <ChevronDown size={16} color="#666" />
                    </TouchableOpacity>
                </Box>

                {/* Price dropdown */}
                {showPriceFilter && (
                    <Box className="bg-white rounded-lg mb-3 p-2">
                        {[
                            { value: 'all', label: 'All Prices' },
                            { value: 'under20', label: 'Under €20' },
                            { value: '20to50', label: '€20 - €50' },
                            { value: 'over50', label: 'Over €50' },
                        ].map(option => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => {
                                    setPriceRange(option.value as any);
                                    setShowPriceFilter(false);
                                }}
                                className="py-2 px-3"
                            >
                                <Text className={priceRange === option.value ? 'font-semibold' : ''}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </Box>
                )}

                {/* Results count */}
                <Text className="text-sm text-gray-600 mb-3">
                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </Text>

                {/* Product grid */}
                {loading ? (
                    <Text className="text-center mt-10">Loading...</Text>
                ) : filteredItems.length === 0 ? (
                    <Text className="text-center mt-10 text-gray-500">No items found</Text>
                ) : (
                    <Box className="flex-row flex-wrap justify-between">
                        {filteredItems.map((item) => (
                            <ProductCard
                                key={item.id}
                                item={item}
                                onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                            />
                        ))}
                    </Box>
                )}
            </ScrollView>
        </Box>
    );
};
