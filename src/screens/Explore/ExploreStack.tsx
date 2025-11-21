import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { ExploreScreen } from './ExploreScreen';
import { AllCocktails } from './Pages/AllCocktails';
import { AIAssistant } from './Pages/AIAssistant';
import { WhatCanIMake } from './Pages/WhatCanIMake';
import { MatchingCocktails } from './Pages/MatchingCocktails';
import { BestBars } from './Pages/BestBars';
import { UpcomingEvents } from './Pages/UpcomingEvents';
import { Shop } from './Pages/Shop';
import { CocktailDetail } from './Pages/CocktailDetail';
import { BarDetail } from './Pages/BarDetail';
import { ItemDetail } from './Pages/ItemDetail';
import { globalScreenOptions } from '@/src/theme/navigationTransitions';

const Stack = createStackNavigator();

export const ExploreStack = () => {
  return (
    <Stack.Navigator screenOptions={globalScreenOptions}>
      <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
      <Stack.Screen name="AllCocktails" component={AllCocktails} />
      <Stack.Screen name="CocktailDetail" component={CocktailDetail} />
      <Stack.Screen name="AIAssistant" component={AIAssistant} />
      <Stack.Screen name="WhatCanIMake" component={WhatCanIMake} />
      <Stack.Screen name="MatchingCocktails" component={MatchingCocktails} />
      <Stack.Screen name="BestBars" component={BestBars} />
      <Stack.Screen name="BarDetail" component={BarDetail} />
      <Stack.Screen name="UpcomingEvents" component={UpcomingEvents} />
      <Stack.Screen name="Shop" component={Shop} />
      <Stack.Screen name="ItemDetail" component={ItemDetail} />
    </Stack.Navigator>
  );
};