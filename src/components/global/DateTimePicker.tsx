import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, ScrollView, Platform, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Calendar as CalendarIcon, Clock, X, ChevronRight, ArrowLeft, Check } from 'lucide-react-native';
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

type PickerStep = 'date' | 'start-hour' | 'start-minute' | 'end-choice' | 'end-hour' | 'end-minute' | 'done';

// Clock component for selecting hours
const ClockPicker = ({ 
    selectedValue, 
    onSelect, 
    type 
}: { 
    selectedValue: number; 
    onSelect: (value: number) => void;
    type: 'hour' | 'minute';
}) => {
    const centerX = 150;
    const centerY = 150;
    const outerRadius = 110;
    const innerRadius = 70;

    const getClockPosition = (value: number, radius: number) => {
        const angle = type === 'hour' 
            ? (value % 12) * 30 - 90 // 30 degrees per hour, -90 to start at top
            : value * 6 - 90; // 6 degrees per minute, -90 to start at top
        
        const radian = (angle * Math.PI) / 180;
        return {
            x: centerX + radius * Math.cos(radian),
            y: centerY + radius * Math.sin(radian),
        };
    };

    const handlePress = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        const dx = locationX - centerX;
        const dy = locationY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        if (type === 'hour') {
            const hour = Math.round(angle / 30) % 12;
            const isInner = distance < (outerRadius + innerRadius) / 2;
            const finalHour = isInner ? (hour === 0 ? 12 : hour) + 12 : (hour === 0 ? 12 : hour);
            onSelect(finalHour === 24 ? 0 : finalHour);
        } else {
            const minute = Math.round(angle / 6) % 60;
            onSelect(minute);
        }
    };

    const outerNumbers = type === 'hour' 
        ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    
    const innerNumbers = type === 'hour'
        ? [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
        : [];

    const selectedPos = type === 'hour'
        ? selectedValue >= 13 || selectedValue === 0
            ? getClockPosition(selectedValue, innerRadius)
            : getClockPosition(selectedValue, outerRadius)
        : getClockPosition(selectedValue, outerRadius);

    return (
        <View
            onStartShouldSetResponder={() => true}
            onResponderRelease={handlePress}
            style={{
                width: 300,
                height: 300,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* Clock Circle Background */}
            <View
                style={{
                    width: 300,
                    height: 300,
                    borderRadius: 150,
                    backgroundColor: '#f3f4f6',
                    position: 'absolute',
                }}
            />

            {/* Outer Numbers */}
            {outerNumbers.map((num) => {
                const pos = getClockPosition(num, outerRadius);
                const isSelected = type === 'hour' 
                    ? (selectedValue === num || (num === 12 && selectedValue === 0))
                    : selectedValue === num;
                
                return (
                    <TouchableOpacity
                        key={`outer-${num}`}
                        onPress={() => onSelect(num === 12 && type === 'hour' ? (selectedValue >= 13 ? 0 : 12) : num)}
                        style={{
                            position: 'absolute',
                            left: pos.x - 20,
                            top: pos.y - 20,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: isSelected && (type === 'minute' || selectedValue < 13) ? '#5dade2' : 'transparent',
                        }}
                    >
                        <Text style={{ 
                            color: isSelected && (type === 'minute' || selectedValue < 13) ? '#ffffff' : '#374151', 
                            fontSize: 16,
                            fontWeight: isSelected ? '700' : '400',
                        }}>
                            {num.toString().padStart(2, '0')}
                        </Text>
                    </TouchableOpacity>
                );
            })}

            {/* Inner Numbers (13-24 for hours) */}
            {type === 'hour' && innerNumbers.map((num) => {
                const pos = getClockPosition(num, innerRadius);
                const isSelected = selectedValue === num || (num === 0 && selectedValue === 24);
                
                return (
                    <TouchableOpacity
                        key={`inner-${num}`}
                        onPress={() => onSelect(num)}
                        style={{
                            position: 'absolute',
                            left: pos.x - 18,
                            top: pos.y - 18,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: isSelected ? '#5dade2' : 'transparent',
                        }}
                    >
                        <Text style={{ 
                            color: isSelected ? '#ffffff' : '#6b7280', 
                            fontSize: 14,
                            fontWeight: isSelected ? '700' : '400',
                        }}>
                            {num.toString().padStart(2, '0')}
                        </Text>
                    </TouchableOpacity>
                );
            })}


        </View>
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
    const [currentStep, setCurrentStep] = useState<PickerStep>('date');
    const [selectedDateString, setSelectedDateString] = useState(date.toISOString().split('T')[0]);
    
    const [tempStartHour, setTempStartHour] = useState(startTime.getHours());
    const [tempStartMinute, setTempStartMinute] = useState(startTime.getMinutes());
    const [tempEndHour, setTempEndHour] = useState(endTime?.getHours() || 0);
    const [tempEndMinute, setTempEndMinute] = useState(endTime?.getMinutes() || 0);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleDateSelect = (day: DateData) => {
        const selectedDate = new Date(day.dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Prevent selecting past dates
        if (selectedDate < today) {
            return;
        }
        
        setSelectedDateString(day.dateString);
        const newDate = new Date(day.dateString);
        onDateChange(newDate);
        setCurrentStep('start-hour');
    };

    const handleStartHourSelect = (hour: number) => {
        setTempStartHour(hour);
        setCurrentStep('start-minute');
    };

    const handleStartMinuteSelect = (minute: number) => {
        setTempStartMinute(minute);
        const newStartTime = new Date(date);
        newStartTime.setHours(tempStartHour, minute, 0, 0);
        onStartTimeChange(newStartTime);
        setCurrentStep('end-hour');
    };

    const handleEndHourSelect = (hour: number) => {
        setTempEndHour(hour);
        setCurrentStep('end-minute');
    };

    const handleEndMinuteSelect = (minute: number) => {
        setTempEndMinute(minute);
        const newEndTime = new Date(date);
        newEndTime.setHours(tempEndHour, minute, 0, 0);
        
        // If end time is before start time, set it to next day
        if (newEndTime <= startTime) {
            newEndTime.setDate(newEndTime.getDate() + 1);
        }
        
        onEndTimeChange(newEndTime);
        setIsModalVisible(false);
        setCurrentStep('date');
    };

    const handleNoEndTime = () => {
        onEndTimeChange(null);
        setIsModalVisible(false);
        setCurrentStep('date');
    };

    const handleBack = () => {
        switch (currentStep) {
            case 'start-hour':
                setCurrentStep('date');
                break;
            case 'start-minute':
                setCurrentStep('start-hour');
                break;
            case 'end-hour':
                setCurrentStep('start-minute');
                break;
            case 'end-minute':
                setCurrentStep('end-hour');
                break;
            default:
                setIsModalVisible(false);
                setCurrentStep('date');
        }
    };

    const handleClose = () => {
        setIsModalVisible(false);
        setCurrentStep('date');
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 'date':
                return 'Selecteer een datum';
            case 'start-hour':
                return 'Starttijd selecteren';
            case 'start-minute':
                return 'Starttijd selecteren';
            case 'end-hour':
                return 'Eindtijd selecteren';
            case 'end-minute':
                return 'Eindtijd selecteren';
            default:
                return 'Select Date & Time';
        }
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
                                {endTime && ` - ${formatTime(endTime)}`}
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
                onRequestClose={handleClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleClose}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 480,
                            height: '85%',
                        }}
                    >
                        <Box
                            style={{
                                flex: 1,
                                backgroundColor: '#ffffff',
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Header */}
                            <Box className="px-4 py-4 border-b border-gray-300 flex-row items-center justify-between">
                                {currentStep !== 'date' && (
                                    <TouchableOpacity onPress={handleBack}>
                                        <ArrowLeft size={24} color="#111827" />
                                    </TouchableOpacity>
                                )}
                                {currentStep === 'date' && <View style={{ width: 24 }} />}
                                
                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                                    {getStepTitle()}
                                </Text>
                                
                                <TouchableOpacity onPress={handleClose}>
                                    <X size={24} color="#111827" />
                                </TouchableOpacity>
                            </Box>

                            <ScrollView
                                style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: 40, alignItems: 'center', paddingTop: 20 }}
                            >
                                {/* Step 1: Date Selection */}
                                {currentStep === 'date' && (
                                    <View style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16 }}>
                                        <Calendar
                                            current={selectedDateString}
                                            minDate={new Date().toISOString().split('T')[0]}
                                            onDayPress={handleDateSelect}
                                            theme={{
                                                selectedDayBackgroundColor: colors.primary[500],
                                                selectedDayTextColor: '#ffffff',
                                                todayTextColor: colors.primary[500],
                                                arrowColor: colors.primary[500],
                                                monthTextColor: '#111827',
                                                textMonthFontWeight: '600',
                                                textDayHeaderFontWeight: '500',
                                                textDisabledColor: '#d1d5db',
                                            }}
                                            markedDates={{
                                                [selectedDateString]: {
                                                    selected: true,
                                                    selectedColor: colors.primary[500]
                                                }
                                            }}
                                        />
                                    </View>
                                )}

                                {/* Step 2: Start Hour Selection */}
                                {currentStep === 'start-hour' && (
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ 
                                            backgroundColor: '#f3f4f6', 
                                            paddingHorizontal: 24, 
                                            paddingVertical: 12, 
                                            borderRadius: 12, 
                                            marginBottom: 20 
                                        }}>
                                            <Text style={{ color: '#111827', fontSize: 32, fontWeight: '700' }}>
                                                {tempStartHour.toString().padStart(2, '0')} : {tempStartMinute.toString().padStart(2, '0')}
                                            </Text>
                                        </View>
                                        <ClockPicker
                                            selectedValue={tempStartHour}
                                            onSelect={handleStartHourSelect}
                                            type="hour"
                                        />
                                    </View>
                                )}

                                {/* Step 3: Start Minute Selection */}
                                {currentStep === 'start-minute' && (
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ 
                                            backgroundColor: '#f3f4f6', 
                                            paddingHorizontal: 24, 
                                            paddingVertical: 12, 
                                            borderRadius: 12, 
                                            marginBottom: 20 
                                        }}>
                                            <Text style={{ color: '#111827', fontSize: 32, fontWeight: '700' }}>
                                                {tempStartHour.toString().padStart(2, '0')} : {tempStartMinute.toString().padStart(2, '0')}
                                            </Text>
                                        </View>
                                        <ClockPicker
                                            selectedValue={tempStartMinute}
                                            onSelect={handleStartMinuteSelect}
                                            type="minute"
                                        />
                                    </View>
                                )}

                                {/* Step 4: End Hour Selection */}
                                {currentStep === 'end-hour' && (
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <View style={{ 
                                            backgroundColor: '#f3f4f6', 
                                            paddingHorizontal: 24, 
                                            paddingVertical: 12, 
                                            borderRadius: 12, 
                                            marginBottom: 20 
                                        }}>
                                            <Text style={{ color: '#111827', fontSize: 32, fontWeight: '700' }}>
                                                {tempEndHour.toString().padStart(2, '0')} : {tempEndMinute.toString().padStart(2, '0')}
                                            </Text>
                                        </View>
                                        <ClockPicker
                                            selectedValue={tempEndHour}
                                            onSelect={handleEndHourSelect}
                                            type="hour"
                                        />
                                        
                                        <TouchableOpacity
                                            onPress={handleNoEndTime}
                                            style={{
                                                marginTop: 24,
                                                backgroundColor: '#00BBA7',
                                                paddingVertical: 14,
                                                paddingHorizontal: 32,
                                                borderRadius: 12,
                                            }}
                                        >
                                            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                                                Geen eindtijd
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Step 5: End Minute Selection */}
                                {currentStep === 'end-minute' && (
                                    <View style={{ alignItems: 'center', width: '100%' }}>
                                        <View style={{ 
                                            backgroundColor: '#f3f4f6', 
                                            paddingHorizontal: 24, 
                                            paddingVertical: 12, 
                                            borderRadius: 12, 
                                            marginBottom: 20 
                                        }}>
                                            <Text style={{ color: '#111827', fontSize: 32, fontWeight: '700' }}>
                                                {tempEndHour.toString().padStart(2, '0')} : {tempEndMinute.toString().padStart(2, '0')}
                                            </Text>
                                        </View>
                                        <ClockPicker
                                            selectedValue={tempEndMinute}
                                            onSelect={handleEndMinuteSelect}
                                            type="minute"
                                        />
                                        
                                        <TouchableOpacity
                                            onPress={handleNoEndTime}
                                            style={{
                                                marginTop: 24,
                                                backgroundColor: '#00BBA7',
                                                paddingVertical: 14,
                                                paddingHorizontal: 32,
                                                borderRadius: 12,
                                            }}
                                        >
                                            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                                                Geen eindtijd
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>
                        </Box>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
};
