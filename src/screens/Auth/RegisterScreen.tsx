import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { PrimaryButton, TextInputField } from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';
import { spacing } from '@/src/theme/spacing';
import { ANALYTICS_EVENTS, posthogCapture, identifyUser, trackWithTTFA } from '@/src/analytics';


type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSignInHovered, setIsSignInHovered] = useState(false);

    const [message, setMessage] = useState<string | null>(null);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        // Track signup started
        posthogCapture(ANALYTICS_EVENTS.SIGNUP_STARTED, {
            method: 'email',
        });

        // TODO: Add name, picture, etc. to user profile registration (supabase: raw_user_metadata?)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if(error) {
            setMessage(error.message);
            // Track failed signup
            posthogCapture(ANALYTICS_EVENTS.SIGNUP_STARTED, {
                method: 'email',
                success: false,
                error: error.message,
            });
            return;
        }

        // Track successful signup
        if (data.user) {
            identifyUser(data.user.id, {
                email: data.user.email,
                name: name || undefined,
                created_at: new Date().toISOString(),
            });
            
            trackWithTTFA(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
                method: 'email',
                has_name: !!name,
            });
        }

        setMessage('Registration successful! Please check your email to verify your account.');
        setTimeout(() => navigation.navigate('Login'), 3000);
    };

    const handleLogin = () => {
        navigation.navigate('Login');
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
                {/* Welcome Text */}
                <Box className="flex-row items-center justify-start mb-4">
                    <Pressable onPress={() => navigation.navigate('Login')} className="mr-3">
                        <ChevronLeft size={24} color={"#000"} />
                    </Pressable>
                </Box>

                <Box className="items-center mt-2">
                    <Text className="text-2xl font-bold text-neutral-900 mb-2">
                        Create Account
                    </Text>
                    <Text className="text-neutral-500 text-center">
                        Create your account to discover cocktails and get personalized recommendations
                    </Text>
                </Box>

                {/* Registration Form */}
                <Box className="w-full mt-8">
                    <TextInputField
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <Box className="mt-6">
                        <TextInputField
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </Box>

                    <Box className="mt-6">
                        <TextInputField
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </Box>

                    <Box className="mt-6 mb-8">
                        <TextInputField
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
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

                    {/* Register Button */}
                    <PrimaryButton 
                        title="Create Account" 
                        onPress={handleRegister}
                    />

                    {/* Sign In Link */}
                    <View className="flex-row justify-center items-center mt-6 mb-3">
                        <Text className="text-neutral-600">
                            Already have an account?{' '}
                        </Text>
                        <Pressable 
                            onPress={handleLogin}
                            onHoverIn={() => setIsSignInHovered(true)}
                            onHoverOut={() => setIsSignInHovered(false)}
                        >
                            <Text 
                                className="font-bold"
                                style={{
                                    color: '#009689',
                                    textDecorationLine: isSignInHovered ? 'underline' : 'none',
                                }}
                            >
                                Sign In
                            </Text>
                        </Pressable>
                    </View>
                </Box>

                {/* Terms and Privacy */}
                <Text className="text-center text-neutral-500 text-sm mb-6 mt-2">
                    By signing up, you agree to our{' '}
                    <Text className="text-primary-500">Terms of Service</Text>
                    {' '}and{' '}
                    <Text className="text-primary-500">Privacy Policy</Text>
                </Text>
            </Box>
        </ScrollView>
    );
};

export default RegisterScreen;