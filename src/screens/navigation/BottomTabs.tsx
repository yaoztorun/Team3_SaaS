import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Box } from '@/src/components/ui/box';
import { Center } from '@/src/components/ui/center';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { HomeIcon, SearchIcon, MessageCircle, UserIcon, PlusIcon } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';

// Import screens
import { HomeScreen } from '@/src/screens/Home/HomeScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false, // We're using our custom TopBar
                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.primary[500],
                tabBarInactiveTintColor: colors.neutral[400],
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopWidth: 0,
                    elevation: 10,
                    height: 70,
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
                component={Explore}
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
                component={Add}
                options={{
                    tabBarButton: ({ onPress }) => (
                        <CenterButton onPress={onPress} />
                    ),
                }}
            />
            <Tab.Screen
                name="Social"
                component={Social}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton
                            icon={
                                <MessageCircle
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
                component={Profile}
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

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <Center>{icon}</Center>
);

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
                        colors={[colors.primary[400], colors.primary[600]]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
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

const Explore = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Search Screen</Text>
    </Box>
);

const Add = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Add Screen</Text>
    </Box>
);

const Social = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Favorites Screen</Text>
    </Box>
);

const Profile = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Profile Screen</Text>
    </Box>
);