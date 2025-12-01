import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, ActivityIndicator } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton, TextInputField, ImagePickerModal, Heading } from '@/src/components/global';
import { useAuth } from '@/src/hooks/useAuth';
import { fetchProfile, updateProfile } from '@/src/api/profile';
import { uploadProfileImage, deleteProfileImage } from '@/src/api/storage';
import type { Profile } from '@/src/types/profile';
import { Center } from '@/src/components/ui/center';
import { createCameraHandlers } from '@/src/utils/camera';
import { Pencil, ArrowLeft } from 'lucide-react-native';

const EditProfile: React.FC = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [tempImageUri, setTempImageUri] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [showImagePicker, setShowImagePicker] = useState(false);

    const handleImageSelected = async (uri: string | null) => {
        if (uri) {
            // Just store the URI temporarily - will upload when saving
            setTempImageUri(uri);
        }
        setShowImagePicker(false);
    };

    const { handleCameraPress, handleGalleryPress } = createCameraHandlers(handleImageSelected);

    useEffect(() => {
        const loadProfile = async () => {
            if (user?.id) {
                setLoading(true);
                const profileData = await fetchProfile(user.id);
                if (profileData) {
                    setProfile(profileData);
                    setFullName(profileData.full_name || '');
                    setAvatarUrl(profileData.avatar_url || '');
                    setEmail(profileData.email || user.email || '');
                }
                setLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user?.id) return;
        
        setSaving(true);
        let finalAvatarUrl = avatarUrl;
        
        // If user selected a new image, upload it to Storage first
        if (tempImageUri) {
            setUploading(true);
            
            // Delete old avatar if it exists and is stored in our bucket
            if (avatarUrl && avatarUrl.includes('/storage/v1/object/public/avatars/')) {
                const { error: deleteError } = await deleteProfileImage(avatarUrl);
                if (deleteError) {
                    console.warn('Failed to delete old avatar:', deleteError);
                    // Continue anyway - don't block the update
                }
            }
            
            const uploadResult = await uploadProfileImage(user.id, tempImageUri);
            setUploading(false);
            
            if (uploadResult.error) {
                alert('Failed to upload image: ' + uploadResult.error);
                setSaving(false);
                return;
            }
            
            finalAvatarUrl = uploadResult.url || avatarUrl;
        }
        
        const result = await updateProfile(user.id, {
            full_name: fullName,
            avatar_url: finalAvatarUrl || null,
        });
        setSaving(false);
        
        if (result.success) {
            navigation.goBack();
        } else {
            alert('Failed to save profile: ' + result.error);
        }
    };

    return (
        <Box className="flex-1 bg-neutral-50">
            <Box className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center">
                <Pressable onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#000" />
                </Pressable>
                <Heading level="h4">Edit Profile</Heading>
            </Box>
            <ScrollView
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{ paddingBottom: spacing.screenBottom }}
            >
                {loading ? (
                    <Box className="mb-6 items-center py-8">
                        <ActivityIndicator size="large" color="#00BBA7" />
                    </Box>
                ) : (
                    <Box className="mb-6 items-center">
                        <Box className="relative">
                            {(tempImageUri || avatarUrl) ? (
                                <Box className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                                    <Image 
                                        source={{ uri: tempImageUri || avatarUrl }} 
                                        style={{ width: 96, height: 96 }}
                                        resizeMode="cover"
                                    />
                                </Box>
                            ) : (
                                <Center className="h-24 w-24 rounded-full bg-teal-600">
                                    <Text className="text-2xl text-white">
                                        {fullName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || '?'}
                                    </Text>
                                </Center>
                            )}
                            <Pressable 
                                className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-2"
                                onPress={() => setShowImagePicker(true)}
                            >
                                <Pencil size={16} color="white" />
                            </Pressable>
                        </Box>
                    </Box>
                )}

                {!loading && (
                    <>
                        <Box className="mb-4 bg-white rounded-xl p-4 shadow-sm">
                            <Box className="mb-4">
                                <TextInputField
                                    label="Full Name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Enter your full name"
                                    onSubmitEditing={handleSave}
                                />
                            </Box>

                            <Box>
                                <Text className="text-sm font-semibold text-neutral-800 mb-2">Email</Text>
                                <Box className="bg-gray-100 rounded-lg px-3 py-3">
                                    <Text className="text-base text-gray-600">{email}</Text>
                                </Box>
                                <Text className="text-xs text-gray-500 mt-1">Email cannot be changed</Text>
                            </Box>
                        </Box>

                        <PrimaryButton
                            title="Save Changes"
                            onPress={handleSave}
                            loading={saving || uploading}
                            disabled={saving || uploading}
                        />
                    </>
                )}
            </ScrollView>

            {/* Image Picker Modal */}
            <ImagePickerModal
                visible={showImagePicker}
                onClose={() => setShowImagePicker(false)}
                onCameraPress={handleCameraPress}
                onGalleryPress={handleGalleryPress}
                title="Change Profile Picture"
            />
        </Box>
    );
};

export default EditProfile;
