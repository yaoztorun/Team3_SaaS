// src/navigation/TopBar.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { Flame, GlassWater, Bell, Settings as SettingsIcon, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { NotificationModal, Notification } from './NotificationModal';

// Sample notifications data
const initialNotifications: Notification[] = [
    { id: '1', message: 'Sarah liked your cocktail post', timeAgo: '5m ago', isRead: false },
    { id: '2', message: 'Mike commented on your Mai Tai', timeAgo: '1h ago', isRead: false },
    { id: '3', message: 'You have a new friend request', timeAgo: '2h ago', isRead: false },
    { id: '4', message: 'Cocktail Night event tonight at 8 PM', timeAgo: '3h ago', isRead: true },
    { id: '5', message: 'Alex started following you', timeAgo: '1d ago', isRead: true },
];

interface TopBarProps {
    streakCount?: number;
    cocktailCount?: number;
    title?: string;
    onNotificationPress?: () => void;
    showSettingsIcon?: boolean;
    onSettingsPress?: () => void;
    showBack?: boolean;
    onBackPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    streakCount = 7,
    cocktailCount = 42,
    title = "Home",
    onNotificationPress
    , showSettingsIcon = false,
    onSettingsPress
    , showBack = false,
    onBackPress
}) => {
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationPress = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const handleBellPress = () => {
        setShowNotifications(true);
        if (onNotificationPress) {
            onNotificationPress();
        }
    };

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
                {/* Title on Left (optionally with back) */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {showBack && (
                        <Pressable onPress={onBackPress} style={{ padding: 6 }}>
                            <ArrowLeft size={20} color="#111827" />
                        </Pressable>
                    )}

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
                </View>

                {/* Right side: either settings icon (for profile) or stats + bell */}
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                    {showSettingsIcon ? (
                        <Pressable onPress={onSettingsPress}>
                            <SettingsIcon size={22} color="#6b7280" />
                        </Pressable>
                    ) : (
                        <>
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
                            <Pressable onPress={handleBellPress} className="relative">
                                <Bell size={22} color="#6b7280" strokeWidth={2} />
                                {unreadCount > 0 && (
                                    <View className="absolute -top-1 -right-1 bg-[#00BBA7] rounded-full w-2 h-2" />
                                )}
                            </Pressable>
                        </>
                    )}
                </View>
            </View>

            {/* Notification Modal */}
            <NotificationModal
                visible={showNotifications}
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onNotificationPress={handleNotificationPress}
            />
        </Box>
    );
};