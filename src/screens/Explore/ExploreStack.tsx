import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ExploreScreen } from './ExploreScreen';
import { AllCocktails } from './Pages/AllCocktails';
import { AIAssistant } from './Pages/AIAssistant';
import { WhatCanIMake } from './Pages/WhatCanIMake';
import { BestRated } from './Pages/BestRated';
import { UpcomingEvents } from './Pages/UpcomingEvents';
import { Shop } from './Pages/Shop';

const Stack = createNativeStackNavigator();

export const ExploreStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
      <Stack.Screen name="AllCocktails" component={AllCocktails} />
      <Stack.Screen name="AIAssistant" component={AIAssistant} />
      <Stack.Screen name="WhatCanIMake" component={WhatCanIMake} />
      <Stack.Screen name="BestRated" component={BestRated} />
      <Stack.Screen name="UpcomingEvents" component={UpcomingEvents} />
      <Stack.Screen name="Shop" component={Shop} />
    </Stack.Navigator>
  );
};