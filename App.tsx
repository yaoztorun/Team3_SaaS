import React from 'react';
import { View, Text } from 'react-native';
import Home from './src/screens/Home';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function App() {
  return (
    
    <GluestackUIProvider mode="dark">
      <View style={{ flex: 1 }}>
      <Home />
    </View>
    </GluestackUIProvider>
  
  );
}
