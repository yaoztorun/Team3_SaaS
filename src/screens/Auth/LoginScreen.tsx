import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';
import { AuthStackParamList, RootStackParamList } from '../navigation/types';
import { supabase } from '@/src/lib/supabase';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;


const LoginScreen: React.FC = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) console.log(error.message);
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    const handleGoogleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
            redirectTo: window.location.origin,
            },
        });
        if (error) console.log(error.message);
    };


    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <Box className="flex-1 p-6 justify-between">
                {/* Logo and Welcome Text */}
                <Box className="items-center mt-12">
                    {/* logo.png not present in repo; using a simple placeholder */}
                    <Box
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: '#f3f4f6',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text className="text-3xl font-bold text-primary-500">P</Text>
                    </Box>
                    <Text className="text-2xl font-bold text-neutral-900 mt-6 mb-2">
                        Welcome Back!
                    </Text>
                    <Text className="text-neutral-500 text-center">
                        Sign in to access your cocktail recipes and personalized recommendations
                    </Text>
                </Box>

                {/* Login Form */}
                <Box className="w-full">
                    <Box className="mb-6">
                        <Text className="text-sm font-medium text-neutral-700 mb-2">
                            Email
                        </Text>
                        <TextInput
                            className="w-full h-12 px-4 rounded-xl bg-neutral-50 text-neutral-900"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </Box>

                    <Box className="mb-8">
                        <Text className="text-sm font-medium text-neutral-700 mb-2">
                            Password
                        </Text>
                        <TextInput
                            className="w-full h-12 px-4 rounded-xl bg-neutral-50 text-neutral-900"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </Box>

                    {/* Login Button */}
                    <Pressable onPress={handleLogin} className="rounded-xl shadow overflow-hidden mb-4">
                        <LinearGradient
                            colors={[colors.primary[400], colors.primary[600]]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                        >
                            <Text className="text-white text-base font-semibold">
                                Sign In
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Forgot Password */}
                    <Pressable className="mb-8">
                        <Text className="text-center text-primary-500 font-medium">
                            Forgot Password?
                        </Text>
                    </Pressable>
                    
                    {/* Google Login Button */}
                    <Pressable onPress={handleGoogleLogin} className="rounded-xl shadow overflow-hidden mb-4">
                        <LinearGradient
                            colors={[colors.primary[400], colors.primary[600]]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                        >
                            <Text className="text-white text-base font-semibold">
                                Sign In with Google
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center items-center">
                        <Text className="text-neutral-600">
                            Don't have an account?{' '}
                        </Text>
                        <Pressable onPress={handleRegister}>
                            <Text className="text-primary-500 font-medium">
                                Sign Up
                            </Text>
                        </Pressable>
                    </View>
                </Box>

                {/* Footer space for keyboard */}
                <Box className="h-6" />
            </Box>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;