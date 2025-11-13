import React, { useState } from 'react';
import { ScrollView, Modal, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/src/screens/navigation/types';
import { PrimaryButton } from '@/src/components/global';
import { colors } from '@/src/theme/colors';
import { supabase } from '@/src/lib/supabase';

const Settings: React.FC = () => {
    const navigation = useNavigation();
    const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

    
    const handleLogout = async () => {
        setShowLogoutDialog(false);

        const { error } = await supabase.auth.signOut();
        if (error) {
            setLogoutMessage(error.message);
        }
    };
    
    const [pushNotifications, setPushNotifications] = useState(true);
    const [friendRequests, setFriendRequests] = useState(true);
    const [partyInvites, setPartyInvites] = useState(false);
    const [cocktailSuggestions, setCocktailSuggestions] = useState(false);

    const [privateAccount, setPrivateAccount] = useState(false);
    const [showActivityStatus, setShowActivityStatus] = useState(true);
    const [locationServices, setLocationServices] = useState(true);

    const [darkMode, setDarkMode] = useState(false);
    const [compactView, setCompactView] = useState(false);

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Settings" showBack onBackPress={() => navigation.goBack()} />
            <ScrollView
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{ paddingBottom: spacing.screenBottom }}
            >
                {/* Notifications */}
                <Box className="mb-4 bg-white rounded-2xl p-4">
                    <Text className="text-base text-neutral-900 mb-3">Notifications</Text>
                    <Box className="mb-3 flex-row items-start justify-between">
                        <Box style={{ flex: 1 }}>
                            <Text className="text-sm font-medium text-neutral-800">Push Notifications</Text>
                            <Text className="text-xs text-neutral-500">Get notified about new activities</Text>
                        </Box>
                        <Pressable onPress={() => setPushNotifications(!pushNotifications)} className={`w-12 h-6 rounded-full ${pushNotifications ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${pushNotifications ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>

                    <Box className="mb-3 flex-row items-start justify-between">
                        <Box style={{ flex: 1 }}>
                            <Text className="text-sm font-medium text-neutral-800">Friend Requests</Text>
                            <Text className="text-xs text-neutral-500">Notify when someone sends a request</Text>
                        </Box>
                        <Pressable onPress={() => setFriendRequests(!friendRequests)} className={`w-12 h-6 rounded-full ${friendRequests ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${friendRequests ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>

                    <Box className="mb-3 flex-row items-start justify-between">
                        <Box style={{ flex: 1 }}>
                            <Text className="text-sm font-medium text-neutral-800">Party Invites</Text>
                            <Text className="text-xs text-neutral-500">Get notified about party invitations</Text>
                        </Box>
                        <Pressable onPress={() => setPartyInvites(!partyInvites)} className={`w-12 h-6 rounded-full ${partyInvites ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${partyInvites ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>

                    <Box className="flex-row items-start justify-between">
                        <Box style={{ flex: 1 }}>
                            <Text className="text-sm font-medium text-neutral-800">Cocktail Suggestions</Text>
                            <Text className="text-xs text-neutral-500">Daily cocktail recommendations</Text>
                        </Box>
                        <Pressable onPress={() => setCocktailSuggestions(!cocktailSuggestions)} className={`w-12 h-6 rounded-full ${cocktailSuggestions ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${cocktailSuggestions ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>
                </Box>

                {/* Privacy */}
                <Box className="mb-4 bg-white rounded-2xl p-4">
                    <Text className="text-base text-neutral-900 mb-3">Privacy</Text>
                    <Box className="mb-3 flex-row items-center justify-between">
                        <Text className="text-sm text-neutral-600">Private Account</Text>
                        <Pressable onPress={() => setPrivateAccount(!privateAccount)} className={`w-12 h-6 rounded-full ${privateAccount ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${privateAccount ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>
                    <Box className="mb-3 flex-row items-center justify-between">
                        <Text className="text-sm text-neutral-600">Show Activity Status</Text>
                        <Pressable onPress={() => setShowActivityStatus(!showActivityStatus)} className={`w-12 h-6 rounded-full ${showActivityStatus ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${showActivityStatus ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>
                    <Box className="flex-row items-center justify-between">
                        <Text className="text-sm text-neutral-600">Location Services</Text>
                        <Pressable onPress={() => setLocationServices(!locationServices)} className={`w-12 h-6 rounded-full ${locationServices ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${locationServices ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>
                </Box>

                {/* Appearance */}
                <Box className="mb-4 bg-white rounded-2xl p-4">
                    <Text className="text-base text-neutral-900 mb-3">Appearance</Text>
                    <Box className="mb-3 flex-row items-center justify-between">
                        <Text className="text-sm text-neutral-600">Dark Mode</Text>
                        <Pressable onPress={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full ${darkMode ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${darkMode ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>
                    <Box className="flex-row items-center justify-between">
                        <Text className="text-sm text-neutral-600">Compact View</Text>
                        <Pressable onPress={() => setCompactView(!compactView)} className={`w-12 h-6 rounded-full ${compactView ? 'bg-teal-500' : 'bg-neutral-200'} justify-center`}>
                            <Box className={`w-5 h-5 rounded-full bg-white shadow ${compactView ? 'ml-6' : 'ml-0'}`} />
                        </Pressable>
                    </Box>
                </Box>

                {/* Language / Help rows */}
                <Box className="mb-4 bg-white rounded-2xl">
                    <Pressable className="p-4 border-b border-neutral-100 flex-row justify-between items-center">
                        <Box>
                            <Text className="text-sm font-medium text-neutral-800">Language</Text>
                            <Text className="text-xs text-neutral-500">English</Text>
                        </Box>
                        <Text className="text-neutral-400">›</Text>
                    </Pressable>
                    <Pressable className="p-4 flex-row justify-between items-center">
                        <Box>
                            <Text className="text-sm font-medium text-neutral-800">Help & Support</Text>
                            <Text className="text-xs text-neutral-500">FAQs, Contact us</Text>
                        </Box>
                        <Text className="text-neutral-400">›</Text>
                    </Pressable>
                </Box>

                {/* Account actions */}
                <Box className="mb-6 bg-white rounded-2xl p-4">
                    <Pressable 
                        className="py-3 border-b border-neutral-100"
                        onPress={() => setShowLogoutDialog(true)}
                    >
                        <Text className="text-sm text-neutral-800">Log Out</Text>
                    </Pressable>
                    <Pressable className="py-3">
                        <Text className="text-sm text-red-500">Delete Account</Text>
                    </Pressable>
                    {logoutMessage && (
                        <Text className="text-center text-red-500 mb-4">
                            {logoutMessage}
                        </Text>
                    )}
                </Box>

                <PrimaryButton
                    title="Save Settings"
                    onPress={() => navigation.goBack()}
                />
            </ScrollView>

            {/* Logout Confirmation Dialog */}
            <Modal
                visible={showLogoutDialog}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutDialog(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <Box className="w-full max-w-sm bg-white rounded-2xl p-4">
                        <Text className="text-lg font-semibold text-neutral-900 mb-3 text-center">
                            Log Out
                        </Text>
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
        </Box>
    );
};

export default Settings;
