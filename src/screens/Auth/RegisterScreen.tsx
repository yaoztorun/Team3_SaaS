import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { PrimaryButton, TextInputField } from '@/src/components/global';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = () => {
        // TODO: Implement registration logic (create user, set auth state)
        if (password !== confirmPassword) {
            // Show error
            return;
        }
        // After creating an account, navigate to Login to sign in
        navigation.navigate('Login');
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                <Box className="flex-1 p-6 justify-between">
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

                        {/* Register Button */}
                        <PrimaryButton 
                            title="Create Account" 
                            onPress={handleRegister}
                        />

                        {/* Sign In Link */}
                        <View className="flex-row justify-center items-center mb-6">
                            <Text className="text-neutral-600">
                                Already have an account?{' '}
                            </Text>
                            <Pressable onPress={handleLogin}>
                                <Text className="text-primary-500 font-medium">
                                    Sign In
                                </Text>
                            </Pressable>
                        </View>
                    </Box>

                    {/* Terms and Privacy */}
                    <Text className="text-center text-neutral-500 text-sm mb-6">
                        By signing up, you agree to our{' '}
                        <Text className="text-primary-500">Terms of Service</Text>
                        {' '}and{' '}
                        <Text className="text-primary-500">Privacy Policy</Text>
                    </Text>
                </Box>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;