import React, { useEffect, useRef } from 'react';
import { Pressable, Animated } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';

type ToggleValue = 'left' | 'right';

interface ToggleSwitchProps {
    value: ToggleValue;
    onChange: (value: ToggleValue) => void;
    leftLabel: string;
    rightLabel: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
    value, 
    onChange, 
    leftLabel, 
    rightLabel 
}) => {
    const scaleLeft = useRef(new Animated.Value(value === 'left' ? 1 : 0.95)).current;
    const scaleRight = useRef(new Animated.Value(value === 'right' ? 1 : 0.95)).current;
    const opacityLeft = useRef(new Animated.Value(value === 'left' ? 1 : 0)).current;
    const opacityRight = useRef(new Animated.Value(value === 'right' ? 1 : 0)).current;
    const textOpacityLeft = useRef(new Animated.Value(value === 'left' ? 1 : 0)).current;
    const textOpacityRight = useRef(new Animated.Value(value === 'right' ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleLeft, {
                toValue: value === 'left' ? 1 : 0.95,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }),
            Animated.spring(scaleRight, {
                toValue: value === 'right' ? 1 : 0.95,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }),
            Animated.timing(opacityLeft, {
                toValue: value === 'left' ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityRight, {
                toValue: value === 'right' ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(textOpacityLeft, {
                toValue: value === 'left' ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(textOpacityRight, {
                toValue: value === 'right' ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [value]);

    return (
        <Box 
            className="rounded-xl overflow-hidden"
            style={{ flexDirection: 'row', borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#ffffff', padding: 2 }}
        >
            <Pressable 
                className="flex-1 py-2 px-3 justify-center rounded-lg"
                onPress={() => onChange('left')}
                style={{ position: 'relative' }}
            >
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#14b8a6',
                        borderRadius: 8,
                        opacity: opacityLeft,
                        transform: [{ scale: scaleLeft }],
                    }}
                />
                <Animated.View style={{ zIndex: 1, opacity: textOpacityLeft }}>
                    <Text className="text-center text-sm font-medium text-white" numberOfLines={1} adjustsFontSizeToFit>
                        {leftLabel}
                    </Text>
                </Animated.View>
                <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', opacity: textOpacityLeft.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>
                    <Text className="text-center text-sm font-medium text-neutral-900" numberOfLines={1} adjustsFontSizeToFit>
                        {leftLabel}
                    </Text>
                </Animated.View>
            </Pressable>
            <Pressable 
                className="flex-1 py-2 px-3 justify-center rounded-lg"
                onPress={() => onChange('right')}
                style={{ position: 'relative' }}
            >
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#14b8a6',
                        borderRadius: 8,
                        opacity: opacityRight,
                        transform: [{ scale: scaleRight }],
                    }}
                />
                <Animated.View style={{ zIndex: 1, opacity: textOpacityRight }}>
                    <Text className="text-center text-sm font-medium text-white" numberOfLines={1} adjustsFontSizeToFit>
                        {rightLabel}
                    </Text>
                </Animated.View>
                <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', opacity: textOpacityRight.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>
                    <Text className="text-center text-sm font-medium text-neutral-900" numberOfLines={1} adjustsFontSizeToFit>
                        {rightLabel}
                    </Text>
                </Animated.View>
            </Pressable>
        </Box>
    );
};
