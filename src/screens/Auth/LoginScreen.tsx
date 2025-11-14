import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, RootStackParamList } from '../navigation/types';
import { PrimaryButton, TextInputField } from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';
import { GoogleSignInButton } from '@/src/components/global/GoogleSignInButton';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

//TODO: Scrollability screen

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [message, setMessage] = useState<string | null>(null);

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) setMessage(error.message);
        else {
            setMessage('Successfully logged in! Redirecting...');
            setTimeout(() => setMessage(null), 2000);
        }
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
        if (error) setMessage(error.message);
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
                    <TextInputField
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Box className="mt-6 mb-8">
                        <TextInputField
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </Box>

                    {message && (
                        <Text
                            className={`text-center mb-4 ${message.toLowerCase().includes('success') ? 'text-green-500' : 'text-red-500'}`}
                        >
                            {message}
                        </Text>
                    )}

                    {/* Login Button */}
                    <PrimaryButton 
                        title="Sign In" 
                        onPress={handleLogin}
                    />

                    {/* Forgot Password */}
                    <Pressable className="mb-8">
                        <Text className="text-center text-primary-500 font-medium">
                            Forgot Password?
                        </Text>
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

                {/* Google Login Button */}
                    <GoogleSignInButton 
                        onPress={handleGoogleLogin}
                    />

                {/* Footer space for keyboard */}
                <Box className="h-6" />
            </Box>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;