import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SocialScreen } from './SocialScreen';
import { CreateParty } from './CreateParty';
import { EditParty } from './EditParty';
import { UserProfile } from './UserProfile';
import { globalScreenOptions } from '@/src/theme/navigationTransitions';
import type { EventWithDetails } from '@/src/api/event';

export type SocialStackParamList = {
    SocialMain: { initialView?: 'friends' | 'parties' } | undefined;
    CreateParty: undefined;
    EditParty: { party: EventWithDetails };
    UserProfile: { userId: string };
    PartyDetails: { party: EventWithDetails } | undefined;
};

const Stack = createStackNavigator<SocialStackParamList>();

export const SocialStack = () => {
    return (
        <Stack.Navigator screenOptions={globalScreenOptions}>
            <Stack.Screen name="SocialMain" component={SocialScreen} />
            <Stack.Screen name="CreateParty" component={CreateParty} />
            <Stack.Screen name="EditParty" component={EditParty} />
            <Stack.Screen name="UserProfile" component={UserProfile} />
            <Stack.Screen name="PartyDetails" component={require('./PartyDetails').default} />
        </Stack.Navigator>
    );
};