import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import LoginScreen from '../Auth/LoginScreen';
import RegisterScreen from '../Auth/RegisterScreen';
import { globalScreenOptions } from '@/src/theme/navigationTransitions';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={globalScreenOptions}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};