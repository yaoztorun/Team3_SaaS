import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SocialScreen } from './SocialScreen';
import { CreateParty } from './CreateParty';

export type SocialStackParamList = {
    SocialMain: { initialView?: 'friends' | 'parties' } | undefined;
    CreateParty: undefined;
    PartyDetails: { party: {
        id: number;
        title: string;
        host: string;
        time: string;
        attendees: number;
        status: string;
        emoji?: string;
        about?: string;
    } } | undefined;
};

const Stack = createNativeStackNavigator<SocialStackParamList>();

export const SocialStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="SocialMain" component={SocialScreen} />
            <Stack.Screen name="CreateParty" component={CreateParty} />
            <Stack.Screen name="PartyDetails" component={require('./PartyDetails').default} />
        </Stack.Navigator>
    );
};