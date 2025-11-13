import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Center } from '@/src/components/ui/center';
import { MapPin } from 'lucide-react-native';
import {
    PrimaryButton,
    TextInputField,
    ImageUploadBox,
    RatingStars,
    RadioOption,
    DifficultySelector,
    ToggleSwitch
} from '@/src/components/global';

type ViewType = 'log' | 'recipe';

export const AddScreen = () => {
    const [activeView, setActiveView] = useState<ViewType>('log');
    const [rating, setRating] = useState(0);
    const [isAtHome, setIsAtHome] = useState(false);
    const [shareWith, setShareWith] = useState<'private' | 'friends'>('private');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Log your drink!" streakCount={7} cocktailCount={42} />
            
            {/* View Toggle */}
            <Box className="px-4 py-2 bg-white border-b border-gray-200">
                <ToggleSwitch
                    value={activeView === 'log' ? 'left' : 'right'}
                    onChange={(val) => setActiveView(val === 'left' ? 'log' : 'recipe')}
                    leftLabel="Log Cocktail"
                    rightLabel="Create Recipe"
                />
            </Box>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {activeView === 'log' ? (
                    <Box className="flex-1 space-y-6">
                        {/* Cocktail Name */}
                        <TextInputField
                            label="Cocktail Name"
                            required
                            placeholder="What cocktail did you drink?"
                        />

                        {/* Photo Upload */}
                        <Box className="space-y-2">
                            <Text className="text-sm text-neutral-950">Photo</Text>
                            <ImageUploadBox
                                onCameraPress={() => console.log('Camera pressed')}
                                onGalleryPress={() => console.log('Gallery pressed')}
                            />
                        </Box>

                        {/* Rating */}
                        <Box className="space-y-2 bg-white p-4 rounded-xl border border-gray-200">
                            <Text className="text-sm text-neutral-950">Rating</Text>
                            <Center>
                                <RatingStars value={rating} onChange={setRating} />
                            </Center>
                        </Box>

                        {/* Review */}
                        <TextInputField
                            label="Review (Optional)"
                            placeholder="How was your drink? Tell us more!"
                            multiline
                            numberOfLines={3}
                        />

                        {/* Location */}
                        <Box className="space-y-2">
                            <TextInputField
                                label="Where did you drink it?"
                                required
                                placeholder="Bar name, restaurant..."
                                icon={<MapPin size={20} color="#6B7280" />}
                            />
                            <TouchableOpacity 
                                className="flex-row items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200"
                                onPress={() => setIsAtHome(!isAtHome)}
                            >
                                <Box className={`w-4 h-4 rounded border items-center justify-center ${isAtHome ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                                    {isAtHome && (
                                        <Text className="text-white text-xs">✓</Text>
                                    )}
                                </Box>
                                <Text className="text-base">At Home</Text>
                            </TouchableOpacity>
                        </Box>

                        {/* Tag Friends Button */}
                        <TouchableOpacity className="flex-row items-center justify-center space-x-2 bg-gray-100 py-3 rounded-xl border border-gray-200">
                            <Text className="text-base text-gray-600">👥 Tag friends you were drinking with</Text>
                        </TouchableOpacity>

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
                        <PrimaryButton title="Log Cocktail" onPress={() => console.log('Log cocktail')} />
                    </Box>
                ) : (
                    // Recipe Creation View
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
                                onCameraPress={() => console.log('Camera pressed')}
                                onGalleryPress={() => console.log('Gallery pressed')}
                            />
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
                )}
            </ScrollView>
        </Box>
    );
};
