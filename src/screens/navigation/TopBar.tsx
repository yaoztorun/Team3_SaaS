// src/navigation/TopBar.tsx
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Flame, GlassWater, Bell } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

interface TopBarProps {
    streakCount?: number;
    cocktailCount?: number;
    title?: string;
    onNotificationPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    streakCount = 7,
    cocktailCount = 42,
    title = "Home",
    onNotificationPress
}) => {
    const insets = useSafeAreaInsets();

    return (
        <Box
            className="bg-white"
            style={{
                paddingTop: insets.top + spacing.screenVertical,
                paddingBottom: spacing.screenVertical,
                paddingLeft: spacing.screenHorizontal,
                paddingRight: spacing.screenHorizontal,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Title on Left */}
                <Text
                    style={{
                        fontSize: 26,
                        fontWeight: '700',
                        color: '#111827',
                        letterSpacing: -0.5,
                    }}
                >
                    {title}
                </Text>

                {/* Stats and Notification on Right */}
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                    {/* Streak */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <Flame size={18} color="#f97316" fill="#f97316" />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#ea580c' }}>
                            {streakCount}
                        </Text>
                    </View>

                    {/* Cocktails */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <GlassWater size={18} color={colors.primary[500]} />
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: colors.primary[600]
                            }}
                        >
                            {cocktailCount}
                        </Text>
                    </View>

                    {/* Notification Bell */}
                    <Pressable onPress={onNotificationPress}>
                        <Bell size={22} color="#6b7280" strokeWidth={2} />
                    </Pressable>
                </View>
            </View>
        </Box>
    );
};