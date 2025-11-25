import React, { useState, useEffect } from 'react';
import { ScrollView, Platform, KeyboardAvoidingView, Image, Modal, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Users } from 'lucide-react-native';
import { createCameraHandlers } from '@/src/utils/camera';
import uploadImageUri from '@/src/utils/storage';
import { updateEvent } from '@/src/api/event';
import { supabase } from '@/src/lib/supabase';

import { SocialStackParamList } from './SocialStack';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { PrimaryButton, TextInputField, ImageUploadBox, DateTimePicker, LocationSelector } from '@/src/components/global';
import type { EventWithDetails } from '@/src/api/event';

type PartyType = 'house-party' | 'bar-meetup' | 'outdoor-event' | 'themed-party';

export const EditParty = () => {
        const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
        const route = useRoute<RouteProp<SocialStackParamList, 'EditParty'>>();
        const party = route.params?.party;

        const [coverImage, setCoverImage] = useState<string | null>(party?.cover_image || null);
        const [partyTitle, setPartyTitle] = useState(party?.name || '');
        const [description, setDescription] = useState(party?.description || '');

        // Map database party type to frontend type
        const dbToFrontendType: Record<'house party' | 'bar meetup' | 'outdoor event' | 'themed party', PartyType> = {
                'house party': 'house-party',
                'bar meetup': 'bar-meetup',
                'outdoor event': 'outdoor-event',
                'themed party': 'themed-party',
        };
        const [selectedType, setSelectedType] = useState<PartyType>(
                party?.party_type ? dbToFrontendType[party.party_type] : 'house-party'
        );

        const [selectedLocation, setSelectedLocation] = useState('');
        const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
                party?.location_id || party?.user_location_id || null
        );
        const [maxAttendees, setMaxAttendees] = useState(party?.max_attendees?.toString() || '');
        const [entryFee, setEntryFee] = useState(party?.price?.toString() || '');
        const [isPublic, setIsPublic] = useState(party?.isPublic ?? true);
        const [requireApproval, setRequireApproval] = useState(party?.isApprovalRequired ?? false);

        // Date & Time State
        const [date, setDate] = useState(party?.start_time ? new Date(party.start_time) : new Date());
        const [startTime, setStartTime] = useState(party?.start_time ? new Date(party.start_time) : new Date());
        const [endTime, setEndTime] = useState<Date | null>(party?.end_time ? new Date(party.end_time) : null);

        // Form state
        const [isUploading, setIsUploading] = useState(false);
        const [modalVisible, setModalVisible] = useState(false);
        const [hasChanges, setHasChanges] = useState(false);

        // Store original values to detect changes
        const [originalValues] = useState({
                coverImage: party?.cover_image || null,
                partyTitle: party?.name || '',
                description: party?.description || '',
                selectedType: party?.party_type ? dbToFrontendType[party.party_type] : 'house-party',
                maxAttendees: party?.max_attendees?.toString() || '',
                entryFee: party?.price?.toString() || '',
                isPublic: party?.isPublic ?? true,
                requireApproval: party?.isApprovalRequired ?? false,
                date: party?.start_time ? new Date(party.start_time).toDateString() : new Date().toDateString(),
                startTime: party?.start_time ? new Date(party.start_time).toTimeString() : new Date().toTimeString(),
                endTime: party?.end_time ? new Date(party.end_time).toTimeString() : '',
                locationId: party?.location_id || party?.user_location_id || null,
        });

        // Initialize location display name
        useEffect(() => {
                if (party?.location?.name) {
                        setSelectedLocation(party.location.name);
                } else if (party?.user_location) {
                        const addr = `${party.user_location.street || ''} ${party.user_location.house_nr || ''}, ${party.user_location.city || ''}`.trim();
                        setSelectedLocation(party.user_location.label ? `${party.user_location.label} (${addr})` : addr);
                }
        }, [party]);

        // Detect if any changes have been made
        useEffect(() => {
                const changed =
                        coverImage !== originalValues.coverImage ||
                        partyTitle !== originalValues.partyTitle ||
                        description !== originalValues.description ||
                        selectedType !== originalValues.selectedType ||
                        maxAttendees !== originalValues.maxAttendees ||
                        entryFee !== originalValues.entryFee ||
                        isPublic !== originalValues.isPublic ||
                        requireApproval !== originalValues.requireApproval ||
                        date.toDateString() !== originalValues.date ||
                        startTime.toTimeString() !== originalValues.startTime ||
                        (endTime ? endTime.toTimeString() : '') !== originalValues.endTime ||
                        selectedLocationId !== originalValues.locationId;

                setHasChanges(changed);
        }, [
                coverImage, partyTitle, description, selectedType, maxAttendees, entryFee,
                isPublic, requireApproval, date, startTime, endTime, selectedLocationId
        ]);

        // Camera handlers
        const { handleCameraPress, handleGalleryPress } = createCameraHandlers(setCoverImage);

        const partyTypes = [
                { id: 'house-party', label: 'House Party', emoji: '🏠' },
                { id: 'bar-meetup', label: 'Bar Meetup', emoji: '🍻' },
                { id: 'outdoor-event', label: 'Outdoor Event', emoji: '🌳' },
                { id: 'themed-party', label: 'Themed Party', emoji: '🎭' },
        ] as const;

        // Map frontend party type to database enum
        const partyTypeMap: Record<PartyType, 'house party' | 'bar meetup' | 'outdoor event' | 'themed party'> = {
                'house-party': 'house party',
                'bar-meetup': 'bar meetup',
                'outdoor-event': 'outdoor event',
                'themed-party': 'themed party',
        };

        const handleUpdateParty = async () => {
                if (!party?.id) {
                        alert('Invalid party data');
                        return;
                }

                try {
                        setIsUploading(true);

                        // Ensure user is signed in
                        const { data: { user }, error: userErr } = await supabase.auth.getUser();

                        if (userErr || !user) {
                                alert('Authentication error. Please sign in and try again.');
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

                        // Upload new cover image if changed
                        let uploadedUrl: string | null = originalValues.coverImage;
                        if (coverImage && coverImage !== originalValues.coverImage) {
                                uploadedUrl = await uploadImageUri(coverImage, user.id);
                                console.log('Uploaded new cover image URL:', uploadedUrl);
                        } else if (!coverImage && originalValues.coverImage) {
                                // Image was removed
                                uploadedUrl = null;
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

                        // Update the event
                        const updatedEvent = await updateEvent(party.id, {
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
                        });

                        if (!updatedEvent) {
                                alert('Failed to update party. Please try again.');
                                return;
                        }

                        // Show confirmation modal
                        setModalVisible(true);
                } catch (e) {
                        console.error('Error updating party', e);
                        alert('Failed to update party. See console for details.');
                } finally {
                        setIsUploading(false);
                }
        };

        const handleModalConfirm = () => {
                setModalVisible(false);
                // Navigate back to party details or social main
                navigation.goBack();
        };

        // Track if user has filled in any required field
        const canSubmit = !!partyTitle.trim() && !!description.trim() && !!selectedLocationId;

        return (
                <Box className="flex-1 bg-gray-50">
                        <TopBar title="Edit Party" showBack onBackPress={() => navigation.goBack()} />
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
                                        {/* Cover Image Upload */}
                                        <Box className="mb-6">
                                                <Text className="text-sm text-neutral-950 mb-2">Party Cover Image</Text>
                                                <ImageUploadBox
                                                        onCameraPress={handleCameraPress}
                                                        onGalleryPress={handleGalleryPress}
                                                />
                                                {coverImage && (
                                                        <Box className="mt-3 rounded-xl overflow-hidden">
                                                                <Image source={{ uri: coverImage }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                                                        </Box>
                                                )}
                                        </Box>

                                        {/* Party Title */}
                                        <Box className="mb-6">
                                                <TextInputField
                                                        label="Party Name"
                                                        required
                                                        value={partyTitle}
                                                        onChangeText={(text) => {
                                                                const filtered = text.replace(/[^a-zA-Z\s]/g, '');
                                                                setPartyTitle(filtered);
                                                        }}
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

                                        {/* Update Party Button */}
                                        <PrimaryButton
                                                title={isUploading ? 'Updating Party...' : 'Update Party'}
                                                onPress={handleUpdateParty}
                                                disabled={!canSubmit || isUploading || !hasChanges}
                                        />
                                        {!canSubmit && (
                                                <Text className="text-sm text-red-500 mt-2">
                                                        Please complete all required fields: party name, description, and location.
                                                </Text>
                                        )}
                                        {canSubmit && !hasChanges && (
                                                <Text className="text-sm text-neutral-600 mt-2 text-center">
                                                        Make changes to enable the update button
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
                                                <Text className="text-lg font-semibold text-neutral-900 mb-3 text-center">
                                                        Party Updated Successfully!
                                                </Text>
                                                <Text className="text-neutral-600 mb-6 text-center">
                                                        Your party details have been updated.
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
