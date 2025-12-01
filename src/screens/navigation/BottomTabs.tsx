import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, GestureResponderEvent, Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Box } from '@/src/components/ui/box';
import { Center } from '@/src/components/ui/center';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { HomeIcon, SearchIcon, UserIcon, PlusIcon, PartyPopper } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { CommonActions } from '@react-navigation/native';

// Import screens
import { HomeScreen } from '@/src/screens/Home/HomeScreen';
import { AddScreen } from '@/src/screens/Add/AddScreen';
import { ExploreStack } from '@/src/screens/Explore/ExploreStack';
import { ProfileStack } from '@/src/screens/Profile/ProfileStack';
import { SocialStack } from '@/src/screens/Social/SocialStack';

const Tab = createBottomTabNavigator();

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
                    height: 60,
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
                                <PartyPopper
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

// Custom Center Button for the "Add" tab
// includes press animations

const CenterButton = ({
    onPress,
}: {
    onPress?: (event: GestureResponderEvent) => void;
}) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
                    }}
                >
                    <LinearGradient
                        colors={[colors.primary[500], colors.primary[600]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
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
                    </LinearGradient>
                </Animated.View>
            </Pressable>
        </Box>
    );
};