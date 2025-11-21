import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { View, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, RootStackParamList } from '../navigation/types';
import { PrimaryButton, TextInputField } from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';
import { GoogleSignInButton } from '@/src/components/global/GoogleSignInButton';
import { spacing } from '@/src/theme/spacing';
import { ANALYTICS_EVENTS, posthogCapture, identifyUser, trackWithTTFA } from '@/src/analytics';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

//TODO: Scrollability screen

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUpHovered, setIsSignUpHovered] = useState(false);

    const [message, setMessage] = useState<string | null>(null);

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setMessage(error.message);
            posthogCapture(ANALYTICS_EVENTS.LOGIN_COMPLETED, {
                method: 'email',
                success: false,
                error: error.message,
            });
        } else {
            setMessage('Successfully logged in! Redirecting...');
            
            // Identify user and track login
            if (data.user) {
                identifyUser(data.user.id, {
                    email: data.user.email,
                    last_login: new Date().toISOString(),
                });
                
                trackWithTTFA(ANALYTICS_EVENTS.LOGIN_COMPLETED, {
                    method: 'email',
                });
            }
            
            setTimeout(() => setMessage(null), 2000);
        }
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    const handleGoogleLogin = async () => {
        posthogCapture(ANALYTICS_EVENTS.SIGNUP_STARTED, {
            method: 'google',
        });
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
            redirectTo: window.location.origin,
            },
        });
        if (error) {
            setMessage(error.message);
            posthogCapture(ANALYTICS_EVENTS.SIGNUP_STARTED, {
                method: 'google',
                success: false,
                error: error.message,
            });
        }
    };


    return (
        <ScrollView
            className="bg-white h-screen overflow-auto"
            contentContainerStyle={{
                justifyContent: 'flex-start',
                paddingTop: spacing.screenVertical,
                paddingBottom: spacing.screenBottom,
            }}
            keyboardShouldPersistTaps="handled"
        >
            <Box className="p-6">
                {/* Logo and Welcome Text */}
                <Box className="items-center">
                    <Image
                        source={require('../../../assets/icon.png')}
                        style={{
                            width: 120,
                            height: 120,
                            resizeMode: 'contain',
                        }}
                    />
                    <Text className="text-2xl font-bold text-neutral-900 mt-6 mb-2">
                        Welcome Back!
                    </Text>
                    <Text className="text-neutral-500 text-center">
                        Sign in to access your cocktail recipes and personalized recommendations
                    </Text>
                </Box>

                {/* Login Form */}
                <Box className="w-full mt-8">
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
                            onSubmitEditing={handleLogin}
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
                    <Pressable className="mt-6 mb-4" onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text className="text-center text-primary-500 font-medium">
                            Forgot Password?
                        </Text>
                    </Pressable>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center items-center mb-2">
                        <Text className="text-neutral-600">
                            Don't have an account?{' '}
                        </Text>
                        <Pressable 
                            onPress={handleRegister}
                            onHoverIn={() => setIsSignUpHovered(true)}
                            onHoverOut={() => setIsSignUpHovered(false)}
                        >
                            <Text 
                                className="font-bold"
                                style={{
                                    color: '#009689',
                                    textDecorationLine: isSignUpHovered ? 'underline' : 'none',
                                }}
                            >
                                Sign Up
                            </Text>
                        </Pressable>
                    </View>
                </Box>

                {/* Google Login Button */}
                <Box className="mt-0">
                    <GoogleSignInButton 
                        onPress={handleGoogleLogin}
                    />
                </Box>

                {/* Footer space for keyboard */}
                <Box className="h-6" />
            </Box>
        </ScrollView>
    );
};

export default LoginScreen;