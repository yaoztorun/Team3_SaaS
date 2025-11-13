import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import BottomTabs from './BottomTabs';
import { globalScreenOptions } from '@/src/theme/navigationTransitions';

const Stack = createStackNavigator<RootStackParamList>();

export const RootStack = () => {
    return (
        <Stack.Navigator screenOptions={globalScreenOptions}>
            <Stack.Screen name="Main" component={BottomTabs} />
        </Stack.Navigator>
    );
};

export default RootStack;