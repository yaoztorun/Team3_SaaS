// src/screens/navigation/TopBar.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Image } from 'react-native';
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
} from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { NotificationModal, Notification } from './NotificationModal';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import {
  fetchNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  deleteNotification,
  formatTimeAgo,
  type NotificationRow,
} from '@/src/api/notifications';

interface TopBarProps {
  streakCount?: number;
  cocktailCount?: number;
  title?: string;
  onNotificationPress?: (payload: {
    id: string;
    type: string;
    drinkLogId?: string | null;
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

  // notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // stats state (streak + total drinks)
  const [computedStreak, setComputedStreak] = useState<number | null>(null);
  const [computedDrinks, setComputedDrinks] = useState<number | null>(null);

  // ---------- helpers ----------

  const toDayString = (date: Date) => date.toISOString().slice(0, 10);

  const computeStreakFromDates = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const daySet = new Set<string>(
      dates.map((iso) => new Date(iso).toISOString().slice(0, 10)),
    );

    const today = new Date();
    let current = new Date(today);
    let streak = 0;

    // Only count if user has logged *today*
    if (!daySet.has(toDayString(today))) {
      return 0;
    }

    while (daySet.has(toDayString(current))) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    }

    return streak;
  };

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
      const streak = computeStreakFromDates(dates);
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

    // bubble up to parent (e.g. HomeScreen) with id/type/drinkLogId
    if (onNotificationPress) {
      onNotificationPress({
        id: notification.id,
        type: notification.type,
        drinkLogId: notification.drinkLogId,
      });
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
        paddingLeft: spacing.screenHorizontal,
        paddingRight: spacing.screenHorizontal,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {showBack && (
            <Pressable onPress={onBackPress} style={{ padding: 6 }}>
              <ArrowLeft size={20} color="#111827" />
            </Pressable>
          )}

          {/* Logo (shown only on main pages) */}
          {showLogo && (
            <Image
              source={require('../../../assets/icon.png')}
              style={{
                width: 40,
                height: 40,
                resizeMode: 'contain',
              }}
            />
          )}

          {/* Title text */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: '700',
              color: '#111827',
              letterSpacing: -0.5,
            }}
          >
            {title === 'Feed' ? 'Home' : title}
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
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#ea580c',
                  }}
                >
                  {displayStreak}
                </Text>
              </View>

              {/* Cocktails logged */}
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
                    color: colors.primary[600],
                  }}
                >
                  {displayDrinks}
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
        onClose={handleCloseNotifications}
        onNotificationPress={handleNotificationItemPress}
        onDeleteNotification={handleDeleteNotification}
      />
    </Box>
  );
};
