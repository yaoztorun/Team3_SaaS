// src/screens/Profile/ProfileStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { ProfileScreen } from './ProfileScreen';          // ✅ named export
import EditProfile from './EditProfile';
import Settings from './Settings';
import { UserProfile } from '../Social/UserProfile';      // ✅ correct path + named import
import { globalScreenOptions } from '@/src/theme/navigationTransitions';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  UserProfile: { userId: string };   // ✅ route for viewing other users
  EditProfile: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={globalScreenOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{ headerShown: false }} // you already render your own TopBar
      />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
