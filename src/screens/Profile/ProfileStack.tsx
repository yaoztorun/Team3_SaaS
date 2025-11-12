import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileScreen } from './ProfileScreen';
import EditProfile from './EditProfile';
import Settings from './Settings';
import { globalScreenOptions } from '@/src/theme/navigationTransitions';

export type ProfileStackParamList = {
    ProfileMain: undefined;
    EditProfile: undefined;
    Settings: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
    return (
        <Stack.Navigator screenOptions={globalScreenOptions}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
    );
};

export default ProfileStack;
