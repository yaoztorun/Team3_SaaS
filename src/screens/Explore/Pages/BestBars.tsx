import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { PageHeader } from '../components/PageHeader';
import { HStack } from '@/src/components/ui/hstack';
import { Pressable } from '@/src/components/ui/pressable';
import { Star, MapPin } from 'lucide-react-native';

type Bar = {
    id: string;
    name: string;
    rating: number;
    distance: string;
    popularDrinks: string[];
    location: string;
};

const bars: Bar[] = [
    {
        id: '1',
        name: 'The Tipsy Fox',
        rating: 4.8,
        distance: '0.8km',
        popularDrinks: ['Mojito', 'Old Fashioned', 'Margarita'],
        location: '123 Main Street'
    },
    {
        id: '2',
        name: 'Cloud 9 Lounge',
        rating: 4.6,
        distance: '1.2km',
        popularDrinks: ['Cosmopolitan', 'Martini', 'Negroni'],
        location: '456 Park Avenue'
    },
    {
        id: '3',
        name: 'The Vintage Bar',
        rating: 4.9,
        distance: '1.5km',
        popularDrinks: ['Manhattan', 'Whiskey Sour', 'Gin & Tonic'],
        location: '789 Oak Street'
    }
];

const BarCard = ({ bar }: { bar: Bar }) => (
    <Pressable className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <HStack className="justify-between items-start mb-2">
            <Text className="text-xl font-semibold">{bar.name}</Text>
            <HStack className="items-center space-x-1">
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text className="text-sm font-medium">{bar.rating}</Text>
            </HStack>
        </HStack>
        
        <HStack className="items-center space-x-1 mb-3">
            <MapPin size={16} color="#666666" />
            <Text className="text-sm text-gray-600">{bar.location} • {bar.distance}</Text>
        </HStack>

        <Box>
            <Text className="text-sm font-medium mb-1">Popular drinks:</Text>
            <Text className="text-sm text-gray-600">
                {bar.popularDrinks.join(' • ')}
            </Text>
        </Box>
    </Pressable>
);

export const BestBars = () => {
    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="Best Bars" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
            >
                {bars.map((bar) => (
                    <BarCard key={bar.id} bar={bar} />
                ))}
            </ScrollView>
        </Box>
    );
}; 