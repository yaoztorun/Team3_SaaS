import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Pressable } from '@/src/components/ui/pressable';
import { FriendsView } from './FriendsView';
import { PartiesView } from './PartiesView';

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
            <TopBar title="Social" />

            {/* View Toggle */}
            <Box className="bg-[#F3F4F6] p-4">
                <View className="bg-[#E5E7EB] flex-row rounded-xl p-1">
                    <Pressable
                        onPress={() => setActiveView('friends')}
                        className={activeView === 'friends' ? 'flex-1 rounded-xl py-2 bg-[#00BBA7]' : 'flex-1 rounded-xl py-2'}
                    >
                        <Text className={activeView === 'friends' ? 'text-center text-white' : 'text-center text-neutral-950'}>
                            Friends
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveView('parties')}
                        className={activeView === 'parties' ? 'flex-1 rounded-xl py-2 bg-[#00BBA7]' : 'flex-1 rounded-xl py-2'}
                    >
                        <Text className={activeView === 'parties' ? 'text-center text-white' : 'text-center text-neutral-950'}>
                            Parties
                        </Text>
                    </Pressable>
                </View>
            </Box>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {activeView === 'friends' ? <FriendsView key={refreshKey} /> : <PartiesView />}
            </ScrollView>
        </Box>
    );
};