import React, { useState, useEffect } from 'react';
import { ScrollView, Linking, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { ArrowLeft, ExternalLink, Package } from 'lucide-react-native';
import { PrimaryButton, Heading } from '@/src/components/global';
import { fetchShopItemById, DBShopItem } from '@/src/api/shop';
import { ANALYTICS_EVENTS, posthogCapture } from '@/src/analytics';

export const ItemDetail = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { itemId } = route.params as { itemId: string };
    const [item, setItem] = useState<DBShopItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadItem();
    }, [itemId]);

    const loadItem = async () => {
        setLoading(true);
        const data = await fetchShopItemById(itemId);
        setItem(data);
        setLoading(false);
        
        // Track item view for revenue analytics
        if (data) {
            posthogCapture(ANALYTICS_EVENTS.SHOP_ITEM_VIEWED, {
                item_id: data.id,
                item_name: data.name,
                item_category: data.category,
                item_price: data.price,
                store_url: data.store_url,
            });
        }
    };

    const handleBuyNow = () => {
        if (item?.store_url) {
            // Track revenue event - user clicked to buy
            posthogCapture(ANALYTICS_EVENTS.SHOP_ITEM_CLICKED, {
                item_id: item.id,
                item_name: item.name,
                item_category: item.category,
                item_price: item.price,
                store_url: item.store_url,
            });
            
            Linking.openURL(item.store_url);
        }
    };

    if (loading) {
        return (
            <Box className="flex-1 bg-neutral-50 items-center justify-center">
                <ActivityIndicator size="large" color="#8B5CF6" />
            </Box>
        );
    }

    if (!item) {
        return (
            <Box className="flex-1 bg-neutral-50 items-center justify-center">
                <Text className="text-gray-500">Item not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                    <Text className="text-primary-500">Go Back</Text>
                </TouchableOpacity>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-neutral-50">
            {/* Header */}
            <Box className="bg-white px-4 py-3 border-b border-gray-200">
                <HStack className="items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <ArrowLeft size={24} color="#333" />
                    </TouchableOpacity>
                    <Heading level="h3" className="flex-1">Product Details</Heading>
                </HStack>
            </Box>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Image */}
                <Box className="bg-white rounded-xl overflow-hidden mb-4 items-center justify-center h-64">
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    ) : (
                        <Box className="items-center justify-center h-full">
                            <Package size={80} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-4">No Image Available</Text>
                        </Box>
                    )}
                </Box>

                {/* Product Info Card */}
                <Box className="bg-white rounded-xl p-4 mb-4">
                    <Heading level="h3" className="mb-2">{item.name || 'Unnamed Item'}</Heading>
                    
                    {item.category && (
                        <Box className="bg-[#00BBA7]/10 self-start rounded-full px-3 py-1 mb-3">
                            <Text className="text-[#00BBA7] text-sm font-medium">{item.category}</Text>
                        </Box>
                    )}

                    <Text className="text-3xl font-bold text-primary-600 mb-4">
                        €{item.price?.toFixed(2) || '0.00'}
                    </Text>

                    {/* Description */}
                    {item.description && (
                        <Box className="mb-4">
                            <Heading level="h6" className="mb-2">Description</Heading>
                            <Text className="text-gray-700 leading-6">{item.description}</Text>
                        </Box>
                    )}
                </Box>

                {/* Purchase Button */}
                {item.store_url && (
                    <Box className="mb-4">
                        <PrimaryButton
                            title="Buy Now"
                            onPress={handleBuyNow}
                        />
                        <Text className="text-xs text-gray-500 text-center mt-2">
                            Opens in external browser
                        </Text>
                    </Box>
                )}

                {!item.store_url && (
                    <Box className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <Text className="text-yellow-800 text-center">
                            Purchase link not available for this item
                        </Text>
                    </Box>
                )}
            </ScrollView>
        </Box>
    );
};
