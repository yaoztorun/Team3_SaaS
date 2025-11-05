import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import BottomTabs from './src/screens/navigation/BottomTabs';
import '@/global.css';

export default function App() {
  return (
    <GluestackUIProvider mode="light">
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    </GluestackUIProvider>
  );
}
