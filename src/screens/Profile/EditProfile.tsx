import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton, TextInputField } from '@/src/components/global';

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
                            <TextInputField
                                label="First Name"
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="First"
                            />
                        </Box>
                        <Box style={{ flex: 1 }}>
                            <TextInputField
                                label="Last Name"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Last"
                            />
                        </Box>
                    </View>

                    <Box className="mt-4">
                        <TextInputField
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="@username"
                        />
                    </Box>

                    <Box className="mt-4">
                        <TextInputField
                            label="Bio"
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Cocktail enthusiast"
                            multiline
                            numberOfLines={3}
                        />
                    </Box>

                    <Box className="mt-4">
                        <TextInputField
                            label="Location"
                            value={location}
                            onChangeText={setLocation}
                            placeholder="City, State"
                        />
                    </Box>
                </Box>

                <Box className="mb-6 bg-white rounded-xl p-4 shadow-sm">
                    <Text className="text-sm font-semibold text-neutral-800 mb-3">Preferences</Text>
                    <Box className="mb-3">
                        <TextInputField
                            label="Favorite Cocktail"
                            value={favoriteCocktail}
                            onChangeText={setFavoriteCocktail}
                            placeholder="e.g., Old Fashioned"
                        />
                    </Box>
                    <Box>
                        <TextInputField
                            label="Favorite Spirit"
                            value={favoriteSpirit}
                            onChangeText={setFavoriteSpirit}
                            placeholder="e.g., Whiskey"
                        />
                    </Box>
                </Box>

                <PrimaryButton
                    title="Save Changes"
                    onPress={() => navigation.goBack()}
                />
            </ScrollView>
        </Box>
    );
};

export default EditProfile;
