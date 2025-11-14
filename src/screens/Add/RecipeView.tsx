import React from 'react';
import { TouchableOpacity, Image as RNImage } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import {
        PrimaryButton,
        TextInputField,
        ImageUploadBox,
        DifficultySelector,
        RadioOption,
} from '@/src/components/global';

interface RecipeViewProps {
        handleCameraPress: () => void;
        handleGalleryPress: () => void;
        photoUri: string | null;
        selectedDifficulty: 'Easy' | 'Medium' | 'Hard';
        setSelectedDifficulty: (v: 'Easy' | 'Medium' | 'Hard') => void;
        shareWith: 'private' | 'friends' | 'public';
        setShareWith: (v: 'private' | 'friends' | 'public') => void;
}

const RecipeView: React.FC<RecipeViewProps> = ({
        handleCameraPress,
        handleGalleryPress,
        photoUri,
        selectedDifficulty,
        setSelectedDifficulty,
        shareWith,
        setShareWith,
}) => {
        return (
                <Box className="flex-1 space-y-6">
                        {/* Recipe Name */}
                        <TextInputField
                                label="Recipe Name"
                                required
                                placeholder="Name your cocktail recipe"
                        />

                        {/* Recipe Photo */}
                        <Box className="space-y-2">
                                <Text className="text-sm text-neutral-950">Photo</Text>
                                <ImageUploadBox
                                        onCameraPress={handleCameraPress}
                                        onGalleryPress={handleGalleryPress}
                                />
                                {photoUri && (
                                        <Box className="mt-3 rounded-xl overflow-hidden">
                                                <RNImage source={{ uri: photoUri }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                                        </Box>
                                )}
                        </Box>

                        {/* Ingredients */}
                        <Box className="space-y-2">
                                <Text className="text-sm text-neutral-950">Ingredients *</Text>
                                <Box className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                        <Box className="space-y-3">
                                                <Box className="flex-col space-y-2">
                                                        <TouchableOpacity
                                                                className="w-full p-3 rounded-lg border border-gray-200 bg-white flex-row justify-between items-center"
                                                        >
                                                                <Text className="text-neutral-600">Select ingredient</Text>
                                                                <Text>▼</Text>
                                                        </TouchableOpacity>
                                                        <Box className="flex-row space-x-2">
                                                                <TextInputField
                                                                        placeholder="Amount"
                                                                        keyboardType="numeric"
                                                                />
                                                                <TouchableOpacity
                                                                        className="flex-1 p-3 rounded-lg border border-gray-200 bg-white flex-row justify-between items-center"
                                                                >
                                                                        <Text className="text-neutral-600">Unit</Text>
                                                                        <Text>▼</Text>
                                                                </TouchableOpacity>
                                                        </Box>
                                                </Box>
                                        </Box>
                                        <TouchableOpacity
                                                className="flex-row items-center justify-center py-2 mt-2"
                                        >
                                                <Text className="text-primary-500">+ Add Ingredient</Text>
                                        </TouchableOpacity>
                                </Box>
                        </Box>

                        {/* Instructions */}
                        <Box className="space-y-2">
                                <Text className="text-sm text-neutral-950">Instructions *</Text>
                                <Box className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                        <Box className="flex-row items-start space-x-3">
                                                <Text className="text-neutral-400 mt-3">1.</Text>
                                                <TextInputField
                                                        placeholder="Add step"
                                                        multiline
                                                        numberOfLines={2}
                                                />
                                        </Box>
                                        <TouchableOpacity className="flex-row items-center justify-center py-2">
                                                <Text className="text-primary-500">+ Add Step</Text>
                                        </TouchableOpacity>
                                </Box>
                        </Box>

                        {/* Difficulty */}
                        <Box className="space-y-2">
                                <Text className="text-sm text-neutral-950">Difficulty</Text>
                                <Box className="bg-white p-4 rounded-xl border border-gray-200">
                                        <DifficultySelector
                                                selected={selectedDifficulty}
                                                onChange={setSelectedDifficulty}
                                        />
                                </Box>
                        </Box>

                        {/* Share With */}
                        <Box className="bg-white p-4 rounded-xl border border-gray-200">
                                <Text className="text-sm text-neutral-950 mb-3">Share With</Text>
                                <Box className="space-y-2">
                                        <RadioOption
                                                selected={shareWith === 'private'}
                                                onPress={() => setShareWith('private')}
                                                icon="👤"
                                                title="Just Me"
                                                description="Only visible on your profile"
                                        />
                                        <RadioOption
                                                selected={shareWith === 'friends'}
                                                onPress={() => setShareWith('friends')}
                                                icon="👥"
                                                title="All Friends"
                                                description="Share on feed with all friends"
                                        />
                                </Box>
                        </Box>

                        {/* Submit Button */}
                        <PrimaryButton title="Create Recipe" onPress={() => console.log('Create recipe')} />
                </Box>
        );
};

export default RecipeView;
