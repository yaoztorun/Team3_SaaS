import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, Image, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { HStack } from '@/src/components/ui/hstack';
import { MapPin, Star } from 'lucide-react-native';
import { fetchLocations, DBLocation } from '@/src/api/location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar, Heading } from '@/src/components/global';

type RootStackParamList = {
    BarDetail: { bar: DBLocation };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x200.png?text=Bar';

const BarCard = ({ bar, onPress }: { bar: DBLocation; onPress: () => void }) => {
    const address = [bar.street_name, bar.street_nr, bar.city, bar.country]
        .filter(Boolean)
        .join(' ');
    const imageUri = bar.image_url || PLACEHOLDER_IMAGE;

    return (
        <TouchableOpacity
            className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
            activeOpacity={0.85}
            onPress={onPress}
        >
            <View className="bg-neutral-200 items-center justify-center" style={{ height: 150 }}>
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
            <Box className="p-4">
                <HStack className="items-center justify-between mb-2">
                    <Heading level="h4" className="flex-1">{bar.name || 'Unnamed Bar'}</Heading>
                    {bar.rating !== null && bar.rating !== undefined && (
                        <HStack className="items-center ml-2">
                            <Star size={16} color="#fbbf24" fill="#fbbf24" />
                            <Text className="text-sm font-semibold text-gray-700 ml-1">
                                {bar.rating.toFixed(1)}
                            </Text>
                        </HStack>
                    )}
                </HStack>
                <HStack className="items-center mb-2">
                    <MapPin size={16} color="#666666" />
                    <Text className="text-sm text-gray-600 ml-1">{address || 'Address not available'}</Text>
                </HStack>
                {bar.description && (
                    <Text className="text-sm text-gray-600" numberOfLines={2}>
                        {bar.description}
                    </Text>
                )}
            </Box>
        </TouchableOpacity>
    );
};

export const BestBars = () => {
    const [bars, setBars] = useState<DBLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation<NavigationProp>();

    const filteredBars = useMemo(() => {
        if (!searchQuery.trim()) return bars;
        const query = searchQuery.toLowerCase();
        return bars.filter(bar => 
            bar.name?.toLowerCase().includes(query) ||
            bar.city?.toLowerCase().includes(query) ||
            bar.country?.toLowerCase().includes(query)
        );
    }, [bars, searchQuery]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const data = await fetchLocations();
                if (mounted) setBars(data);
            } catch (e) {
                console.warn('Failed to load bars', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Best Bars" showBack onBackPress={() => navigation.goBack()} />
            <Box className="px-4 pt-4 pb-2">
                <SearchBar 
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search bars by name or location..."
                />
            </Box>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
            >
                {loading && <Text className="text-gray-600 mb-4">Loading bars...</Text>}
                {!loading && filteredBars.length === 0 && (
                    <Text className="text-gray-600">{searchQuery ? 'No bars match your search' : 'No bars found'}</Text>
                )}
                {filteredBars.map((bar) => (
                    <BarCard
                        key={bar.id}
                        bar={bar}
                        onPress={() => navigation.navigate('BarDetail', { bar })}
                    />
                ))}
            </ScrollView>
        </Box>
    );
}; 