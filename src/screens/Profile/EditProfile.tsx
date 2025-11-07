import React, { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';

const EditProfile: React.FC = () => {
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('John');
    const [lastName, setLastName] = useState('Doe');
    const [username, setUsername] = useState('@johndoe');
    const [bio, setBio] = useState('Cocktail Enthusiast');
    const [location, setLocation] = useState('New York, NY');
    const [favoriteCocktail, setFavoriteCocktail] = useState('');
    const [favoriteSpirit, setFavoriteSpirit] = useState('');

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Edit Profile" showBack onBackPress={() => navigation.goBack()} />
            <ScrollView
                className="flex-1 px-4 pt-6"
                contentContainerStyle={{ paddingBottom: spacing.screenBottom }}
            >
                <Box className="mb-6 items-center">
                    <Box className="h-24 w-24 rounded-full bg-teal-600 items-center justify-center mb-3">
                        <Text className="text-2xl text-white">JD</Text>
                    </Box>
                    <Pressable className="-mt-8 bg-teal-500 rounded-full p-2">
                        <Text className="text-white">📷</Text>
                    </Pressable>
                </Box>

                <Box className="mb-4 bg-white rounded-xl p-4 shadow-sm">
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Box style={{ flex: 1 }}>
                            <Text className="text-sm font-medium text-neutral-600 mb-2">First Name</Text>
                            <Box className="bg-neutral-100 rounded-lg px-3 py-2">
                                <TextInput value={firstName} onChangeText={setFirstName} placeholder="First" placeholderTextColor="#9CA3AF" />
                            </Box>
                        </Box>
                        <Box style={{ flex: 1 }}>
                            <Text className="text-sm font-medium text-neutral-600 mb-2">Last Name</Text>
                            <Box className="bg-neutral-100 rounded-lg px-3 py-2">
                                <TextInput value={lastName} onChangeText={setLastName} placeholder="Last" placeholderTextColor="#9CA3AF" />
                            </Box>
                        </Box>
                    </View>

                    <Box className="mt-4">
                        <Text className="text-sm font-medium text-neutral-600 mb-2">Username</Text>
                        <Box className="bg-neutral-100 rounded-lg px-3 py-2">
                            <TextInput value={username} onChangeText={setUsername} placeholder="@username" placeholderTextColor="#9CA3AF" />
                        </Box>
                    </Box>

                    <Box className="mt-4">
                        <Text className="text-sm font-medium text-neutral-600 mb-2">Bio</Text>
                        <Box className="bg-neutral-100 rounded-lg px-3 py-2">
                            <TextInput value={bio} onChangeText={setBio} placeholder="Cocktail enthusiast" multiline numberOfLines={3} textAlignVertical="top" placeholderTextColor="#9CA3AF" />
                        </Box>
                    </Box>

                    <Box className="mt-4">
                        <Text className="text-sm font-medium text-neutral-600 mb-2">Location</Text>
                        <Box className="bg-neutral-100 rounded-lg px-3 py-2">
                            <TextInput value={location} onChangeText={setLocation} placeholder="City, State" placeholderTextColor="#9CA3AF" />
                        </Box>
                    </Box>
                </Box>

                <Box className="mb-6 bg-white rounded-xl p-4 shadow-sm">
                    <Text className="text-sm font-semibold text-neutral-800 mb-3">Preferences</Text>
                    <Box className="mb-3">
                        <Text className="text-sm text-neutral-600 mb-2">Favorite Cocktail</Text>
                        <Box className="bg-neutral-100 rounded-lg px-3 py-2">
                            <TextInput value={favoriteCocktail} onChangeText={setFavoriteCocktail} placeholder="e.g., Old Fashioned" placeholderTextColor="#9CA3AF" />
                        </Box>
                    </Box>
                    <Box>
                        <Text className="text-sm text-neutral-600 mb-2">Favorite Spirit</Text>
                        <Box className="bg-neutral-100 rounded-lg px-3 py-2">
                            <TextInput value={favoriteSpirit} onChangeText={setFavoriteSpirit} placeholder="e.g., Whiskey" placeholderTextColor="#9CA3AF" />
                        </Box>
                    </Box>
                </Box>

                <Pressable onPress={() => navigation.goBack()} className="rounded-xl shadow overflow-hidden">
                    <LinearGradient
                        colors={[colors.primary[400], colors.primary[600]]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                    >
                        <Text className="text-white text-base font-semibold">Save Changes</Text>
                    </LinearGradient>
                </Pressable>
            </ScrollView>
        </Box>
    );
};

export default EditProfile;
