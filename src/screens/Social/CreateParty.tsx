import React, { useState } from 'react';
import { ScrollView, Platform, KeyboardAvoidingView, Image, Modal, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Users } from 'lucide-react-native';
import { createCameraHandlers } from '@/src/utils/camera';
import uploadImageUri from '@/src/utils/storage';
import { createEvent } from '@/src/api/event';
import { supabase } from '@/src/lib/supabase';

import { SocialStackParamList } from './SocialStack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { PrimaryButton, TextInputField, ImageUploadBox, DateTimePicker, LocationSelector, Heading } from '@/src/components/global';

type PartyType = 'house-party' | 'bar-meetup' | 'outdoor-event' | 'themed-party' | 'workshop' | 'tasting';

export const CreateParty = () => {
    const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [partyTitle, setPartyTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<PartyType>('house-party');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [maxAttendees, setMaxAttendees] = useState('');
    const [entryFee, setEntryFee] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [requireApproval, setRequireApproval] = useState(false);

    // Date & Time State
    const initStartTime = () => {
        const start = new Date();
        start.setHours(22, 0, 0, 0);
        return start;
    };

    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(initStartTime());
    const [endTime, setEndTime] = useState<Date | null>(null);

    // Form interaction and submission state
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Camera handlers
    const { handleCameraPress, handleGalleryPress } = createCameraHandlers(setCoverImage);

    const partyTypes = [
        { id: 'house-party', label: 'House Party', emoji: '🏠' },
        { id: 'bar-meetup', label: 'Bar Meetup', emoji: '🍻' },
        { id: 'outdoor-event', label: 'Outdoor Event', emoji: '🌳' },
        { id: 'themed-party', label: 'Themed Party', emoji: '🎭' },
        { id: 'workshop', label: 'Workshop', emoji: '🛠️' },
        { id: 'tasting', label: 'Tasting', emoji: '🍷' },
    ] as const;

    // Map frontend party type to database enum
    const partyTypeMap: Record<PartyType, 'house party' | 'bar meetup' | 'outdoor event' | 'themed party' | 'workshop' | 'tasting'> = {
        'house-party': 'house party',
        'bar-meetup': 'bar meetup',
        'outdoor-event': 'outdoor event',
        'themed-party': 'themed party',
        'workshop': 'workshop',
        'tasting': 'tasting',
    };

    const handleCreateParty = async () => {
        try {
            setIsUploading(true);

            // Ensure user is signed in
            const { data: { user }, error: userErr } = await supabase.auth.getUser();

            if (userErr) {
                // console.error('Error fetching user', userErr);
                alert('Authentication error. Please sign in and try again.');
                return;
            }

            if (!user) {
                alert('You must be signed in to create a party. Please sign in and try again.');
                return;
            }

            // Validate required fields
            const missing: string[] = [];
            if (!partyTitle.trim()) missing.push('party name');
            if (!description.trim()) missing.push('description');
            if (!selectedLocationId) missing.push('location');

            if (missing.length > 0) {
                alert(`Please fill required fields: ${missing.join(', ')}`);
                return;
            }

            // Upload cover image if present
            let uploadedUrl: string | null = null;
            if (coverImage) {
                uploadedUrl = await uploadImageUri(coverImage, user.id, undefined, 'party_images');
                // console.log('Uploaded cover image URL:', uploadedUrl);
            }

            // Combine date and time into ISO strings
            const startDateTime = new Date(date);
            startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

            let endDateTime: string | null = null;
            if (endTime) {
                const end = new Date(date);
                end.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
                // If end time is before start time, it's the next day
                if (end < startDateTime) {
                    end.setDate(end.getDate() + 1);
                }
                endDateTime = end.toISOString();
            }

            // Determine if using public location or user location
            const isUserLocation = selectedLocation.includes('('); // User locations include address in parentheses

            // Create the event
            const event = await createEvent({
                name: partyTitle.trim(),
                description: description.trim(),
                party_type: partyTypeMap[selectedType],
                location_id: isUserLocation ? null : selectedLocationId,
                user_location_id: isUserLocation ? selectedLocationId : null,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime,
                max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
                price: entryFee ? parseInt(entryFee) : null,
                isPublic: isPublic,
                isApprovalRequired: requireApproval,
                cover_image: uploadedUrl,
                type: 'party',
            });

            if (!event) {
                alert('Failed to create party. Please try again.');
                return;
            }

            // Clear form fields
            setCoverImage(null);
            setPartyTitle('');
            setDescription('');
            setSelectedType('house-party');
            setSelectedLocation('');
            setSelectedLocationId(null);
            setMaxAttendees('');
            setEntryFee('');
            setIsPublic(true);
            setRequireApproval(false);
            setDate(new Date());
            setStartTime(initStartTime());
            setEndTime(null);

            // Reset interaction state
            setHasInteracted(false);

            // Show confirmation modal
            setModalVisible(true);
        } catch (e) {
            // console.error('Error creating party', e);
            alert('Failed to create party. See console for details.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleModalConfirm = () => {
        setModalVisible(false);
        // Navigate back to social main
        navigation.navigate('SocialMain', { initialView: 'parties' });
    };

    // Track if user has filled in any required field
    const canSubmit = !!partyTitle.trim() && !!description.trim() && !!selectedLocationId;

    return (
        <Box className="flex-1 bg-gray-50">
            <TopBar title="Create Party" showBack onBackPress={() => navigation.goBack()} />
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
                            onCameraPress={handleCameraPress}
                            onGalleryPress={handleGalleryPress}
                            imageUri={coverImage}
                        />
                    </Box>

                    {/* Party Title */}
                    <Box className="mb-6">
                        <TextInputField
                            label="Party Name"
                            required
                            value={partyTitle}
                            onChangeText={(text) => {
                                // Only allow letters and spaces
                                const filtered = text.replace(/[^a-zA-Z\s]/g, '');
                                setPartyTitle(filtered);
                                if (!hasInteracted && filtered.length > 0) setHasInteracted(true);
                            }}
                            placeholder="e.g., Summer Cocktail Night"
                            onSubmitEditing={handleCreateParty}
                        />
                    </Box>

                    {/* Description */}
                    <Box className="mb-6">
                        <TextInputField
                            label="Description"
                            required
                            value={description}
                            onChangeText={(text) => {
                                setDescription(text);
                                if (!hasInteracted && text.trim().length > 0) setHasInteracted(true);
                            }}
                            placeholder="Tell people what your party is all about..."
                            multiline
                            numberOfLines={3}
                        />
                    </Box>

                    {/* Date & Time */}
                    <DateTimePicker
                        date={date}
                        startTime={startTime}
                        endTime={endTime}
                        onDateChange={setDate}
                        onStartTimeChange={setStartTime}
                        onEndTimeChange={setEndTime}
                    />

                    {/* Location */}
                    <LocationSelector
                        selectedLocation={selectedLocation}
                        selectedLocationId={selectedLocationId}
                        onLocationChange={(location, locationId) => {
                            setSelectedLocation(location);
                            setSelectedLocationId(locationId);
                        }}
                    />

                    {/* Max Attendees */}
                    <Box className="mb-6">
                        <TextInputField
                            label="Max Attendees"
                            value={maxAttendees}
                            onChangeText={(text) => {
                                // Only allow numbers
                                const filtered = text.replace(/[^0-9]/g, '');
                                setMaxAttendees(filtered);
                            }}
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
                            onChangeText={(text) => {
                                // Only allow numbers
                                const filtered = text.replace(/[^0-9]/g, '');
                                setEntryFee(filtered);
                            }}
                            placeholder="10"
                            keyboardType="numeric"
                            icon={<Text className="text-base text-neutral-900">€</Text>}
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
                                    style={{ minWidth: '45%', flexGrow: 1, flexBasis: '45%' }}
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

                    {/* Create Party Button */}
                    <PrimaryButton
                        title="Create Party"
                        onPress={handleCreateParty}
                        loading={isUploading}
                        disabled={!canSubmit || isUploading}
                    />
                    {!canSubmit && hasInteracted && (
                        <Text className="text-sm text-red-500 mt-2">
                            Please complete all required fields: party name, description, and location.
                        </Text>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Confirmation Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleModalConfirm}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <Box className="w-full max-w-sm bg-white rounded-2xl p-6">
                        <Heading level="h5" className="mb-3 text-center">
                            Party Created Successfully!
                        </Heading>
                        <Text className="text-neutral-600 mb-6 text-center">
                            Your party has been created and is now visible to others.
                        </Text>
                        <PrimaryButton
                            title="OK"
                            onPress={handleModalConfirm}
                        />
                    </Box>
                </View>
            </Modal>
        </Box>
    );
};
