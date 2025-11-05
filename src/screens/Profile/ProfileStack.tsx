import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from './ProfileScreen';
import EditProfile from './EditProfile';
import Settings from './Settings';

export type ProfileStackParamList = {
    ProfileMain: undefined;
    EditProfile: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
    );
};

export default ProfileStack;
