import React from 'react';
import { Pressable, View, Text, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  onPress: () => void;
  theme?: 'light' | 'dark' | 'neutral';
}

// Google branding guidelines:
// https://developers.google.com/identity/branding-guidelines
export const GoogleSignInButton: React.FC<Props> = ({ onPress, theme = 'light' }) => {
  const themeStyles = {
    light: {
      backgroundColor: '#FFFFFF',
      borderColor: '#747775',
      textColor: '#1F1F1F',
    },
    dark: {
      backgroundColor: '#131314',
      borderColor: '#8E918F',
      textColor: '#E3E3E3',
    },
    neutral: {
      backgroundColor: '#F2F2F2',
      borderColor: 'transparent',
      textColor: '#1F1F1F',
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        // Google guidelines: min height 40-44px for accessibility
        height: 40,
        // Google guidelines: rounded corners (pill or rectangular)
        borderRadius: 4,
        borderWidth: theme === 'neutral' ? 0 : 1,
        borderColor: currentTheme.borderColor,
        backgroundColor: currentTheme.backgroundColor,
        // Google guidelines: 12px left padding, 10px after logo, 12px right padding
        paddingLeft: 12,
        paddingRight: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 190,
        alignSelf: 'center',
        marginTop: 8,
        // Add pressed state
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* Google Icon - must be standard color on all themes */}
      <View style={{ width: 18, height: 18, marginRight: 10 }}>
        <Svg viewBox="0 0 48 48" width="18" height="18">
          <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          <Path fill="none" d="M0 0h48v48H0z" />
        </Svg>
      </View>

      {/* Text - Google guidelines: Roboto Medium 14px */}
      <Text
        style={{
          // Google guidelines: must use Roboto Medium
          fontFamily: Platform.select({
            web: 'Roboto, Arial, sans-serif',
            default: 'System',
          }),
          fontWeight: '500',
          fontSize: 14,
          lineHeight: 20,
          color: currentTheme.textColor,
        }}
      >
        Continue with Google
      </Text>
    </Pressable>
  );
};
