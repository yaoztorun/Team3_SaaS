import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { MapPin, X, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { TextInputField } from './TextInputField';
import fetchLocations from '@/src/api/location';
import { fetchUserLocations, createUserLocation, type DBUserLocation } from '@/src/api/userLocations';
import { Heading } from './Heading';

interface LocationSelectorProps {
    selectedLocation: string;
    selectedLocationId: string | null;
    onLocationChange: (location: string, locationId: string | null) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    selectedLocation,
    selectedLocationId,
    onLocationChange,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [locationQuery, setLocationQuery] = useState(selectedLocation);
    const [locations, setLocations] = useState<Array<{ id: string; name: string | null; type: 'public' | 'personal' }>>([]);
    const [showAddPersonalLocation, setShowAddPersonalLocation] = useState(false);
    const [personalLocationLabel, setPersonalLocationLabel] = useState('');
    const [personalLocationStreet, setPersonalLocationStreet] = useState('');
    const [personalLocationHouseNr, setPersonalLocationHouseNr] = useState('');
    const [personalLocationCity, setPersonalLocationCity] = useState('');

    // Fetch locations on mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            const [publicLocations, userLocations] = await Promise.all([
                fetchLocations(),
                fetchUserLocations()
            ]);
            if (!mounted) return;

            const allLocations = [
                ...publicLocations.map(l => ({ id: l.id, name: l.name, type: 'public' as const })),
                ...userLocations.map(l => ({
                    id: l.id,
                    name: `${l.label} (${l.street} ${l.house_nr}, ${l.city})`,
                    type: 'personal' as const
                }))
            ];

            setLocations(allLocations);
        })();
        return () => { mounted = false };
    }, []);

    // Update local query when prop changes
    useEffect(() => {
        setLocationQuery(selectedLocation);
    }, [selectedLocation]);

    const handleSelectLocation = (name: string, id: string) => {
        setLocationQuery(name);
        onLocationChange(name, id);
        setIsModalVisible(false);
    };

    const handleSavePersonalLocation = async () => {
        const houseNr = parseInt(personalLocationHouseNr);
        if (isNaN(houseNr)) {
            console.error('Invalid house number');
            return;
        }

        const newLocation = await createUserLocation({
            label: personalLocationLabel,
            street: personalLocationStreet,
            house_nr: houseNr,
            city: personalLocationCity,
        });

        if (newLocation) {
            // Add to locations list
            const locationDisplay = `${newLocation.label} (${newLocation.street} ${newLocation.house_nr}, ${newLocation.city})`;
            setLocations(prev => [
                ...prev,
                { id: newLocation.id, name: locationDisplay, type: 'personal' }
            ]);

            // Select the new location
            onLocationChange(locationDisplay, newLocation.id);
        }

        // Close and reset
        setShowAddPersonalLocation(false);
        setIsModalVisible(false);
        setPersonalLocationLabel('');
        setPersonalLocationStreet('');
        setPersonalLocationHouseNr('');
        setPersonalLocationCity('');
    };

    return (
        <>
            <Box className="mb-6">
                <Text className="text-sm text-neutral-950 mb-2">Location *</Text>
                <Pressable
                    onPress={() => setIsModalVisible(true)}
                    className="bg-white border border-neutral-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
                >
                    <Box className="flex-row items-center">
                        <MapPin size={20} color="#6a7282" />
                        <Text className={`ml-3 text-base ${locationQuery ? 'text-neutral-900' : 'text-neutral-500'}`}>
                            {locationQuery || 'Select or add location...'}
                        </Text>
                    </Box>
                    <ChevronRight size={20} color="#9ca3af" />
                </Pressable>
            </Box>

            {/* Location Selection Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setIsModalVisible(false)}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '85%',
                        }}
                    >
                        <Box
                            style={{
                                flex: 1,
                                backgroundColor: '#f9fafb',
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header */}
                            <Box className="px-4 py-4 border-b border-gray-200 flex-row items-center justify-between">
                                <Heading level="h4" className="text-neutral-900">Select Location</Heading>
                                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                    <X size={24} color="#666" />
                                </TouchableOpacity>
                            </Box>

                            <ScrollView
                                style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={true}
                            >                                                        <Box className="px-4 py-4">
                                    {!showAddPersonalLocation ? (
                                        <>
                                            {/* Search Bar */}
                                            <Box className="mb-4">
                                                <Box className="bg-white rounded-lg border border-neutral-300 px-3 py-2 flex-row items-center">
                                                    <MapPin size={20} color="#6B7280" />
                                                    <TextInput
                                                        className="flex-1 ml-2 text-base"
                                                        placeholder="Search locations..."
                                                        value={locationQuery}
                                                        onChangeText={setLocationQuery}
                                                        placeholderTextColor="#9CA3AF"
                                                        style={{ outlineStyle: 'none' } as any}
                                                    />
                                                </Box>
                                            </Box>

                                            {/* Add Personal Location Button */}
                                            <TouchableOpacity
                                                onPress={() => setShowAddPersonalLocation(true)}
                                                className="bg-teal-50 border-2 border-dashed border-teal-500 rounded-xl p-4 mb-4 flex-row items-center justify-center"
                                            >
                                                <Text className="text-teal-600 font-semibold text-base">+ Add Personal Location</Text>
                                            </TouchableOpacity>

                                            {/* Location List */}
                                            <Box className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <Text className="px-4 py-3 text-sm font-semibold text-neutral-500 uppercase bg-gray-50">Available Locations</Text>
                                                {locations
                                                    .filter(l => l.name && (!locationQuery || l.name.toLowerCase().includes(locationQuery.toLowerCase())))
                                                    .map((l, idx, arr) => (
                                                        <TouchableOpacity
                                                            key={l.id}
                                                            className={`px-4 py-3 flex-row items-center justify-between ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                            onPress={() => handleSelectLocation(l.name || '', l.id)}
                                                        >
                                                            <Box className="flex-row items-center flex-1">
                                                                <MapPin size={18} color="#6B7280" />
                                                                <Box className="ml-3 flex-1">
                                                                    <Text className="text-base text-neutral-900">{l.name}</Text>
                                                                    {l.type === 'personal' && (
                                                                        <Text className="text-xs text-teal-600 mt-0.5">Personal Location</Text>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                            {selectedLocationId === l.id && (
                                                                <Box className="w-5 h-5 rounded-full bg-teal-500 items-center justify-center">
                                                                    <Text className="text-white text-xs">✓</Text>
                                                                </Box>
                                                            )}
                                                        </TouchableOpacity>
                                                    ))}
                                                {locations.filter(l => l.name && (!locationQuery || l.name.toLowerCase().includes(locationQuery.toLowerCase()))).length === 0 && (
                                                    <Box className="px-4 py-8 items-center">
                                                        <Text className="text-neutral-400">No locations found</Text>
                                                    </Box>
                                                )}
                                            </Box>
                                        </>
                                    ) : (
                                        <>
                                            {/* Add Personal Location Form */}
                                            <Box className="mb-4 flex-row items-center">
                                                <TouchableOpacity onPress={() => setShowAddPersonalLocation(false)} className="mr-3">
                                                    <ArrowLeft size={24} color="#000" />
                                                </TouchableOpacity>
                                                <Heading level="h4" className="text-neutral-900">Add Personal Location</Heading>
                                            </Box>

                                            <Box className="space-y-4">
                                                <TextInputField
                                                    label="Label"
                                                    required
                                                    placeholder="e.g., Home, Sarah's Place, My Apartment"
                                                    value={personalLocationLabel}
                                                    onChangeText={setPersonalLocationLabel}
                                                />

                                                <TextInputField
                                                    label="Street"
                                                    required
                                                    placeholder="e.g., Main Street"
                                                    value={personalLocationStreet}
                                                    onChangeText={setPersonalLocationStreet}
                                                />

                                                <TextInputField
                                                    label="House Number"
                                                    required
                                                    placeholder="e.g., 123"
                                                    value={personalLocationHouseNr}
                                                    onChangeText={setPersonalLocationHouseNr}
                                                    keyboardType="numeric"
                                                />

                                                <TextInputField
                                                    label="City"
                                                    required
                                                    placeholder="e.g., New York"
                                                    value={personalLocationCity}
                                                    onChangeText={setPersonalLocationCity}
                                                />

                                                <Box className="mt-6">
                                                    <TouchableOpacity
                                                        onPress={handleSavePersonalLocation}
                                                        disabled={!personalLocationLabel || !personalLocationStreet || !personalLocationHouseNr || !personalLocationCity}
                                                        className={`py-4 rounded-xl items-center ${personalLocationLabel && personalLocationStreet && personalLocationHouseNr && personalLocationCity
                                                            ? 'bg-teal-500'
                                                            : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <Text className="text-white font-semibold text-base">Save Location</Text>
                                                    </TouchableOpacity>
                                                </Box>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            </ScrollView>
                        </Box>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
};
