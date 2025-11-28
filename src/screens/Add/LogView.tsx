import React, { useState } from 'react';
import { TouchableOpacity, Image as RNImage } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';
import { MapPin } from 'lucide-react-native';
import {
    PrimaryButton,
    TextInputField,
    ImageUploadBox,
    RatingStars,
    RadioOption,
} from '@/src/components/global';
import { FriendSelectorModal } from '@/src/components/global/FriendSelectorModal';
import { spacing } from '@/src/theme/spacing';
import { colors } from '@/src/theme/colors';

type CocktailItem = { id: string; name: string | null };

interface LogViewProps {
    cocktailQuery: string;
    setCocktailQuery: (t: string) => void;
    cocktails: CocktailItem[];
    cocktailSuggestionsVisible: boolean;
    setCocktailSuggestionsVisible: (v: boolean) => void;
    selectedCocktailId: string | null;
    setSelectedCocktailId: (id: string | null) => void;
    handleCameraPress: () => void;
    handleGalleryPress: () => void;
    photoUri: string | null;
    rating: number;
    setRating: (n: number) => void;
    caption: string;
    setCaption: (s: string) => void;
    locationQuery: string;
    setLocationQuery: (s: string) => void;
    suggestionsVisible: boolean;
    setSuggestionsVisible: (v: boolean) => void;
    locations: Array<{ id: string; name: string | null }>;
    selectedLocationId: string | null;
    setSelectedLocationId: (id: string | null) => void;
    isAtHome: boolean;
    setIsAtHome: (v: boolean) => void;
    shareWith: 'private' | 'friends' | 'public';
    setShareWith: (v: 'private' | 'friends' | 'public') => void;
    isUploading: boolean;
    handleLogCocktail: () => Promise<void>;
    canSubmit: boolean;
    hasInteracted: boolean;
    setHasInteracted: (v: boolean) => void;
    taggedFriendIds: string[];
    setTaggedFriendIds: (ids: string[]) => void;
}

const LogView: React.FC<LogViewProps> = ({
    cocktailQuery,
    setCocktailQuery,
    cocktails,
    cocktailSuggestionsVisible,
    setCocktailSuggestionsVisible,
    selectedCocktailId,
    setSelectedCocktailId,
    handleCameraPress,
    handleGalleryPress,
    photoUri,
    rating,
    setRating,
    caption,
    setCaption,
    locationQuery,
    setLocationQuery,
    suggestionsVisible,
    setSuggestionsVisible,
    locations,
    selectedLocationId,
    setSelectedLocationId,
    isAtHome,
    setIsAtHome,
    shareWith,
    setShareWith,
    isUploading,
    handleLogCocktail,
    canSubmit,
    hasInteracted,
    setHasInteracted,
    taggedFriendIds,
    setTaggedFriendIds,
}) => {
    const [tagModalVisible, setTagModalVisible] = useState(false);

    // Mark form as interacted when user starts filling fields
    const handleFieldInteraction = () => {
        if (!hasInteracted) {
            setHasInteracted(true);
        }
    };

    return (
        <Box className="flex-1 space-y-6">
            {/* Cocktail Name */}
            <TextInputField
                label="Cocktail Name"
                required
                placeholder="Select a cocktail"
                value={cocktailQuery}
                onChangeText={(t) => {
                    handleFieldInteraction();
                    setCocktailQuery(t);
                    setSelectedCocktailId(null);
                    setCocktailSuggestionsVisible(!!t);
                }}
                onFocus={() => setCocktailSuggestionsVisible(!!cocktailQuery)}
            />

            {cocktailSuggestionsVisible && cocktailQuery.length > 0 && (
                <Box className="bg-white rounded-lg border border-gray-200 mt-2">
                    {cocktails
                        .filter(c => c.name && c.name.toLowerCase().includes(cocktailQuery.toLowerCase()))
                        .slice(0, 6)
                        .map(c => (
                            <TouchableOpacity
                                key={c.id}
                                className="px-4 py-3 border-b border-gray-100"
                                onPress={() => {
                                    setCocktailQuery(c.name || '');
                                    setSelectedCocktailId(c.id);
                                    setCocktailSuggestionsVisible(false);
                                }}
                            >
                                <Text>{c.name}</Text>
                            </TouchableOpacity>
                        ))}
                    {cocktails.filter(c => c.name && c.name.toLowerCase().includes(cocktailQuery.toLowerCase())).length === 0 && (
                        <Box className="px-4 py-3">
                            <Text className="text-neutral-400">No cocktails found</Text>
                        </Box>
                    )}
                </Box>
            )}

            {/* Photo Upload */}
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

            {/* Rating */}
            <Box className="space-y-2 bg-white p-4 rounded-xl border border-gray-200">
                <Text className="text-sm text-neutral-950">Rating</Text>
                <Center>
                    <RatingStars value={rating} onChange={(r) => {
                        handleFieldInteraction();
                        setRating(r);
                    }} />
                </Center>
            </Box>

            {/* Review / Comment */}
            <TextInputField
                label="Review"
                required
                placeholder="How was your drink? Tell us more!"
                multiline
                numberOfLines={3}
                value={caption}
                onChangeText={(text) => {
                    handleFieldInteraction();
                    setCaption(text);
                }}
            />

            {/* Location */}
            <Box className="space-y-2">
                <TextInputField
                    label="Where did you drink it?"
                    required
                    placeholder="Bar name, restaurant..."
                    icon={<MapPin size={20} color="#6B7280" />}
                    value={locationQuery}
                    onChangeText={(text) => {
                        setLocationQuery(text);
                        setSelectedLocationId(null);
                        setSuggestionsVisible(!!text);
                    }}
                    onFocus={() => setSuggestionsVisible(!!locationQuery)}
                />

                {suggestionsVisible && locationQuery.length > 0 && (
                    <Box className="bg-white rounded-lg border border-gray-200 mt-2">
                        {locations
                            .filter(l => l.name && l.name.toLowerCase().includes(locationQuery.toLowerCase()))
                            .slice(0, 6)
                            .map(l => (
                                <TouchableOpacity
                                    key={l.id}
                                    className="px-4 py-3 border-b border-gray-100"
                                    onPress={() => {
                                        setLocationQuery(l.name || '');
                                        setSelectedLocationId(l.id);
                                        setSuggestionsVisible(false);
                                    }}
                                >
                                    <Text>{l.name}</Text>
                                </TouchableOpacity>
                            ))}
                        {locations.filter(l => l.name && l.name.toLowerCase().includes(locationQuery.toLowerCase())).length === 0 && (
                            <Box className="px-4 py-3">
                                <Text className="text-neutral-400">No locations found</Text>
                            </Box>
                        )}
                    </Box>
                )}
                <TouchableOpacity
                    className="flex-row items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200"
                    onPress={() => {
                        const newVal = !isAtHome;
                        setIsAtHome(newVal);
                        if (newVal) {
                            // clear location selection when setting At Home
                            setLocationQuery('');
                            setSelectedLocationId(null);
                        }
                    }}
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
            <TouchableOpacity 
                className="flex-row items-center justify-center space-x-2 bg-gray-100 py-3 rounded-xl border border-gray-200"
                onPress={() => setTagModalVisible(true)}
            >
                <Text className="text-base text-gray-600">
                    👥 Tag friends you were drinking with
                    {taggedFriendIds.length > 0 && ` (${taggedFriendIds.length} tagged)`}
                </Text>
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
                    <RadioOption
                        selected={shareWith === 'public'}
                        onPress={() => setShareWith('public')}
                        icon="🌍"
                        title="Public"
                        description="Visible to everyone"
                    />
                </Box>
                
                {/* Recipe visibility info */}
                {(shareWith === 'public' || shareWith === 'friends') && (
                    <Box className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Text className="text-xs text-blue-800">
                            ℹ️ Sharing publicly or with friends will make your recipe visible to others so they can view and recreate it.
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Submit Button */}
            <PrimaryButton title={isUploading ? 'Uploading...' : 'Post Cocktail'} onPress={handleLogCocktail} disabled={!canSubmit || isUploading} />
            {!canSubmit && hasInteracted && (
                <Text className="text-sm text-red-500 mt-2">Please complete all required fields: cocktail, rating, review, and location or At Home.</Text>
            )}

            {/* Friend Selector Modal */}
            <FriendSelectorModal
                visible={tagModalVisible}
                onClose={() => setTagModalVisible(false)}
                selectedFriendIds={taggedFriendIds}
                onConfirm={setTaggedFriendIds}
            />
        </Box>
    );
};

export default LogView;
