import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Box } from '@/src/components/ui/box';
import { Center } from '@/src/components/ui/center';
import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import { HomeIcon, SearchIcon, HeartIcon, UserIcon, PlusIcon } from 'lucide-react-native';
import { colors } from '@/src/theme/colors'; // For React Native parts

const Tab = createBottomTabNavigator();

// const Home = () => null;
// const Search = () => null;
// const Add = () => null;
// const Favorites = () => null;
// const Profile = () => null;

export default function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    // Can't use className here - needs actual color value
                    backgroundColor: colors.white,
                    borderTopWidth: 0,
                    elevation: 10,
                    height: 70,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton
                            icon={
                                // Can't use className here - needs actual color value
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
                name="Search"
                component={Search}
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
                    tabBarButton: (props: any) => <CenterButton {...props} />,
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={Favorites}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <IconButton
                            icon={
                                <HeartIcon
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

const CenterButton = (props: any) => {
    return (
        <Pressable
            {...props}
            style={{
                top: -25,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* CAN use className here - it's a gluestack Box! */}
            <Box className="w-[70px] h-[70px] rounded-full justify-center items-center shadow-lg bg-primary-500">
                <PlusIcon color={colors.white} size={32} />
            </Box>
        </Pressable>
    );
};

// Temporary test screens
const Home = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Home Screen</Text>
    </Box>
);

const Search = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Search Screen</Text>
    </Box>
);

const Add = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Add Screen</Text>
    </Box>
);

const Favorites = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Favorites Screen</Text>
    </Box>
);

const Profile = () => (
    <Box className="flex-1 bg-neutral-900 justify-center items-center">
        <Text className="text-white text-2xl">Profile Screen</Text>
    </Box>
);
