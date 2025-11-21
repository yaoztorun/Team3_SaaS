import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { ScrollView, Image, TouchableOpacity } from 'react-native';
import { HStack } from '@/src/components/ui/hstack';
import { SearchBar, FilterChip } from '@/src/components/global';
import { useNavigation } from '@react-navigation/native';

type EventType = 'All' | 'Workshop' | 'Tasting' | 'Party' | 'Happy Hour' | 'Class';

interface Event {
    id: number;
    type: EventType;
    title: string;
    location: string;
    date: string;
    time: string;
    price: number | 'Free';
    image: string;
    attendees: number;
    maxAttendees?: number;
}

const sampleEvents: Event[] = [
    {
        id: 1,
        type: 'Workshop',
        title: 'Craft Cocktail Night',
        location: 'The Mixology Lab',
        date: 'Tomorrow',
        time: '6:00 PM',
        price: 15,
        image: 'placeholder.jpg',
        attendees: 23,
        maxAttendees: 50
    },
    {
        id: 2,
        type: 'Happy Hour',
        title: 'Mojito Happy Hour',
        location: 'Tropical Nights Bar',
        date: 'Saturday',
        time: '7:00 PM - 10:00 PM',
        price: 'Free',
        image: 'placeholder.jpg',
        attendees: 45,
        maxAttendees: 80
    },
    {
        id: 3,
        type: 'Tasting',
        title: 'Whiskey Tasting Experience',
        location: 'Whiskey Den',
        date: 'Oct 20',
        time: '5:30 PM',
        price: 45,
        image: 'placeholder.jpg',
        attendees: 12,
        maxAttendees: 20
    },
    {
        id: 4,
        type: 'Party',
        title: 'Rooftop Sunset Party',
        location: 'Sky Lounge',
        date: 'Oct 21',
        time: '5:30 PM',
        price: 30,
        image: 'placeholder.jpg',
        attendees: 67,
        maxAttendees: 100
    },
    {
        id: 5,
        type: 'Class',
        title: 'Bartending 101 Class',
        location: 'Cocktail Academy',
        date: 'Oct 25',
        time: '2:00 PM - 5:00 PM',
        price: 89,
        image: 'placeholder.jpg',
        attendees: 8,
        maxAttendees: 15
    }
];

export const UpcomingEvents = () => {
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState<EventType>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filterTypes: EventType[] = ['All', 'Workshop', 'Tasting', 'Party', 'Happy Hour', 'Class'];

    const filteredEvents = sampleEvents.filter(event => 
        (selectedType === 'All' || event.type === selectedType) &&
        (searchQuery === '' || event.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Upcoming Events" showBack onBackPress={() => navigation.goBack()} />
            
            {/* Search Bar */}
            <Box className="px-4 pt-2 pb-1">
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search events..."
                />
            </Box>

            {/* Filter Categories */}
            <Box className="bg-white border-b border-neutral-200">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-4 py-2"
                    contentContainerStyle={{ flexGrow: 0 }}
                >
                    <Box className="flex-row gap-2">
                        {filterTypes.map((type) => (
                            <FilterChip
                                key={type}
                                label={type}
                                selected={selectedType === type}
                                onPress={() => setSelectedType(type)}
                            />
                        ))}
                      </Box>
                </ScrollView>
            </Box>

            <ScrollView className="flex-1 px-4">
                <Box className="pt-2 space-y-3">
                    {filteredEvents.map((event) => (
                        <TouchableOpacity
                            key={event.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm"
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{ uri: event.image }}
                                className="w-full h-40"
                                resizeMode="cover"
                            />
                            <Box className="absolute top-3 left-3">
                                <Box className="px-2 py-1 rounded-full bg-[#00BBA7]">
                                    <Text className="text-white text-xs font-medium">{event.type}</Text>
                                </Box>
                            </Box>
                            <Box className="p-3 space-y-1.5">
                                <HStack className="justify-between items-start">
                                    <Text className="text-base font-medium text-neutral-900">{event.title}</Text>
                                    <Text className="text-base font-medium text-neutral-900">
                                        {typeof event.price === 'number' ? `$${event.price}` : event.price}
                                    </Text>
                                </HStack>
                                <HStack space="xs" className="items-center">
                                    <Text className="text-sm text-neutral-600">📍</Text>
                                    <Text className="text-sm text-neutral-600">{event.location}</Text>
                                </HStack>
                                <HStack space="xs" className="items-center">
                                    <Text className="text-sm text-neutral-600">📅</Text>
                                    <Text className="text-sm text-neutral-600">{event.date} · {event.time}</Text>
                                </HStack>
                                <HStack className="justify-between items-center pt-2 border-t border-neutral-100">
                                    <Text className="text-xs text-neutral-600">
                                        {event.attendees} / {event.maxAttendees} attending
                                    </Text>
                                    <TouchableOpacity
                                        className="px-3 py-1.5 rounded-lg bg-[#00BBA7]"
                                    >
                                        <Text className="text-white text-sm font-medium">RSVP</Text>
                                    </TouchableOpacity>
                                </HStack>
                            </Box>
                        </TouchableOpacity>
                    ))}
                </Box>
            </ScrollView>
        </Box>
    );
};