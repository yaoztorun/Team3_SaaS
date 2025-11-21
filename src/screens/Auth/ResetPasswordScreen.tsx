import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { ScrollView } from 'react-native';
import { PrimaryButton, TextInputField } from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';
import { spacing } from '@/src/theme/spacing';

const ResetPasswordScreen: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = async () => {
        // Validation
        if (!newPassword || !confirmPassword) {
            setMessage('Please fill in all fields');
            setIsSuccess(false);
            return;
        }

        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters');
            setIsSuccess(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match');
            setIsSuccess(false);
            return;
        }

        setIsLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        setIsLoading(false);

        if (error) {
            setMessage(error.message);
            setIsSuccess(false);
        } else {
            setMessage('Password updated successfully!');
            setIsSuccess(true);
            
            // Sign out and redirect to login after 2 seconds
            setTimeout(async () => {
                await supabase.auth.signOut();
                window.location.href = '/'; // Reload to show login screen
            }, 2000);
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
                {/* Header */}
                <Box className="items-center">
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
                        Reset Password
                    </Text>
                    <Text className="text-neutral-500 text-center px-4">
                        Enter your new password below
                    </Text>
                </Box>

                {/* Reset Form */}
                <Box className="w-full mt-8">
                    {!isSuccess ? (
                        <>
                            <TextInputField
                                label="New Password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />

                            <Box className="mt-6">
                                <TextInputField
                                    label="Confirm Password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    onSubmitEditing={handleUpdatePassword}
                                />
                            </Box>

                            {message && !isSuccess && (
                                <Text className="text-center mt-4 mb-2 text-red-500">
                                    {message}
                                </Text>
                            )}

                            {/* Update Button */}
                            <Box className="mt-8">
                                <PrimaryButton 
                                    title={isLoading ? "Updating..." : "Update Password"}
                                    onPress={handleUpdatePassword}
                                    disabled={isLoading}
                                />
                            </Box>
                        </>
                    ) : (
                        <Box className="bg-green-50 p-4 rounded-lg mt-4">
                            <Text className="text-center text-green-700 font-medium">
                                ✓ {message}
                            </Text>
                            <Text className="text-center text-green-600 mt-2 text-sm">
                                Redirecting to login...
                            </Text>
                        </Box>
                    )}
                </Box>

                {/* Footer space */}
                <Box className="h-6" />
            </Box>
        </ScrollView>
    );
};

export default ResetPasswordScreen;
