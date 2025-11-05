import React, { useState } from 'react';
import { ScrollView, Platform, TextInput } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/button';
import { isWeb } from '@/src/utils/platform';
import { Center } from '@/src/components/ui/center';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import { HStack } from '@/src/components/ui/hstack';
import { SocialStackParamList } from './SocialStack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';

type PartyType = 'house-party' | 'bar-meetup' | 'outdoor-event' | 'themed-party';

export const CreateParty = () => {
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [partyTitle, setPartyTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<PartyType>('house-party');
    const [location, setLocation] = useState('');
    const [maxAttendees, setMaxAttendees] = useState('');
    const [entryFee, setEntryFee] = useState('');
    const [cocktailTheme, setCocktailTheme] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [requireApproval, setRequireApproval] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000)); // +1 hour

    const partyTypes = [
        { id: 'house-party', label: 'House Party', emoji: '�' },
        { id: 'bar-meetup', label: 'Bar Meetup', emoji: '🍻' },
        { id: 'outdoor-event', label: 'Outdoor Event', emoji: '�' },
        { id: 'themed-party', label: 'Themed Party', emoji: '�' },
    ] as const;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleCreateParty = () => {
        // Here you would typically save the party data
        navigation.navigate('SocialMain', { initialView: 'parties' });
    };

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Create Party" />
            <ScrollView
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* Cover Image Upload */}
                <Box className="mb-6">
                    <Pressable 
                        onPress={() => {
                            // Handle image upload
                        }}
                        className="bg-white border-2 border-dashed border-neutral-200 rounded-xl h-48 items-center justify-center"
                    >
                        <Box className="items-center">
                            <Text className="text-3xl mb-2">🖼️</Text>
                            <Text className="text-neutral-600 font-medium">Upload Cover Image</Text>
                        </Box>
                    </Pressable>
                </Box>

                {/* Party Title */}
                <Box className="mb-6">
                    <Text className="text-sm font-medium text-neutral-600 mb-2">Party Name *</Text>
                    <Box className="bg-white border border-neutral-200 rounded-xl shadow-sm">
                        <TextInput
                            value={partyTitle}
                            onChangeText={setPartyTitle}
                            placeholder="e.g., Summer Cocktail Night"
                            className="px-4 py-3.5 text-base"
                            placeholderTextColor="#9CA3AF"
                        />
                    </Box>
                </Box>

                {/* Party Type Selection */}
                <Box className="mb-6">
                    <Text className="text-sm font-medium text-neutral-600 mb-2">Party Type</Text>
                    <HStack className="flex-wrap gap-2">
                        {partyTypes.map((type) => (
                            <Pressable
                                key={type.id}
                                onPress={() => setSelectedType(type.id)}
                                className={`flex-row items-center px-4 py-2.5 rounded-full border ${
                                    selectedType === type.id 
                                        ? 'bg-teal-500 border-transparent' 
                                        : 'bg-white border-neutral-200'
                                }`}
                            >
                                <Text className="text-xl mr-2">{type.emoji}</Text>
                                <Text 
                                    className={selectedType === type.id 
                                        ? 'text-white font-medium' 
                                        : 'text-neutral-900 font-medium'
                                    }
                                >
                                    {type.label}
                                </Text>
                            </Pressable>
                        ))}
                    </HStack>
                </Box>

                {/* Date and Time Selection */}
                <Box className="mb-6">
                    <Text className="text-sm font-medium text-neutral-600 mb-2">Date & Time</Text>
                    <HStack className="flex-wrap gap-3">
                        {/* Date Picker */}
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            className="flex-1 min-w-[150px] bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-sm"
                        >
                            <HStack space="sm" className="items-center mb-1">
                                <Text>📅</Text>
                                <Text className="text-sm text-neutral-500">Date</Text>
                            </HStack>
                            <Text className="text-base text-neutral-900">{formatDate(date)}</Text>
                        </Pressable>

                        {/* Start Time Picker */}
                        <Pressable
                            onPress={() => setShowStartTimePicker(true)}
                            className="flex-1 min-w-[150px] bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-sm"
                        >
                            <HStack space="sm" className="items-center mb-1">
                                <Text>🕒</Text>
                                <Text className="text-sm text-neutral-500">Start Time</Text>
                            </HStack>
                            <Text className="text-base text-neutral-900">{formatTime(startTime)}</Text>
                        </Pressable>

                        {/* End Time Picker */}
                        <Pressable
                            onPress={() => setShowEndTimePicker(true)}
                            className="flex-1 min-w-[150px] bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-sm"
                        >
                            <HStack space="sm" className="items-center mb-1">
                                <Text>🕒</Text>
                                <Text className="text-sm text-neutral-500">End Time</Text>
                            </HStack>
                            <Text className="text-base text-neutral-900">{formatTime(endTime)}</Text>
                        </Pressable>
                    </HStack>
                </Box>

                {/* Description */}
                <Box className="mb-6">
                    <Text className="text-sm font-medium text-neutral-600 mb-2">Description *</Text>
                    <Box className="bg-white border border-neutral-200 rounded-xl shadow-sm">
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Tell people what your party is all about..."
                            multiline
                            numberOfLines={4}
                            className="px-4 py-4 text-base min-h-[120px]"
                            textAlignVertical="top"
                            placeholderTextColor="#9CA3AF"
                        />
                    </Box>
                </Box>

                {/* Location */}
                <Box className="mb-6">
                    <Text className="text-sm font-medium text-neutral-600 mb-2">Location *</Text>
                    <Box className="bg-white border border-neutral-200 rounded-xl shadow-sm">
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Where's the party?"
                            className="px-4 py-3.5 text-base"
                            placeholderTextColor="#9CA3AF"
                        />
                    </Box>
                </Box>

                {/* Max Attendees */}
                <Box className="mb-6">
                    <Text className="text-sm font-medium text-neutral-600 mb-2">Max Attendees</Text>
                    <Box className="bg-white border border-neutral-200 rounded-xl shadow-sm">
                        <TextInput
                            value={maxAttendees}
                            onChangeText={setMaxAttendees}
                            placeholder="No limit"
                            keyboardType="numeric"
                            className="px-4 py-3.5 text-base"
                            placeholderTextColor="#9CA3AF"
                        />
                    </Box>
                </Box>

                {/* Entry Fee */}
                <Box className="mb-6">
                    <Text className="text-sm font-medium text-neutral-600 mb-2">Entry Fee (Optional)</Text>
                    <Box className="bg-white border border-neutral-200 rounded-xl shadow-sm">
                        <TextInput
                            value={entryFee}
                            onChangeText={setEntryFee}
                            placeholder="e.g., $10, Free"
                            className="px-4 py-3.5 text-base"
                            placeholderTextColor="#9CA3AF"
                        />
                    </Box>
                </Box>

                {/* Cocktail Theme */}
                <Box className="mb-6">
                    <Text className="text-sm font-medium text-neutral-600 mb-2">Cocktail Theme (Optional)</Text>
                    <Box className="bg-white border border-neutral-200 rounded-xl shadow-sm">
                        <TextInput
                            value={cocktailTheme}
                            onChangeText={setCocktailTheme}
                            placeholder="e.g., Tropical, Classic, Whiskey Night"
                            className="px-4 py-3.5 text-base"
                            placeholderTextColor="#9CA3AF"
                        />
                    </Box>
                </Box>

                {/* Privacy Settings */}
                <Box className="mb-6">
                    <Box className="flex-row items-center justify-between mb-4">
                        <Text className="text-sm font-medium text-neutral-600">Public Party</Text>
                        <Pressable 
                            onPress={() => setIsPublic(!isPublic)}
                            className={`w-12 h-6 rounded-full ${isPublic ? 'bg-teal-500' : 'bg-neutral-200'} justify-center px-0.5`}
                        >
                            <Box className={`w-5 h-5 rounded-full bg-white shadow transition-all ${isPublic ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>
                    <Box className="flex-row items-center justify-between">
                        <Text className="text-sm font-medium text-neutral-600">Require Approval</Text>
                        <Pressable 
                            onPress={() => setRequireApproval(!requireApproval)}
                            className={`w-12 h-6 rounded-full ${requireApproval ? 'bg-teal-500' : 'bg-neutral-200'} justify-center px-0.5`}
                        >
                            <Box className={`w-5 h-5 rounded-full bg-white shadow transition-all ${requireApproval ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>
                </Box>

                {/* Create Party Button */}
                <Button
                    className="bg-teal-500 py-4 rounded-xl shadow"
                    onPress={handleCreateParty}
                >
                    <Text className="text-white text-base font-semibold">Create Party</Text>
                </Button>
            </ScrollView>

            {/* Date Picker Modal */}
            {isWeb ? (
                <>
                    {showDatePicker && (
                        <Box className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Box className="bg-white p-4 rounded-xl w-80">
                                <input
                                    type="date"
                                    value={date.toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const newDate = new Date(e.target.value);
                                        setDate(newDate);
                                        setShowDatePicker(false);
                                    }}
                                    className="w-full p-2 border rounded"
                                />
                            </Box>
                        </Box>
                    )}
                </>
            ) : (
                (Platform.OS === 'android' ? showDatePicker : true) && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                )
            )}

            {/* Start Time Picker Modal */}
            {isWeb ? (
                <>
                    {showStartTimePicker && (
                        <Box className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Box className="bg-white p-4 rounded-xl w-80">
                                <input
                                    type="time"
                                    value={startTime.toTimeString().slice(0, 5)}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newTime = new Date(startTime);
                                        newTime.setHours(parseInt(hours), parseInt(minutes));
                                        setStartTime(newTime);
                                        setShowStartTimePicker(false);
                                    }}
                                    className="w-full p-2 border rounded"
                                />
                            </Box>
                        </Box>
                    )}
                </>
            ) : (
                (Platform.OS === 'android' ? showStartTimePicker : true) && (
                    <DateTimePicker
                        value={startTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedTime) => {
                            setShowStartTimePicker(false);
                            if (selectedTime) setStartTime(selectedTime);
                        }}
                    />
                )
            )}

            {/* End Time Picker Modal */}
            {isWeb ? (
                <>
                    {showEndTimePicker && (
                        <Box className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Box className="bg-white p-4 rounded-xl w-80">
                                <input
                                    type="time"
                                    value={endTime.toTimeString().slice(0, 5)}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newTime = new Date(endTime);
                                        newTime.setHours(parseInt(hours), parseInt(minutes));
                                        setEndTime(newTime);
                                        setShowEndTimePicker(false);
                                    }}
                                    className="w-full p-2 border rounded"
                                />
                            </Box>
                        </Box>
                    )}
                </>
            ) : (
                (Platform.OS === 'android' ? showEndTimePicker : true) && (
                    <DateTimePicker
                        value={endTime}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedTime) => {
                            setShowEndTimePicker(false);
                            if (selectedTime) setEndTime(selectedTime);
                        }}
                    />
                )
            )}
        </Box>
    );
};