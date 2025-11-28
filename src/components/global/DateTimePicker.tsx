import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Calendar as CalendarIcon, Clock, X, ChevronRight } from 'lucide-react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { colors } from '@/src/theme/colors';
import { Heading } from './Heading';

interface DateTimePickerProps {
    date: Date;
    startTime: Date;
    endTime: Date | null;
    onDateChange: (date: Date) => void;
    onStartTimeChange: (time: Date) => void;
    onEndTimeChange: (time: Date | null) => void;
}

const CustomTimePicker = ({ value, onChange }: { value: Date; onChange: (date: Date) => void }) => {
    const minutes = [0, 15, 30, 45];
    const [selectedHour, setSelectedHour] = useState(value.getHours());
    const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());
    const [activeField, setActiveField] = useState<'hour' | 'minute' | null>(null);

    // Update internal state when value prop changes, but don't reset activeField
    useEffect(() => {
        setSelectedHour(value.getHours());
        setSelectedMinute(value.getMinutes());
    }, [value.getTime()]);

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

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
    date,
    startTime,
    endTime,
    onDateChange,
    onStartTimeChange,
    onEndTimeChange,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDateString, setSelectedDateString] = useState(date.toISOString().split('T')[0]);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
        end.setHours(end.getHours() + 4);
        onEndTimeChange(end);
        setShowEndTimePicker(true);
        setShowStartTimePicker(false);
    };

    const removeEndTime = () => {
        onEndTimeChange(null);
        setShowEndTimePicker(false);
    };

    return (
        <>
            <Box className="mb-6">
                <Text className="text-sm text-neutral-950 mb-2">Date & Time *</Text>
                <Pressable
                    onPress={() => setIsModalVisible(true)}
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

            {/* Modal */}
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
                                <Text className="text-xl font-semibold text-neutral-900">Select Date & Time</Text>
                                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                    <X size={24} color="#666" />
                                </TouchableOpacity>
                            </Box>

                            <ScrollView
                                style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={true}
                            >                                                        {/* Calendar */}
                                <Calendar
                                    current={selectedDateString}
                                    onDayPress={(day: DateData) => {
                                        setSelectedDateString(day.dateString);
                                        const newDate = new Date(day.dateString);
                                        onDateChange(newDate);
                                    }}
                                    theme={{
                                        selectedDayBackgroundColor: colors.primary[500],
                                        selectedDayTextColor: '#ffffff',
                                        todayTextColor: colors.primary[500],
                                        arrowColor: colors.primary[500],
                                        monthTextColor: '#111827',
                                        textMonthFontWeight: '600',
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
                                                key={showStartTimePicker ? 'start' : 'end'}
                                                value={showStartTimePicker ? startTime : (endTime || startTime)}
                                                onChange={(newDate) => {
                                                    if (showStartTimePicker) onStartTimeChange(newDate);
                                                    else onEndTimeChange(newDate);
                                                }}
                                            />
                                        </Box>
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
