import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, GestureResponderEvent, Text as RNText, Platform } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Center } from '@/src/components/ui/center';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { HomeIcon, SearchIcon, UserIcon, PlusIcon } from 'lucide-react-native';
import { Svg, G, Path } from 'react-native-svg';
import { colors } from '@/src/theme/colors';
import { CommonActions } from '@react-navigation/native';

// Import screens
import { HomeScreen } from '@/src/screens/Home/HomeScreen';
import { AddScreen } from '@/src/screens/Add/AddScreen';
import { ExploreStack } from '@/src/screens/Explore/ExploreStack';
import { ProfileStack } from '@/src/screens/Profile/ProfileStack';
import { SocialStack } from '@/src/screens/Social/SocialStack';

const Tab = createBottomTabNavigator();

// Detect iOS for PWA (checks user agent since Platform.OS may report 'web')
const isIOS = () => {
    if (Platform.OS === 'ios') return true;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
    return false;
};

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false, // We're using our custom TopBar
                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.primary[500],
                tabBarInactiveTintColor: colors.neutral[400],
                tabBarLabelStyle: {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 12,
                    fontWeight: '500',
                },
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                    elevation: 10,
                    height: isIOS() ? 75 : 60,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <IconButton
                            icon={
                                <HomeIcon
                                    size={24}
                                    color={focused ? colors.primary[500] : colors.neutral[400]}
                                />
                            }
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Explore"
                component={ExploreStack}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // Reset to the initial screen when tab is pressed
                        e.preventDefault();
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Explore' }],
                            })
                        );
                    },
                })}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton
                            icon={
                                <SearchIcon
                                    size={24}
                                    color={focused ? colors.primary[500] : colors.neutral[400]}
                                />
                            }
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Add"
                component={AddScreen}
                options={{
                    tabBarButton: ({ onPress }) => (
                        <CenterButton onPress={onPress} />
                    ),
                }}
            />
            <Tab.Screen
                name="Social"
                component={SocialStack}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // Reset to the initial screen when tab is pressed
                        e.preventDefault();
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Social' }],
                            })
                        );
                    },
                })}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton
                            icon={
                                <CheersIcon
                                    size={24}
                                    color={focused ? colors.primary[500] : colors.neutral[400]}
                                />
                            }
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // Reset to the initial screen when tab is pressed
                        e.preventDefault();
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Profile' }],
                            })
                        );
                    },
                })}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton
                            icon={
                                <UserIcon
                                    size={24}
                                    color={focused ? colors.primary[500] : colors.neutral[400]}
                                />
                            }
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// Simple Icon Button Wrapper
// this ensures consistent styling for tab icons (centered)
// not strictly necessary but keeps code clean, might be useful later for additional styling

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <Center>{icon}</Center>
);

// Custom Cheers Icon
const CheersIcon = ({ size = 24, color = '#000' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 14 14">
        <G fill="none" stroke={color} strokeWidth="1">
            <Path d="M3.509 9.328c.241.073.389.113.389.113s.148.04.394.097c1.65.383 3.22-.653 3.632-2.297c.344-1.378.592-2.782.825-4.199a1 1 0 0 0-.727-1.125L4.085.862a1 1 0 0 0-1.192.611c-.507 1.344-.993 2.683-1.382 4.05c-.465 1.63.376 3.311 1.998 3.805Z" />
            <Path strokeLinecap="round" d="M5.475 13.462L.52 12.135m2.478.664l.9-3.358" />
            <Path d="M1.64 6.068H8" />
            <Path strokeLinecap="round" d="M9.933.862a.997.997 0 0 1 1.192.611c.507 1.343.993 2.683 1.382 4.05c.465 1.63-.376 3.311-1.998 3.805c-.24.073-.389.113-.389.113s-.148.04-.393.097a3 3 0 0 1-.958.067m-.226 3.857l4.954-1.327m-2.477.664l-.9-3.358m2.259-4.025h-1.844" />
        </G>
    </Svg>
);

// Custom Center Button for the "Add" tab
// includes press animations

const CenterButton = ({
    onPress,
}: {
    onPress?: (event: GestureResponderEvent) => void;
}) => {
    const scaleAnim = React.useMemo(() => new Animated.Value(1), []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.85,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 8,
        }).start();
    };

    return (
        <Box style={{ top: -25 }}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                        backgroundColor: colors.primary[500],
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: colors.primary[500],
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    <PlusIcon color={colors.white} size={32} strokeWidth={2.5} />
                </Animated.View>
            </Pressable>
        </Box>
    );
};