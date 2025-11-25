import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, Platform, Modal, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
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
    const minutes = [0, 15, 30, 45];
    const [selectedHour, setSelectedHour] = useState(value.getHours());
    const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());
    const [activeField, setActiveField] = useState<'hour' | 'minute' | null>(null);

    // Update internal state when value prop changes, but don't reset activeField
    useEffect(() => {
        setSelectedHour(value.getHours());
        setSelectedMinute(value.getMinutes());
    }, [value.getTime()]); // Use getTime() to only trigger when the actual time changes, not on every render

    const handleHourChange = (increment: boolean) => {
        let newHour = selectedHour + (increment ? 1 : -1);
        if (newHour < 0) newHour = 23;
        if (newHour > 23) newHour = 0;

        setSelectedHour(newHour);
        const newDate = new Date(value.getTime());
        newDate.setHours(newHour);
        newDate.setMinutes(selectedMinute);
        onChange(newDate);
    };

    const handleMinuteChange = (increment: boolean) => {
        const currentIndex = minutes.indexOf(selectedMinute);
        let newIndex = currentIndex + (increment ? 1 : -1);
        if (newIndex < 0) newIndex = minutes.length - 1;
        if (newIndex >= minutes.length) newIndex = 0;

        const newMinute = minutes[newIndex];
        setSelectedMinute(newMinute);
        const newDate = new Date(value.getTime());
        newDate.setHours(selectedHour);
        newDate.setMinutes(newMinute);
        onChange(newDate);
    };

    return (
        <Box className="bg-white rounded-xl p-4 border border-neutral-200">
            <Text className="text-sm font-semibold text-neutral-700 mb-3">Select Time</Text>

            <Box className="flex-row items-center justify-center gap-3">
                {/* Hour Selector */}
                <TouchableOpacity
                    onPress={() => setActiveField(activeField === 'hour' ? null : 'hour')}
                    style={{
                        flex: 1,
                        height: 76,
                        backgroundColor: activeField === 'hour' ? '#f0fdfa' : '#ffffff',
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: activeField === 'hour' ? '#14b8a6' : '#e5e7eb',
                        overflow: 'hidden',
                    }}
                >
                    {activeField === 'hour' ? (
                        <Box className="flex-row items-center justify-between px-2" style={{ height: '100%' }}>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleHourChange(false);
                                }}
                                style={{
                                    width: 36,
                                    height: 36,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#14b8a6',
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>−</Text>
                            </TouchableOpacity>

                            <Text style={{ fontSize: 28, fontWeight: '700', color: '#0d9488' }}>
                                {selectedHour.toString().padStart(2, '0')}
                            </Text>

                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleHourChange(true);
                                }}
                                style={{
                                    width: 36,
                                    height: 36,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#14b8a6',
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>+</Text>
                            </TouchableOpacity>
                        </Box>
                    ) : (
                        <Box className="items-center justify-center" style={{ height: '100%' }}>
                            <Text style={{ fontSize: 28, fontWeight: '700', color: '#374151' }}>
                                {selectedHour.toString().padStart(2, '0')}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 2 }}>
                                Hour
                            </Text>
                        </Box>
                    )}
                </TouchableOpacity>

                {/* Separator */}
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#9ca3af' }}>:</Text>

                {/* Minute Selector */}
                <TouchableOpacity
                    onPress={() => setActiveField(activeField === 'minute' ? null : 'minute')}
                    style={{
                        flex: 1,
                        height: 76,
                        backgroundColor: activeField === 'minute' ? '#f0fdfa' : '#ffffff',
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: activeField === 'minute' ? '#14b8a6' : '#e5e7eb',
                        overflow: 'hidden',
                    }}
                >
                    {activeField === 'minute' ? (
                        <Box className="flex-row items-center justify-between px-2" style={{ height: '100%' }}>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleMinuteChange(false);
                                }}
                                style={{
                                    width: 36,
                                    height: 36,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#14b8a6',
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>−</Text>
                            </TouchableOpacity>

                            <Text style={{ fontSize: 28, fontWeight: '700', color: '#0d9488' }}>
                                {selectedMinute.toString().padStart(2, '0')}
                            </Text>

                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleMinuteChange(true);
                                }}
                                style={{
                                    width: 36,
                                    height: 36,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#14b8a6',
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>+</Text>
                            </TouchableOpacity>
                        </Box>
                    ) : (
                        <Box className="items-center justify-center" style={{ height: '100%' }}>
                            <Text style={{ fontSize: 28, fontWeight: '700', color: '#374151' }}>
                                {selectedMinute.toString().padStart(2, '0')}
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 2 }}>
                                Minute
                            </Text>
                        </Box>
                    )}
                </TouchableOpacity>
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

    // Initialize times with proper values
    const initStartTime = () => {
        const start = new Date();
        start.setHours(22, 0, 0, 0);
        return start;
    };

    const [startTime, setStartTime] = useState(initStartTime());
    const [endTime, setEndTime] = useState<Date | null>(null);    // Picker visibility for Android / iOS accordion
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

    const isNextDay = (start: Date, end: Date | null): boolean => {
        if (!end) return false;
        const startH = start.getHours();
        const startM = start.getMinutes();
        const endH = end.getHours();
        const endM = end.getMinutes();
        return (endH < startH) || (endH === startH && endM < startM);
    };

    const addEndTime = () => {
        const end = new Date(startTime);
        end.setHours(end.getHours() + 4); // Default to 4 hours after start
        setEndTime(end);
        setShowEndTimePicker(true);
        setShowStartTimePicker(false);
    };

    const removeEndTime = () => {
        setEndTime(null);
        setShowEndTimePicker(false);
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
                                        {formatTime(startTime)}
                                        {endTime && (
                                            <>
                                                {' - '}{formatTime(endTime)} {isNextDay(startTime, endTime) ? `(${getNextDayDate(date)})` : ''}
                                            </>
                                        )}
                                        {!endTime && ' (no end time)'}
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
                                            setShowStartTimePicker(true);
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

                                    {/* End Time or Add Button */}
                                    {endTime ? (
                                        <Box style={{ flex: 1, position: 'relative' }}>
                                            <Pressable
                                                className={`border rounded-xl p-3 ${showEndTimePicker ? 'border-teal-500 bg-teal-50' : 'border-neutral-200 bg-white'}`}
                                                onPress={() => {
                                                    setShowEndTimePicker(true);
                                                    setShowStartTimePicker(false);
                                                }}
                                            >
                                                <Text className="text-xs text-neutral-500 mb-1">
                                                    End Time {isNextDay(startTime, endTime) && `(${getNextDayDate(date)})`}
                                                </Text>
                                                <Box className="flex-row items-center">
                                                    <Clock size={16} color={showEndTimePicker ? "#0d9488" : "#666"} />
                                                    <Text className={`ml-2 text-base font-medium ${showEndTimePicker ? 'text-teal-700' : 'text-neutral-900'}`}>
                                                        {formatTime(endTime)}
                                                    </Text>
                                                </Box>
                                            </Pressable>
                                            {/* Close button */}
                                            <TouchableOpacity
                                                onPress={removeEndTime}
                                                style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    backgroundColor: '#ffffff',
                                                    borderWidth: 2,
                                                    borderColor: '#dc2626',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.1,
                                                    shadowRadius: 3,
                                                    elevation: 3,
                                                }}
                                            >
                                                <X size={14} color="#dc2626" strokeWidth={3} />
                                            </TouchableOpacity>
                                        </Box>
                                    ) : (
                                        <Pressable
                                            className="flex-1 border-2 border-dashed border-neutral-300 rounded-xl p-3 bg-white justify-center items-center"
                                            onPress={addEndTime}
                                        >
                                            <Text className="text-sm font-medium text-teal-600">+ Add End Time</Text>
                                        </Pressable>
                                    )}
                                </Box>

                                {/* Time Picker Display (Custom) */}
                                {(showStartTimePicker || showEndTimePicker) && (
                                    <Box className="mt-4">
                                        <CustomTimePicker
                                            key={showStartTimePicker ? 'start' : 'end'} // Force remount when switching between start/end
                                            value={showStartTimePicker ? startTime : (endTime || startTime)}
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