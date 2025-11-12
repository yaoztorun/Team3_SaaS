import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { StackNavigationOptions, TransitionPresets } from '@react-navigation/stack';

/**
 * Custom 1-second slide and fade transition for Stack Navigator
 * This provides a clearly visible animation when navigating between screens
 */
export const customSlowTransition: StackNavigationOptions = {
    headerShown: false,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 1000, // 1 second - clearly visible
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 1000, // 1 second - clearly visible
            },
        },
    },
    cardStyleInterpolator: ({ current, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                ],
                opacity: current.progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1],
                }),
            },
            overlayStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                }),
            },
        };
    },
};

/**
 * LEGACY: For NativeStackNavigator (doesn't support custom durations)
 * Using 'simple_push' for maximum visibility
 */
export const slideAndFadeTransition: NativeStackNavigationOptions = {
    animation: 'simple_push',
    presentation: 'card',
    gestureEnabled: true,
    gestureDirection: 'horizontal',
};

/**
 * Apply this to screenOptions in Stack navigators (NOT NativeStack)
 * This gives you full control over animation duration
 */
export const globalScreenOptions: StackNavigationOptions = {
    ...customSlowTransition,
};

/**
 * For NativeStack navigators (fallback - no custom duration support)
 */
export const globalScreenOptionsNative: NativeStackNavigationOptions = {
    headerShown: false,
    ...slideAndFadeTransition,
};
