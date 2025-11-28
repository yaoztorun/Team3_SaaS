import React, { useState, useEffect } from 'react';
import { ScrollView, Modal, View, Linking, Alert, ActivityIndicator } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { spacing } from '@/src/theme/spacing';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/src/screens/navigation/types';
import { PrimaryButton, Heading } from '@/src/components/global';
import { colors } from '@/src/theme/colors';
import { supabase } from '@/src/lib/supabase';
import { ArrowLeft } from 'lucide-react-native';
import { fetchUserSettings, updateUserSettings } from '@/src/api/settings';
import { UserSettings } from '@/src/types/settings';

const Settings: React.FC = () => {
    const navigation = useNavigation();
    const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
    const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings state
    const [settings, setSettings] = useState<UserSettings>({
        privacy: {
            is_private: false,
        },
        notifications: {
            likes: true,
            comments: true,
            party_invites: false,
            friend_requests: true,
        },
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setLoading(true);
        const userSettings = await fetchUserSettings(user.id);
        setSettings(userSettings);
        setLoading(false);
    };

    const handleSaveSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setSaving(true);
        const result = await updateUserSettings(user.id, settings);
        setSaving(false);

        if (result.success) {
            Alert.alert('Success', 'Settings saved successfully');
            navigation.goBack();
        } else {
            Alert.alert('Error', result.error || 'Failed to save settings');
        }
    };

    const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value,
            },
        }));
    };

    const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: boolean) => {
        setSettings(prev => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [key]: value,
            },
        }));
    };

    
    const handleLogout = async () => {
        setShowLogoutDialog(false);

        const { error } = await supabase.auth.signOut();
        if (error) {
            setLogoutMessage(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        setShowDeleteAccountDialog(false);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
        console.error("No session found.");
        return;
        }

        const { data, error } = await supabase.functions.invoke("delete-user", {
            headers: {
            Authorization: `Bearer ${session?.access_token}`
            }
        });
        
        if (error) {
            console.error(error);
            return;
        }

        await supabase.auth.signOut();
    };

    const appVersion = '1.0.0'; // From package.json

    return (
        <Box className="flex-1 bg-neutral-50">
            <Box className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center">
                <Pressable onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#000" />
                </Pressable>
                <Heading level="h4">Settings</Heading>
            </Box>

            {loading ? (
                <Box className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </Box>
            ) : (
                <ScrollView
                    className="flex-1 px-4 pt-6"
                    contentContainerStyle={{ paddingBottom: spacing.screenBottom }}
                >
                    {/* Notifications */}
                    <Box className="mb-4 bg-white rounded-2xl p-4">
                        <Text className="text-base text-neutral-900 mb-3">Notifications</Text>

                        <Box className="mb-3 flex-row items-start justify-between">
                            <Box style={{ flex: 1 }}>
                                <Text className="text-sm font-medium text-neutral-800">Friend Requests</Text>
                                <Text className="text-xs text-neutral-500">Notify when someone sends a friend request</Text>
                            </Box>
                            <Pressable 
                                onPress={() => updateNotificationSetting('friend_requests', !settings.notifications.friend_requests)} 
                                className={`w-12 h-6 rounded-full ${settings.notifications.friend_requests ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}
                            >
                                <Box className={`w-5 h-5 rounded-full bg-white shadow ${settings.notifications.friend_requests ? 'ml-6' : 'ml-0'}`} />
                            </Pressable>
                        </Box>

                        <Box className="mb-3 flex-row items-start justify-between">
                            <Box style={{ flex: 1 }}>
                                <Text className="text-sm font-medium text-neutral-800">Party Invites</Text>
                                <Text className="text-xs text-neutral-500">Notify when someone invites you to a party</Text>
                            </Box>
                            <Pressable 
                                onPress={() => updateNotificationSetting('party_invites', !settings.notifications.party_invites)} 
                                className={`w-12 h-6 rounded-full ${settings.notifications.party_invites ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}
                            >
                                <Box className={`w-5 h-5 rounded-full bg-white shadow ${settings.notifications.party_invites ? 'ml-6' : 'ml-0'}`} />
                            </Pressable>
                        </Box>

                        <Box className="mb-3 flex-row items-start justify-between">
                            <Box style={{ flex: 1 }}>
                                <Text className="text-sm font-medium text-neutral-800">Likes</Text>
                                <Text className="text-xs text-neutral-500">Notify when someone likes your post</Text>
                            </Box>
                            <Pressable 
                                onPress={() => updateNotificationSetting('likes', !settings.notifications.likes)} 
                                className={`w-12 h-6 rounded-full ${settings.notifications.likes ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}
                            >
                                <Box className={`w-5 h-5 rounded-full bg-white shadow ${settings.notifications.likes ? 'ml-6' : 'ml-0'}`} />
                            </Pressable>
                        </Box>

                        <Box className="flex-row items-start justify-between">
                            <Box style={{ flex: 1 }}>
                                <Text className="text-sm font-medium text-neutral-800">Comments</Text>
                                <Text className="text-xs text-neutral-500">Notify when someone comments on your post</Text>
                            </Box>
                            <Pressable 
                                onPress={() => updateNotificationSetting('comments', !settings.notifications.comments)} 
                                className={`w-12 h-6 rounded-full ${settings.notifications.comments ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}
                            >
                                <Box className={`w-5 h-5 rounded-full bg-white shadow ${settings.notifications.comments ? 'ml-6' : 'ml-0'}`} />
                            </Pressable>
                        </Box>
                    </Box>

                    {/* Privacy */}
                    <Box className="mb-4 bg-white rounded-2xl p-4">
                        <Text className="text-base text-neutral-900 mb-3">Privacy</Text>
                        <Box className="flex-row items-start justify-between">
                            <Box style={{ flex: 1 }}>
                                <Text className="text-sm font-medium text-neutral-800">Private Account</Text>
                                <Text className="text-xs text-neutral-500">Only approved followers can see your content</Text>
                            </Box>
                            <Pressable 
                                onPress={() => updatePrivacySetting('is_private', !settings.privacy.is_private)} 
                                className={`w-12 h-6 rounded-full ${settings.privacy.is_private ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}
                            >
                                <Box className={`w-5 h-5 rounded-full bg-white shadow ${settings.privacy.is_private ? 'ml-6' : 'ml-0'}`} />
                            </Pressable>
                        </Box>
                    </Box>

                    {/* Legal & Info */}
                    <Box className="mb-4 bg-white rounded-2xl">
                        <Pressable 
                            className="p-4 border-b border-neutral-100 flex-row justify-between items-center"
                            onPress={() => Linking.openURL('https://your-privacy-policy-url.com')}
                        >
                            <Text className="text-sm font-medium text-neutral-800">Privacy Policy</Text>
                            <Text className="text-neutral-400">›</Text>
                        </Pressable>
                        <Pressable 
                            className="p-4 flex-row justify-between items-center"
                            onPress={() => Linking.openURL('https://your-terms-of-service-url.com')}
                        >
                            <Text className="text-sm font-medium text-neutral-800">Terms of Service</Text>
                            <Text className="text-neutral-400">›</Text>
                        </Pressable>
                    </Box>

                    {/* App Info */}
                    <Box className="mb-4 bg-white rounded-2xl p-4">
                        <Text className="text-base text-neutral-900 mb-3">App Info</Text>
                        <Box className="flex-row justify-between items-center mb-2">
                            <Text className="text-sm text-neutral-600">Version</Text>
                            <Text className="text-sm text-neutral-800">{appVersion}</Text>
                        </Box>
                        <Box className="flex-row justify-between items-center">
                            <Text className="text-sm text-neutral-600">Build</Text>
                            <Text className="text-sm text-neutral-800">1</Text>
                        </Box>
                    </Box>

                    {/* Account actions */}
                    <Box className="mb-6 bg-white rounded-2xl p-4">
                        <Pressable 
                            className="py-3 border-b border-neutral-100"
                            onPress={() => setShowLogoutDialog(true)}
                        >
                            <Text className="text-sm text-neutral-800">Log Out</Text>
                        </Pressable>

                        <Pressable 
                            className="py-3" 
                            onPress={() => setShowDeleteAccountDialog(true)}
                        >
                            <Text className="text-sm text-red-500">Delete Account</Text>
                        </Pressable>
                        {logoutMessage && (
                            <Text className="text-center text-red-500 mb-4">
                                {logoutMessage}
                            </Text>
                        )}
                    </Box>

                    {/* Credits */}
                    <Box className="mb-6 bg-white rounded-2xl p-4">
                        <Text className="text-base text-neutral-900 mb-3">Credits</Text>
                        <Text className="text-xs text-neutral-600 leading-5">
                            Icons made by{' '}
                            <Text 
                                className="text-xs text-teal-500 underline"
                                onPress={() => Linking.openURL('https://www.flaticon.com/authors/rudiyana')}
                            >
                                Rudiyana
                            </Text>
                            {' '}from{' '}
                            <Text 
                                className="text-xs text-teal-500 underline"
                                onPress={() => Linking.openURL('https://www.flaticon.com/')}
                            >
                                www.flaticon.com
                            </Text>
                        </Text>
                    </Box>

                    <PrimaryButton
                        title={saving ? "Saving..." : "Save Settings"}
                        onPress={handleSaveSettings}
                        disabled={saving}
                    />
                </ScrollView>
            )}

            {/* Logout Confirmation Dialog */}
            <Modal
                visible={showLogoutDialog}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutDialog(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <Box className="w-full max-w-sm bg-white rounded-2xl p-4">
                        <Heading level="h2" className="mb-3 text-center">
                            Log Out
                        </Heading>
                        <Text className="text-neutral-600 mb-6 text-center">
                            Are you sure you want to log out?
                        </Text>
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => setShowLogoutDialog(false)}
                                className="flex-1 py-3 rounded-xl bg-neutral-100"
                            >
                                <Text className="text-neutral-900 text-center font-medium">
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleLogout}
                                className="flex-1 py-3 rounded-xl"
                                style={{ backgroundColor: colors.primary[500] }}
                            >
                                <Text className="text-white text-center font-medium">
                                    Log Out
                                </Text>
                            </Pressable>
                        </View>
                    </Box>
                </View>
            </Modal>

            {/* TODO: Delete account confirmation dialog */}
            <Modal
                visible={showDeleteAccountDialog}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteAccountDialog(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <Box className="w-full max-w-sm bg-white rounded-2xl p-4">
                        <Heading level="h2" className="mb-3 text-center">
                            Delete Account
                        </Heading>
                        <Text 
                            className="text-neutral-600 mb-6 text-center font-bold"
                            style={{ color: colors.red}}
                        >
                            Are you sure you want to delete your account? This action cannot be undone!
                        </Text>
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => setShowDeleteAccountDialog(false)}
                                className="flex-1 py-3 rounded-xl bg-neutral-100"
                            >
                                <Text className="text-neutral-900 text-center font-medium">
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleDeleteAccount}
                                className="flex-1 py-3 rounded-xl"
                                style={{ backgroundColor: colors.red }}
                            >
                                <Text className="text-white text-center font-medium">
                                    Delete Account
                                </Text>
                            </Pressable>
                        </View>
                    </Box>
                </View>
            </Modal>
        </Box>
    );
};

export default Settings;
