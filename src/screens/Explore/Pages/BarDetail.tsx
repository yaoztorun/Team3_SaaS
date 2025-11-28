import React from 'react';
import { ScrollView, Image, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { HStack } from '@/src/components/ui/hstack';
import { MapPin, Star } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { DBLocation } from '@/src/api/location';

type RootStackParamList = {
    BarDetail: { bar: DBLocation };
};

type BarDetailRouteProp = RouteProp<RootStackParamList, 'BarDetail'>;

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400.png?text=Bar';

export const BarDetail = () => {
    const route = useRoute<BarDetailRouteProp>();
    const navigation = useNavigation();
    const { bar } = route.params;

    const address = [bar.street_name, bar.street_nr, bar.city, bar.country]
        .filter(Boolean)
        .join(', ');
    const imageUri = bar.image_url || PLACEHOLDER_IMAGE;

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title={bar.name || 'Bar Details'} showBack onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="bg-neutral-200 items-center justify-center" style={{ height: 250 }}>
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>

                <Box className="p-4">
                    <Text className="text-2xl font-bold mb-2">{bar.name}</Text>

                    {bar.rating !== null && bar.rating !== undefined && (
                        <HStack className="items-center mb-4">
                            <Star size={20} color="#fbbf24" fill="#fbbf24" />
                            <Text className="text-lg font-semibold text-gray-700 ml-2">
                                {bar.rating.toFixed(1)}
                            </Text>
                            <Text className="text-sm text-gray-500 ml-1">/5</Text>
                        </HStack>
                    )}

                    {address && (
                        <Box className="mb-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-1">Address</Text>
                            <HStack className="items-start">
                                <MapPin size={18} color="#666666" style={{ marginTop: 2 }} />
                                <Text className="text-base text-gray-600 ml-2 flex-1">{address}</Text>
                            </HStack>
                        </Box>
                    )}

                    {bar.description && (
                        <Box className="mb-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-1">About</Text>
                            <Text className="text-base text-gray-600 leading-6">{bar.description}</Text>
                        </Box>
                    )}

                </Box>
            </ScrollView>
        </Box>
    );
};
