import { useFocusEffect } from '@react-navigation/native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Pressable } from '@/src/components/ui/pressable';
import { FriendsView } from './FriendsView';
import { PartiesView } from './PartiesView';
import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, Text, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SocialStackParamList } from './SocialStack';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/button';
import { Center } from '@/src/components/ui/center';
import { HStack } from '@/src/components/ui/hstack';
import { SearchBar, ToggleSwitch } from '@/src/components/global';
import { useAuth } from '@/src/hooks/useAuth';
import { 
    searchUsers, 
    sendFriendRequest, 
    getPendingFriendRequests, 
    getSentFriendRequests,
    acceptFriendRequest, 
    rejectFriendRequest, 
    getFriends,
    getFriendshipStatus 
} from '@/src/api/friendship';
import type { Profile } from '@/src/types/profile';
import type { FriendRequest, Friend } from '@/src/types/friendship';


type ViewType = 'friends' | 'parties';

export const SocialScreen = () => {
    const route = useRoute();
    const initialView = (route.params as { initialView?: ViewType })?.initialView || 'friends';
    const [activeView, setActiveView] = useState<ViewType>(initialView);
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh friends data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setRefreshKey(prev => prev + 1);
        }, [])
    );

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Social" showLogo />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* View Toggle */}
                <Box className="mb-4 bg-white rounded-2xl p-1">
                    <ToggleSwitch
                        value={activeView === 'friends' ? 'left' : 'right'}
                        onChange={(val: 'left' | 'right') => setActiveView(val === 'left' ? 'friends' : 'parties')}
                        leftLabel="Friends"
                        rightLabel="Parties"
                    />
                </Box>

                {activeView === 'friends' ? <FriendsView key={refreshKey} /> : <PartiesView />}
            </ScrollView>
        </Box>
    );
};