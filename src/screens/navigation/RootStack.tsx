import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import BottomTabs from './BottomTabs';
import { globalScreenOptions } from '@/src/theme/navigationTransitions';
import { UserProfile } from '../Social/UserProfile';

const Stack = createStackNavigator<RootStackParamList>();

export const RootStack = () => {
    return (
        <Stack.Navigator screenOptions={globalScreenOptions}>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen name="UserProfile" component={UserProfile} />
        </Stack.Navigator>
    );
};

export default RootStack;