import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { View, KeyboardAvoidingView, Platform, ScrollView, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { PrimaryButton, TextInputField, Heading, PasswordInput } from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';
import { spacing } from '@/src/theme/spacing';
import { ANALYTICS_EVENTS, posthogCapture, identifyUser, trackWithTTFA } from '@/src/analytics';
import { getStoredReferralInfo, clearReferralInfo } from '@/src/utils/referral';


type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSignInHovered, setIsSignInHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [message, setMessage] = useState<string | null>(null);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setIsLoading(true);
        // Track signup started
        posthogCapture(ANALYTICS_EVENTS.SIGNUP_STARTED, {
            method: 'email',
        });

        // TODO: Add name, picture, etc. to user profile registration (supabase: raw_user_metadata?)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
                emailRedirectTo: `${window.location.origin}`,
            }
        });

        setIsLoading(false);

        if(error) {
            // Better error handling for password requirements
            let errorMessage = error.message;
            if (error.message.toLowerCase().includes('password')) {
                errorMessage = 'Password does not meet requirements';
            }
            setMessage(errorMessage);
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
            // Get referral info if user came from a shared link
            const referralInfo = getStoredReferralInfo();
            
            identifyUser(data.user.id, {
                email: data.user.email,
                name: name || undefined,
                created_at: new Date().toISOString(),
                referred_by: referralInfo?.referredBy,
                utm_source: referralInfo?.utmSource,
                utm_medium: referralInfo?.utmMedium,
            });
            
            trackWithTTFA(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
                method: 'email',
                has_name: !!name,
                referred_by: referralInfo?.referredBy,
                utm_source: referralInfo?.utmSource,
            });
            
            // If user came from a share link, track conversion
            if (referralInfo?.utmSource === 'share') {
                posthogCapture(ANALYTICS_EVENTS.SHARE_CONVERTED, {
                    referred_by: referralInfo.referredBy,
                    utm_medium: referralInfo.utmMedium,
                });
            }
            
            // Clear referral info after use
            clearReferralInfo();
        }

        // Show success modal instead of message and automatic redirect
        setShowSuccessModal(true);
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
                    <Heading level="h2" className="mb-2">
                        Create Account
                    </Heading>
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
                        onSubmitEditing={handleRegister}
                    />

                    <Box className="mt-6">
                        <TextInputField
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            onSubmitEditing={handleRegister}
                        />
                    </Box>

                    <Box className="mt-6">
                        <PasswordInput
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            onSubmitEditing={handleRegister}
                        />
                        <Box className="mt-2">
                            <Text className="text-xs text-neutral-500">
                                Requirements:
                            </Text>
                            <Text className="text-xs text-neutral-500">• At least 8 characters</Text>
                            <Text className="text-xs text-neutral-500">• Lowercase letters (a-z)</Text>
                            <Text className="text-xs text-neutral-500">• Numbers (0-9)</Text>
                        </Box>
                    </Box>

                    <Box className="mt-6 mb-8">
                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            onSubmitEditing={handleRegister}
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
                        loading={isLoading}
                        disabled={isLoading}
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

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowSuccessModal(false);
                    navigation.navigate('Login');
                }}
            >
                <Pressable
                    className="flex-1 bg-black/50 items-center justify-center p-4"
                    onPress={() => {
                        setShowSuccessModal(false);
                        navigation.navigate('Login');
                    }}
                >
                    <Pressable
                        className="bg-white rounded-3xl p-6 w-full max-w-sm"
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <Box className="items-center mb-4">
                            <Box className="w-16 h-16 rounded-full bg-teal-100 items-center justify-center">
                                <Mail size={32} color="#009689" />
                            </Box>
                        </Box>

                        {/* Title */}
                        <Text className="text-2xl font-bold text-neutral-900 text-center mb-3">
                            Account Created!
                        </Text>

                        {/* Message */}
                        <Text className="text-base text-neutral-600 text-center mb-6">
                            Your account has been created successfully. Please check your email to verify your account before logging in.
                        </Text>

                        {/* Login Button */}
                        <PrimaryButton 
                            title="Go to Login" 
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.navigate('Login');
                            }}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
};

export default RegisterScreen;