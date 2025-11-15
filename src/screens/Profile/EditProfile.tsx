import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton, TextInputField } from '@/src/components/global';
import { useAuth } from '@/src/hooks/useAuth';
import { fetchProfile, updateProfile } from '@/src/api/profile';
import type { Profile } from '@/src/types/profile';
import { Center } from '@/src/components/ui/center';
import { createCameraHandlers } from '@/src/utils/camera';
import { Pencil, Camera, Image as ImageIcon, X } from 'lucide-react-native';

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
            setUploading(true);
            try {
                // Convert to base64 for web, or keep URI for native
                if (uri.startsWith('blob:') || uri.startsWith('file:')) {
                    const response = await fetch(uri);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        setTempImageUri(base64data);
                        setUploading(false);
                    };
                    reader.readAsDataURL(blob);
                } else {
                    setTempImageUri(uri);
                    setUploading(false);
                }
            } catch (error) {
                console.error('Error processing image:', error);
                setTempImageUri(uri);
                setUploading(false);
            }
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
        
        // Use temp image if available, otherwise keep existing avatar
        const finalAvatarUrl = tempImageUri || avatarUrl;
        
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
            <TopBar title="Edit Profile" showBack onBackPress={() => navigation.goBack()} />
            <ScrollView
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{ paddingBottom: spacing.screenBottom }}
            >
                {loading ? (
                    <Box className="mb-6 items-center py-8">
                        <ActivityIndicator size="large" color="#14b8a6" />
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
                            title={uploading ? "Uploading image..." : saving ? "Saving..." : "Save Changes"}
                            onPress={handleSave}
                            disabled={saving || uploading}
                        />
                    </>
                )}
            </ScrollView>

            {/* Image Picker Modal */}
            <Modal
                visible={showImagePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowImagePicker(false)}
            >
                <TouchableOpacity 
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowImagePicker(false)}
                >
                    <TouchableOpacity 
                        activeOpacity={1} 
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Box className="bg-white rounded-t-3xl p-6">
                            <Box className="flex-row justify-between items-center mb-4">
                                <Text className="text-xl font-semibold">Change Profile Picture</Text>
                                <Pressable onPress={() => setShowImagePicker(false)}>
                                    <X size={24} color="#666" />
                                </Pressable>
                            </Box>

                            <TouchableOpacity
                                className="bg-gray-50 rounded-xl p-4 mb-3 flex-row items-center"
                                onPress={handleCameraPress}
                            >
                                <Box className="bg-teal-500 rounded-full p-3 mr-4">
                                    <Camera size={24} color="white" />
                                </Box>
                                <Box>
                                    <Text className="text-base font-medium text-neutral-900">Take Photo</Text>
                                    <Text className="text-sm text-gray-600">Use your camera</Text>
                                </Box>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-gray-50 rounded-xl p-4 flex-row items-center"
                                onPress={handleGalleryPress}
                            >
                                <Box className="bg-teal-500 rounded-full p-3 mr-4">
                                    <ImageIcon size={24} color="white" />
                                </Box>
                                <Box>
                                    <Text className="text-base font-medium text-neutral-900">Choose from Library</Text>
                                    <Text className="text-sm text-gray-600">Select an existing photo</Text>
                                </Box>
                            </TouchableOpacity>
                        </Box>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </Box>
    );
};

export default EditProfile;
