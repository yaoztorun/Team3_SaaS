import React, { useState } from 'react';
import { ScrollView, Platform } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { isWeb } from '@/src/utils/platform';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';

import { HStack } from '@/src/components/ui/hstack';
import { SocialStackParamList } from './SocialStack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { PrimaryButton, TextInputField, ImageUploadBox } from '@/src/components/global';

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
        <Box className="flex-1 bg-gray-50">
            <TopBar title="Create New Party" showBack onBackPress={() => navigation.goBack()} />
            <ScrollView
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* Cover Image Upload - Using ImageUploadBox */}
                <Box className="mb-6">
                    <Text className="text-sm text-neutral-950 mb-2">Party Cover Image</Text>
                    <ImageUploadBox
                        onCameraPress={() => {
                            // Handle camera
                        }}
                        onGalleryPress={() => {
                            // Handle gallery
                        }}
                    />
                </Box>

                {/* Party Title */}
                <Box className="mb-6">
                    <TextInputField
                        label="Party Name"
                        required
                        value={partyTitle}
                        onChangeText={setPartyTitle}
                        placeholder="e.g., Summer Cocktail Night"
                    />
                </Box>

                {/* Description */}
                <Box className="mb-6">
                    <TextInputField
                        label="Description"
                        required
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell people what your party is all about..."
                        multiline
                        numberOfLines={3}
                    />
                </Box>

                {/* Date Picker */}
                <Box className="mb-3">
                    <Text className="text-sm text-neutral-950 mb-2">Date *</Text>
                    <Pressable
                        onPress={() => setShowDatePicker(true)}
                        className="bg-white border border-neutral-300 rounded-lg px-3 py-3 flex-row items-center"
                    >
                        <Calendar size={20} color="#6a7282" />
                        <Text className="ml-3 text-base text-neutral-600">{formatDate(date)}</Text>
                    </Pressable>
                </Box>

                {/* Time Pickers Row */}
                <HStack className="gap-3 mb-6">
                    {/* Start Time */}
                    <Box className="flex-1">
                        <Text className="text-sm text-neutral-950 mb-2">Start Time *</Text>
                        <Pressable
                            onPress={() => setShowStartTimePicker(true)}
                            className="bg-white border border-neutral-300 rounded-lg px-3 py-3 flex-row items-center"
                        >
                            <Clock size={20} color="#6a7282" />
                            <Text className="ml-3 text-base text-neutral-600">{formatTime(startTime)}</Text>
                        </Pressable>
                    </Box>

                    {/* End Time */}
                    <Box className="flex-1">
                        <Text className="text-sm text-neutral-950 mb-2">End Time (Optional)</Text>
                        <Pressable
                            onPress={() => setShowEndTimePicker(true)}
                            className="bg-white border border-neutral-300 rounded-lg px-3 py-3 flex-row items-center"
                        >
                            <Clock size={20} color="#6a7282" />
                            <Text className="ml-3 text-base text-neutral-600">{formatTime(endTime)}</Text>
                        </Pressable>
                    </Box>
                </HStack>

                {/* Location */}
                <Box className="mb-6">
                    <TextInputField
                        label="Location"
                        required
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Where's the party?"
                        icon={<MapPin size={20} color="#6a7282" />}
                    />
                </Box>

                {/* Max Attendees */}
                <Box className="mb-6">
                    <TextInputField
                        label="Max Attendees"
                        value={maxAttendees}
                        onChangeText={setMaxAttendees}
                        placeholder="No limit"
                        keyboardType="numeric"
                        icon={<Users size={20} color="#6a7282" />}
                    />
                </Box>

                {/* Entry Fee */}
                <Box className="mb-6">
                    <TextInputField
                        label="Entry Fee (Optional)"
                        value={entryFee}
                        onChangeText={setEntryFee}
                        placeholder="e.g., $10, Free"
                    />
                </Box>

                {/* Party Type Selection */}
                <Box className="mb-6 bg-white border border-neutral-200 rounded-2xl p-4">
                    <Text className="text-sm text-neutral-950 mb-3">Party Type</Text>
                    <Box className="flex-row flex-wrap gap-3">
                        {partyTypes.map((type) => (
                            <Pressable
                                key={type.id}
                                onPress={() => setSelectedType(type.id)}
                                className={`px-4 py-4 rounded-2xl border-2 ${
                                    selectedType === type.id 
                                        ? 'bg-teal-50 border-teal-500' 
                                        : 'border-neutral-200'
                                }`}
                                style={{ width: '48%' }}
                            >
                                <Text 
                                    className={`text-base ${
                                        selectedType === type.id 
                                            ? 'text-[#00786f] font-medium' 
                                            : 'text-neutral-900'
                                    }`}
                                >
                                    {type.emoji} {type.label}
                                </Text>
                            </Pressable>
                        ))}
                    </Box>
                </Box>

                {/* Privacy Settings */}
                <Box className="mb-6 bg-white rounded-2xl p-4">
                    <Box className="flex-row items-center justify-between mb-4">
                        <Box className="flex-1">
                            <Text className="text-base text-neutral-950 mb-1">Public Party</Text>
                            <Text className="text-sm text-neutral-600">Anyone can see and join</Text>
                        </Box>
                        <Pressable 
                            onPress={() => setIsPublic(!isPublic)}
                            className={`w-8 h-[18px] rounded-full justify-center ${isPublic ? 'bg-neutral-950' : 'bg-neutral-300'}`}
                            style={{ paddingHorizontal: 2 }}
                        >
                            <Box 
                                className="w-4 h-4 rounded-full bg-white"
                                style={{ 
                                    alignSelf: isPublic ? 'flex-end' : 'flex-start',
                                }} 
                            />
                        </Pressable>
                    </Box>
                    <Box className="flex-row items-center justify-between">
                        <Box className="flex-1">
                            <Text className="text-base text-neutral-950 mb-1">Require Approval</Text>
                            <Text className="text-sm text-neutral-600">You approve attendees</Text>
                        </Box>
                        <Pressable 
                            onPress={() => setRequireApproval(!requireApproval)}
                            className={`w-8 h-[18px] rounded-full justify-center ${requireApproval ? 'bg-neutral-950' : 'bg-neutral-300'}`}
                            style={{ paddingHorizontal: 2 }}
                        >
                            <Box 
                                className="w-4 h-4 rounded-full bg-white"
                                style={{ 
                                    alignSelf: requireApproval ? 'flex-end' : 'flex-start',
                                }} 
                            />
                        </Pressable>
                    </Box>
                </Box>

                {/* Cocktail Theme */}
                <Box className="mb-6">
                    <TextInputField
                        label="Cocktail Theme (Optional)"
                        value={cocktailTheme}
                        onChangeText={setCocktailTheme}
                        placeholder="e.g., Tropical, Classic, Whiskey Night"
                    />
                </Box>

                {/* Create Party Button */}
                <PrimaryButton
                    title="Create Party"
                    onPress={handleCreateParty}
                />
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