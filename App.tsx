import React from 'react';
import { View } from 'react-native';
import Home from './src/screens/Home';

// Import Gluestack provider & components
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Button, ButtonText } from '@/components/ui/button';
import '@/global.css';

export default function App() {
  return (
    <GluestackUIProvider mode="dark">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Button action="primary">
          <ButtonText>Hello Gluestack Web </ButtonText>
        </Button>

        <Button action="secondary">
          <ButtonText>Mix a Cocktail </ButtonText>
        </Button>
      </View>
    </GluestackUIProvider>
  );
}

