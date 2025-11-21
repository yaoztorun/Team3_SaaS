import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { PrimaryButton, TextInputField } from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';
import { spacing } from '@/src/theme/spacing';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            setMessage('Please enter your email address');
            setIsSuccess(false);
            return;
        }

        setIsLoading(true);
        setMessage(null);

        const redirectUrl = `${window.location.origin}/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });

        setIsLoading(false);

        if (error) {
            setMessage(error.message);
            setIsSuccess(false);
        } else {
            setMessage('Password reset link sent! Check your email.');
            setIsSuccess(true);
        }
    };

    const handleBackToLogin = () => {
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
                {/* Header */}
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
                        Forgot Password?
                    </Text>
                    <Text className="text-neutral-500 text-center px-4">
                        No worries! Enter your email and we'll send you a link to reset your password
                    </Text>
                </Box>

                {/* Reset Form */}
                <Box className="w-full mt-8">
                    {!isSuccess ? (
                        <>
                            <TextInputField
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onSubmitEditing={handleResetPassword}
                            />

                            {message && (
                                <Text className="text-center mt-4 mb-2 text-red-500">
                                    {message}
                                </Text>
                            )}

                            {/* Reset Button */}
                            <Box className="mt-8">
                                <PrimaryButton 
                                    title={isLoading ? "Sending..." : "Send Reset Link"}
                                    onPress={handleResetPassword}
                                    disabled={isLoading}
                                />
                            </Box>
                        </>
                    ) : (
                        <>
                            <Box className="bg-green-50 p-4 rounded-lg mt-4">
                                <Text className="text-center text-green-700 font-medium">
                                    ✓ {message}
                                </Text>
                                <Text className="text-center text-green-600 mt-2 text-sm">
                                    Please check your inbox and spam folder
                                </Text>
                            </Box>

                            <Box className="mt-8">
                                <PrimaryButton 
                                    title="Back to Login"
                                    onPress={handleBackToLogin}
                                />
                            </Box>
                        </>
                    )}

                    {/* Back to Login Link */}
                    {!isSuccess && (
                        <Pressable className="mt-6" onPress={handleBackToLogin}>
                            <Text className="text-center text-primary-500 font-medium">
                                ← Back to Login
                            </Text>
                        </Pressable>
                    )}
                </Box>

                {/* Footer space */}
                <Box className="h-6" />
            </Box>
        </ScrollView>
    );
};

export default ForgotPasswordScreen;
