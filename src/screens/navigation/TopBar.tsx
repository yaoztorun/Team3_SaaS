// src/screens/navigation/TopBar.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import {
  Flame,
  GlassWater,
  Bell,
  Settings as SettingsIcon,
  ArrowLeft,
  X,
} from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { NotificationModal, Notification } from './NotificationModal';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import { Heading } from '@/src/components/global';
import {
  fetchNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  deleteNotification,
  formatTimeAgo,
  type NotificationRow,
} from '@/src/api/notifications';
import { calculateStreakFromDates } from '@/src/utils/streak';

interface TopBarProps {
  streakCount?: number;
  cocktailCount?: number;
  title?: string;
  onNotificationPress?: (payload: {
    id: string;
    type: string;
    drinkLogId?: string | null;
    eventId?: string | null;
  }) => void;
  showSettingsIcon?: boolean;
  onSettingsPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  showLogo?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  streakCount,
  cocktailCount,
  title = 'Home',
  onNotificationPress,
  showSettingsIcon = false,
  onSettingsPress,
  showBack = false,
  showLogo = false,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  // notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // stats state (streak + total drinks)
  const [computedStreak, setComputedStreak] = useState<number | null>(null);
  const [computedDrinks, setComputedDrinks] = useState<number | null>(null);

  // ---------- load stats from DrinkLog ----------

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setComputedStreak(0);
        setComputedDrinks(0);
        return;
      }

      const { data, error, count } = await supabase
        .from('DrinkLog')
        .select('created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(365);

      if (error) {
        console.error('Error loading drink stats:', error);
        setComputedStreak(0);
        setComputedDrinks(0);
        return;
      }

      const dates = (data ?? []).map((row: any) => row.created_at as string);
      const streak = calculateStreakFromDates(dates);
      setComputedStreak(streak);
      setComputedDrinks(count ?? 0);
    };

    loadStats();
  }, [user]);

  // ---------- load unread notification count ----------

  useEffect(() => {
    const loadUnread = async () => {
      if (!user?.id) {
        setUnreadCount(0);
        return;
      }
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    };
    loadUnread();
  }, [user]);

  // ---------- notification handlers ----------

  const handleCloseNotifications = useCallback(async () => {
    setShowNotifications(false);

    if (unreadCount > 0) {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  }, [unreadCount]);

  const handleNotificationItemPress = (notification: Notification) => {
    console.log('TopBar: notification clicked', notification);

    // mark as read in local state
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, isRead: true } : n,
      ),
    );

    if (!notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Handle party invites directly, don't delegate to parent
    if (notification.type === 'party_invite' && notification.eventId) {
      // Navigate to PartyDetails when party invite is clicked
      console.log('Navigating to party details with eventId:', notification.eventId);
      try {
        // Try nested navigation first
        navigation.navigate('Main' as never, {
          screen: 'Social',
          params: {
            screen: 'PartyDetails',
            params: { partyId: notification.eventId },
          },
        } as never);
      } catch (e) {
        console.error('Failed to navigate to party details:', e);
        // Fallback: try direct navigation
        try {
          navigation.navigate('Social' as never, {
            screen: 'PartyDetails',
            params: { partyId: notification.eventId },
          } as never);
        } catch (e2) {
          console.error('Fallback navigation also failed:', e2);
        }
      }
    }
    // bubble up to parent for other notification types (e.g. HomeScreen) with id/type/drinkLogId/eventId
    else if (onNotificationPress) {
      onNotificationPress({
        id: notification.id,
        type: notification.type,
        drinkLogId: notification.drinkLogId,
        eventId: notification.eventId,
      });
    } else if (notification.drinkLogId) {
      // Fallback: open Home tab and deep-link to the post
      try {
        navigation.navigate('Home' as never, { openDrinkLogId: notification.drinkLogId } as never);
      } catch (e) {
        // As a fallback, go via Main -> Home
        navigation.navigate('Main' as never, {
          screen: 'Home',
          params: { openDrinkLogId: notification.drinkLogId },
        } as never);
      }
    }

    // close modal + mark all read in DB (doesn't block UI)
    handleCloseNotifications();
  };

  const handleDeleteNotification = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    // optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    const res = await deleteNotification(id);
    if (!res.success) {
      console.warn(res.error);
      // revert on failure
      setNotifications((prev) =>
        [...prev, target].sort((a, b) =>
          a.timeAgo.localeCompare(b.timeAgo),
        ),
      );
      if (!target.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  };

  const handleBellPress = useCallback(async () => {
    if (!user?.id) {
      setShowNotifications(true);
      return;
    }

    const rows: NotificationRow[] = await fetchNotifications();

    const mapped: Notification[] = rows.map((row) => ({
      id: row.id,
      message: row.message ?? 'New activity',
      timeAgo: formatTimeAgo(row.created_at),
      isRead: row.is_read,
      eventId: row.event_id,
      type: row.type,
      drinkLogId: row.drink_log_id,
    }));

    setNotifications(mapped);
    setShowNotifications(true);

    const unread = rows.filter((r) => !r.is_read).length;
    setUnreadCount(unread);
  }, [user]);

  // ---------- final values for display ----------

  const displayStreak = streakCount ?? computedStreak ?? 0;
  const displayDrinks = cocktailCount ?? computedDrinks ?? 0;

  return (
    <Box
      className="bg-white"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: 16,
        paddingLeft: 12,
        paddingRight: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Title on Left (optionally with back) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {showBack && (
            <Pressable onPress={onBackPress}>
              <ArrowLeft size={20} color="#111827" />
            </Pressable>
          )}

          {/* Logo (shown only on main pages) */}
          {showLogo ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => navigation.navigate('Home')}>
                <Image
                  source={require('../../../assets/icon.png')}
                  style={{
                    width: 40,
                    height: 40,
                    resizeMode: 'contain',
                  }}
                />
              </Pressable>
              <Heading
                level="h2"
                style={{
                  letterSpacing: -0.5,
                }}
              >
                {title}
              </Heading>
            </View>
          ) : (
            <Heading
              level="h2"
              numberOfLines={1}
              style={{
                letterSpacing: -0.5,
                flexShrink: 1,
              }}
            >
              {title}
            </Heading>
          )}
        </View>

        {/* Right side: either settings icon (for profile) or stats + bell */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {showSettingsIcon ? (
            <Pressable onPress={onSettingsPress} style={{ marginRight: 4 }}>
              <SettingsIcon size={24} color="#6b7280" />
            </Pressable>
          ) : (
            <>
              {/* Streak */}
              <Pressable
                onPress={() => setShowStreakModal(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Flame size={20} color="#f97316" fill="#f97316" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#ea580c',
                  }}
                >
                  {displayStreak}
                </Text>
              </Pressable>

              {/* Cocktails logged */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <GlassWater size={20} color={colors.primary[500]} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.primary[600],
                  }}
                >
                  {displayDrinks}
                </Text>
              </View>

              {/* Notification Bell */}
              <Pressable onPress={handleBellPress} className="relative">
                <Bell size={24} color="#6b7280" strokeWidth={2} />
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
        onClose={handleCloseNotifications}
        onNotificationPress={handleNotificationItemPress}
        onDeleteNotification={handleDeleteNotification}
      />

      {/* Streak Info Modal */}
      <Modal
        visible={showStreakModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStreakModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center p-4"
          onPress={() => setShowStreakModal(false)}
        >
          <Pressable
            className="bg-white rounded-3xl p-6 w-full max-w-sm"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <Pressable
              onPress={() => setShowStreakModal(false)}
              className="absolute top-4 right-4 z-10"
            >
              <X size={24} color="#6b7280" />
            </Pressable>

            {/* Icon */}
            <Box className="items-center mb-4">
              <Box className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center">
                <Flame size={48} color="#f97316" fill="#f97316" />
              </Box>
            </Box>

            {/* Title */}
            <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
              Weekly Streak
            </Text>

            {/* Current Streak */}
            <Text className="text-4xl font-bold text-orange-600 text-center mb-4">
              {displayStreak} {displayStreak === 1 ? 'Day' : 'Days'}
            </Text>

            {/* Description */}
            <Text className="text-base text-neutral-600 text-center mb-4 leading-relaxed">
              Your streak shows how many consecutive days you've posted cocktails in the past week.
            </Text>

            {/* How to maintain */}
            <Box className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
              <Text className="text-sm font-semibold text-neutral-900 mb-2">
                How to maintain your streak:
              </Text>
              <Text className="text-sm text-neutral-700 leading-relaxed">
                • Post at least one cocktail each day{'\n'}
                • Your streak counts the last 7 days{'\n'}
                • Keep going to build longer streaks!
              </Text>
            </Box>
          </Pressable>
        </Pressable>
      </Modal>
    </Box>
  );
};
