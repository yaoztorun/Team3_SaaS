import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, Platform, Modal, TouchableOpacity, KeyboardAvoidingView, FlatList } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { isWeb } from '@/src/utils/platform';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar as CalendarIcon, Clock, MapPin, Users, X, ChevronRight } from 'lucide-react-native';
import { Calendar, DateData } from 'react-native-calendars';

import { HStack } from '@/src/components/ui/hstack';
import { SocialStackParamList } from './SocialStack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { PrimaryButton, TextInputField, ImageUploadBox } from '@/src/components/global';
import { colors } from '@/src/theme/colors';

type PartyType = 'house-party' | 'bar-meetup' | 'outdoor-event' | 'themed-party';

const CustomTimePicker = ({ value, onChange }: { value: Date; onChange: (date: Date) => void }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];
    const hoursFlatListRef = useRef<FlatList>(null);
    const minutesFlatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Scroll to current hour when component mounts
        if (hoursFlatListRef.current) {
            const index = hours.findIndex(h => h === value.getHours());
            if (index !== -1) {
                setTimeout(() => {
                    hoursFlatListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
                }, 100);
            }
        }
    }, [value]);

    const handleHourPress = (hour: number) => {
        const newDate = new Date(value.getTime());
        newDate.setHours(hour);
        onChange(newDate);
    };

    const handleMinutePress = (minute: number) => {
        const newDate = new Date(value.getTime());
        newDate.setMinutes(minute);
        onChange(newDate);
    };

    return (
        <Box className="flex-row h-52 bg-white rounded-xl overflow-hidden border-2 border-teal-500">
            {/* Hours Column */}
            <Box className="flex-1 border-r border-gray-200">
                <Box className="bg-teal-500 py-2">
                    <Text className="text-center text-xs font-bold text-white">HOUR</Text>
                </Box>
                <FlatList
                    ref={hoursFlatListRef}
                    data={hours}
                    nestedScrollEnabled={true}
                    extraData={value.getHours()}
                    keyExtractor={(item) => `hour-${item}`}
                    getItemLayout={(data, index) => ({ length: 44, offset: 44 * index, index })}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const isSelected = item === value.getHours();
                        return (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => handleHourPress(item)}
                                style={{
                                    height: 44,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: isSelected ? '#14b8a6' : 'transparent',
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#f3f4f6'
                                }}
                            >
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: isSelected ? '700' : '400',
                                    color: isSelected ? '#ffffff' : '#6b7280'
                                }}>
                                    {item.toString().padStart(2, '0')}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </Box>

            {/* Minutes Column */}
            <Box className="flex-1">
                <Box className="bg-teal-500 py-2">
                    <Text className="text-center text-xs font-bold text-white">MINUTE</Text>
                </Box>
                <FlatList
                    ref={minutesFlatListRef}
                    data={minutes}
                    nestedScrollEnabled={true}
                    extraData={value.getMinutes()}
                    keyExtractor={(item) => `minute-${item}`}
                    getItemLayout={(data, index) => ({ length: 44, offset: 44 * index, index })}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => {
                        const isSelected = item === value.getMinutes();
                        return (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => handleMinutePress(item)}
                                style={{
                                    height: 44,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: isSelected ? '#14b8a6' : 'transparent',
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#f3f4f6'
                                }}
                            >
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: isSelected ? '700' : '400',
                                    color: isSelected ? '#ffffff' : '#6b7280'
                                }}>
                                    {item.toString().padStart(2, '0')}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </Box>
        </Box>
    );
};

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

    // Date & Time State
    const [showDateTimeModal, setShowDateTimeModal] = useState(false);
    const [date, setDate] = useState(new Date());
    const [selectedDateString, setSelectedDateString] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000)); // +1 hour

    // Picker visibility for Android / iOS accordion
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const partyTypes = [
        { id: 'house-party', label: 'House Party', emoji: '�' },
        { id: 'bar-meetup', label: 'Bar Meetup', emoji: '🍻' },
        { id: 'outdoor-event', label: 'Outdoor Event', emoji: '�' },
        { id: 'themed-party', label: 'Themed Party', emoji: '�' },
    ] as const;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getNextDayDate = (baseDate: Date) => {
        const nextDay = new Date(baseDate);
        nextDay.setDate(baseDate.getDate() + 1);
        return nextDay.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const isNextDay = (start: Date, end: Date) => {
        const startH = start.getHours();
        const startM = start.getMinutes();
        const endH = end.getHours();
        const endM = end.getMinutes();
        return (endH < startH) || (endH === startH && endM < startM);
    };

    const handleCreateParty = () => {
        // Here you would typically save the party data
        navigation.navigate('SocialMain', { initialView: 'parties' });
    };

    return (
        <Box className="flex-1 bg-gray-50">
            <TopBar title="Create New Party" showBack onBackPress={() => navigation.goBack()} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
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

                    {/* Date & Time Summary */}
                    <Box className="mb-6">
                        <Text className="text-sm text-neutral-950 mb-2">Date & Time *</Text>
                        <Pressable
                            onPress={() => setShowDateTimeModal(true)}
                            className="bg-white border border-neutral-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
                        >
                            <Box className="flex-row items-center">
                                <CalendarIcon size={20} color="#6a7282" />
                                <Box className="ml-3">
                                    <Text className="text-base text-neutral-900 font-medium">
                                        {formatDate(date)}
                                    </Text>
                                    <Text className="text-sm text-neutral-500">
                                        {formatTime(startTime)} - {formatTime(endTime)} {isNextDay(startTime, endTime) ? `(${getNextDayDate(date)})` : ''}
                                    </Text>
                                </Box>
                            </Box>
                            <ChevronRight size={20} color="#9ca3af" />
                        </Pressable>
                    </Box>

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
                                    className={`px-4 py-4 rounded-2xl border-2 ${selectedType === type.id
                                        ? 'bg-teal-50 border-teal-500'
                                        : 'border-neutral-200'
                                        }`}
                                    style={{ width: '48%' }}
                                >
                                    <Text
                                        className={`text-base ${selectedType === type.id
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
            </KeyboardAvoidingView>

            {/* Date & Time Selection Modal */}
            <Modal
                visible={showDateTimeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDateTimeModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowDateTimeModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className="bg-white rounded-t-3xl h-[85%]"
                    >
                        <Box className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-lg font-semibold">Select Date & Time</Text>
                            <Pressable onPress={() => setShowDateTimeModal(false)}>
                                <X size={24} color="#000" />
                            </Pressable>
                        </Box>

                        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                            <Calendar
                                current={selectedDateString}
                                onDayPress={(day: DateData) => {
                                    setSelectedDateString(day.dateString);
                                    // Create date from timestamp to avoid timezone issues
                                    // timestamp is UTC midnight for that day
                                    const newDate = new Date(day.timestamp);
                                    // Adjust for local timezone offset if needed, or just use the date part
                                    // For display purposes, dateString is best.
                                    // For the Date object state:
                                    setDate(newDate);
                                }}
                                theme={{
                                    todayTextColor: colors.primary[500],
                                    selectedDayBackgroundColor: colors.primary[500],
                                    arrowColor: colors.primary[500],
                                    textDayFontWeight: '500',
                                    textMonthFontWeight: 'bold',
                                    textDayHeaderFontWeight: '500',
                                }}
                                markedDates={{
                                    [selectedDateString]: {
                                        selected: true,
                                        selectedColor: colors.primary[500]
                                    }
                                }}
                            />

                            <Box className="px-4 py-4">
                                <Text className="text-sm font-semibold text-neutral-500 mb-3 uppercase">Time</Text>

                                <Box className="flex-row gap-3">
                                    {/* Start Time */}
                                    <Pressable
                                        className={`flex-1 border rounded-xl p-3 ${showStartTimePicker ? 'border-teal-500 bg-teal-50' : 'border-neutral-200 bg-white'}`}
                                        onPress={() => {
                                            setShowStartTimePicker(!showStartTimePicker);
                                            setShowEndTimePicker(false);
                                        }}
                                    >
                                        <Text className="text-xs text-neutral-500 mb-1">Start Time *</Text>
                                        <Box className="flex-row items-center">
                                            <Clock size={16} color={showStartTimePicker ? "#0d9488" : "#666"} />
                                            <Text className={`ml-2 text-base font-medium ${showStartTimePicker ? 'text-teal-700' : 'text-neutral-900'}`}>
                                                {formatTime(startTime)}
                                            </Text>
                                        </Box>
                                    </Pressable>

                                    {/* End Time */}
                                    <Pressable
                                        className={`flex-1 border rounded-xl p-3 ${showEndTimePicker ? 'border-teal-500 bg-teal-50' : 'border-neutral-200 bg-white'}`}
                                        onPress={() => {
                                            setShowEndTimePicker(!showEndTimePicker);
                                            setShowStartTimePicker(false);
                                        }}
                                    >
                                        <Text className="text-xs text-neutral-500 mb-1">End Time (Optional)</Text>
                                        <Box className="flex-row items-center">
                                            <Clock size={16} color={showEndTimePicker ? "#0d9488" : "#666"} />
                                            <Text className={`ml-2 text-base font-medium ${showEndTimePicker ? 'text-teal-700' : 'text-neutral-900'}`}>
                                                {formatTime(endTime)}
                                            </Text>
                                            {isNextDay(startTime, endTime) && (
                                                <Text className="text-xs text-neutral-500 ml-1 font-medium">({getNextDayDate(date)})</Text>
                                            )}
                                        </Box>
                                    </Pressable>
                                </Box>

                                {/* Time Picker Display (Custom) */}
                                {(showStartTimePicker || showEndTimePicker) && (
                                    <Box className="mt-4">
                                        <CustomTimePicker
                                            value={showStartTimePicker ? startTime : endTime}
                                            onChange={(newDate) => {
                                                if (showStartTimePicker) setStartTime(newDate);
                                                else setEndTime(newDate);
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </ScrollView>

                        <Box className="p-4 border-t border-gray-100 pb-8">
                            <PrimaryButton
                                title="Done"
                                onPress={() => setShowDateTimeModal(false)}
                            />
                        </Box>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </Box>
    );
};