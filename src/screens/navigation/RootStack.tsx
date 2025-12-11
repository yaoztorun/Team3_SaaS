import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import BottomTabs from './BottomTabs';
import { globalScreenOptions } from '@/src/theme/navigationTransitions';
import { UserProfile } from '../Social/UserProfile';
import { TermsOfService } from '../Legal/TermsOfService';
import { PrivacyPolicy } from '../Legal/PrivacyPolicy';

const Stack = createStackNavigator<RootStackParamList>();

export const RootStack = () => {
    return (
        <Stack.Navigator screenOptions={globalScreenOptions}>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen 
                name="UserProfile" 
                component={UserProfile}
                options={{
                    cardStyle: { flex: 1 },
                }}
            />
            <Stack.Screen 
                name="TermsOfService" 
                component={TermsOfService}
                options={{
                    cardStyle: { flex: 1 },
                }}
            />
            <Stack.Screen 
                name="PrivacyPolicy" 
                component={PrivacyPolicy}
                options={{
                    cardStyle: { flex: 1 },
                }}
            />
        </Stack.Navigator>
    );
};

export default RootStack;