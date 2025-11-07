import React from 'react';
import { ScrollView, Image } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { PageHeader } from '../components/PageHeader';
import { HStack } from '@/src/components/ui/hstack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Button } from '@/src/components/ui/button';
import { Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';
import { Pressable as RNPressable } from 'react-native';

type Product = {
    id: string;
    name: string;
    price: string;
    rating: number;
    vendor: string;
    image?: any;
};

const products: Product[] = [
    { id: 'p1', name: 'Cocktail Shaker Set', price: '€24.99', rating: 4.7, vendor: 'BarTools' },
    { id: 'p2', name: 'Premium Whiskey Glasses (2)', price: '€19.50', rating: 4.6, vendor: 'GlassCo' },
    { id: 'p3', name: 'Mixology Bitters Pack', price: '€12.00', rating: 4.3, vendor: 'BittersLab' },
    { id: 'p4', name: 'Citrus Zester', price: '€8.99', rating: 4.4, vendor: 'KitchenPro' },
    { id: 'p5', name: 'Bar Spoon (Gold)', price: '€6.50', rating: 4.2, vendor: 'BarTools' },
    { id: 'p6', name: 'Cocktail Recipe Book', price: '€14.00', rating: 4.8, vendor: 'Bookshelf' },
];

const ProductCard = ({ product }: { product: Product }) => (
    <Box className="bg-white rounded-xl p-3 mb-4 shadow-sm w-[48%]">
        <Box className="h-36 bg-neutral-100 rounded-lg mb-3 items-center justify-center">
            {/* Placeholder image */}
            <Text className="text-gray-400">Image</Text>
        </Box>
        <Text className="font-semibold">{product.name}</Text>
        <Text className="text-sm text-gray-600">{product.vendor}</Text>
        <HStack className="items-center justify-between mt-2">
            <HStack className="items-center">
                <Star size={14} color="#FFD700" />
                <Text className="ml-1 text-sm">{product.rating}</Text>
            </HStack>
            <Text className="font-semibold">{product.price}</Text>
        </HStack>
        <RNPressable onPress={() => {}} style={{ marginTop: 12 }}>
            <LinearGradient
                colors={[colors.primary[400], colors.primary[600]]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text className="text-white font-semibold">Add</Text>
            </LinearGradient>
        </RNPressable>
    </Box>
);

export const Shop = () => {
    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="Shop" />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Search / filter bar */}
                <HStack className="bg-white rounded-full px-4 py-2 mb-4 items-center">
                    <Text className="text-gray-500">Search products...</Text>
                </HStack>

                {/* Product grid - two columns */}
                <Box className="flex-row flex-wrap justify-between">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </Box>
            </ScrollView>
        </Box>
    );
};
