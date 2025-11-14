import React, { useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, Platform, Image as RNImage, Modal, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Center } from '@/src/components/ui/center';
import { Pressable } from '@/src/components/ui/pressable';
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
import { createCameraHandlers } from '@/src/utils/camera';
import uploadImageUri from '@/src/utils/storage';
import { supabase } from '@/src/lib/supabase';
import fetchLocations from '@/src/api/location';
import { fetchCocktails } from '@/src/api/cocktail';
import type { DBCocktail } from '@/src/api/cocktail';
import { colors } from '@/src/theme/colors';

type ViewType = 'log' | 'recipe';

export const AddScreen = () => {
    const [activeView, setActiveView] = useState<ViewType>('log');
    const [rating, setRating] = useState(0);
    const [isAtHome, setIsAtHome] = useState(false);
    const [shareWith, setShareWith] = useState<'private' | 'friends' | 'public'>('private');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [locations, setLocations] = useState<Array<{ id: string; name: string | null }>>([]);
    const [locationQuery, setLocationQuery] = useState('');
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

    const { handleCameraPress, handleGalleryPress } = createCameraHandlers(setPhotoUri);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            const data = await fetchLocations();
            if (!mounted) return;
            setLocations(data.map(l => ({ id: l.id, name: l.name })));
        })();
        (async () => {
            const data = await fetchCocktails();
            if (!mounted) return;
            setCocktails(data.map((c: DBCocktail) => ({ id: c.id, name: c.name })));
        })();
        return () => { mounted = false };
    }, []);

    const [isUploading, setIsUploading] = useState(false);
    const [cocktails, setCocktails] = useState<Array<{ id: string; name: string | null }>>([]);
    const [cocktailQuery, setCocktailQuery] = useState('');
    const [cocktailSuggestionsVisible, setCocktailSuggestionsVisible] = useState(false);
    const [selectedCocktailId, setSelectedCocktailId] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const handleLogCocktail = async () => {
        try {
            setIsUploading(true);

            // Ensure user is signed in to satisfy row-level security policies
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();

            if (userErr) {
                console.error('Error fetching user', userErr);
                alert('Authentication error. Please sign in and try again.');
                return;
            }

            if (!user) {
                alert('You must be signed in to upload images. Please sign in and try again.');
                return;
            }

            // validate required fields
            const missing: string[] = [];
            if (!selectedCocktailId) missing.push('cocktail');
            if (!rating || rating <= 0) missing.push('rating');
            if (!caption || caption.trim().length === 0) missing.push('review');
            if (!isAtHome && !selectedLocationId) missing.push('location');

            if (missing.length > 0) {
                alert(`Please fill required fields: ${missing.join(', ')}`);
                return;
            }

            let uploadedUrl: string | null = null;
            if (photoUri) {
                // upload into a user-scoped folder so permissions can be enforced per-user
                uploadedUrl = await uploadImageUri(photoUri, user.id);
                console.log('Uploaded image URL:', uploadedUrl);
            }

            // convert rating with half-stars into an integer smallint representation (store halves as *2)
            const storedRating = Math.round(rating * 2);

            // save a DrinkLog for this user including the uploaded image URL
            const { data: insertData, error: insertError } = await supabase
                .from('DrinkLog')
                .insert([
                    {
                        user_id: user.id,
                        cocktail_id: selectedCocktailId,
                        rating: storedRating,
                        caption: caption.trim(),
                        location_id: isAtHome ? null : selectedLocationId,
                        visibility: shareWith,
                        image_url: uploadedUrl,
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (insertError) {
                console.error('Insert error', insertError);
                alert('Saved image but failed to create log entry. See console.');
                return;
            }

            // show confirmation modal and clear form
            setModalMessage('Drink logged successfully');
            setModalVisible(true);
            // clear form fields
            setCocktailQuery('');
            setSelectedCocktailId(null);
            setCaption('');
            setRating(0);
            setPhotoUri(null);
            setLocationQuery('');
            setSelectedLocationId(null);
            setIsAtHome(false);
            setShareWith('private');
            setCocktailSuggestionsVisible(false);
            setSuggestionsVisible(false);

            // user will dismiss the modal manually
        } catch (e) {
            console.error('Error logging cocktail', e);
            alert('Upload failed. See console for details.');
        } finally {
            setIsUploading(false);
        }
    };

    const canSubmit = !!selectedCocktailId && rating > 0 && caption.trim().length > 0 && (isAtHome || !!selectedLocationId);

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
                            placeholder="Select a cocktail"
                            value={cocktailQuery}
                            onChangeText={(t) => {
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
                                <RatingStars value={rating} onChange={setRating} />
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
                            onChangeText={setCaption}
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
                                <RadioOption
                                    selected={shareWith === 'public'}
                                    onPress={() => setShareWith('public')}
                                    icon="🌍"
                                    title="Public"
                                    description="Visible to everyone"
                                />
                            </Box>
                        </Box>

                        {/* Submit Button */}
                        <PrimaryButton title={isUploading ? 'Uploading…' : 'Log Cocktail'} onPress={handleLogCocktail} disabled={!canSubmit || isUploading} />
                        {!canSubmit && (
                            <Text className="text-sm text-red-500 mt-2">Please complete all required fields: cocktail, rating, review, and location or At Home.</Text>
                        )}
                        {/* confirmation modal is rendered at root level */}
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
                )}
            </ScrollView>

            {/* Confirmation Modal (re-uses the pattern from Settings) */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <Box className="w-full max-w-sm bg-white rounded-2xl p-4">
                        <Text className="text-lg font-semibold text-neutral-900 mb-3 text-center">
                            {modalMessage ?? 'Done'}
                        </Text>
                        <Text className="text-neutral-600 mb-6 text-center">Your drink has been logged.</Text>
                        <View>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                className="py-3 rounded-xl"
                                style={{ backgroundColor: colors.primary[500] }}
                            >
                                <Text className="text-white text-center font-medium">OK</Text>
                            </Pressable>
                        </View>
                    </Box>
                </View>
            </Modal>
        </Box>
    );
};

