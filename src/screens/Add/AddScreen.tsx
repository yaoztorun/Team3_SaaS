import React, { useRef, useState } from 'react';
import { ScrollView, Modal, View } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TopBar } from '@/src/screens/navigation/TopBar';
import { spacing } from '@/src/theme/spacing';
import { Pressable } from '@/src/components/ui/pressable';
import { ToggleSwitch, PrimaryButton, Heading } from '@/src/components/global';
import { useNavigation, useRoute } from '@react-navigation/native';
import LogView from './LogView';
import RecipeView from './RecipeView';
import { createCameraHandlers } from '@/src/utils/camera';
import uploadImageUri from '@/src/utils/storage';
import { supabase } from '@/src/lib/supabase';
import fetchLocations from '@/src/api/location';
import { fetchPublicCocktails, fetchPrivatePersonalRecipes } from '@/src/api/cocktail';
import type { DBCocktail } from '@/src/api/cocktail';
import { colors } from '@/src/theme/colors';
import { ANALYTICS_EVENTS, posthogCapture, trackWithTTFA } from '@/src/analytics';
import { addTags } from '@/src/api/tags';

type ViewType = 'log' | 'recipe';

export const AddScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { prefilledCocktailId, prefilledCocktailName } = route.params || {};
    
    const [activeView, setActiveView] = useState<ViewType>('log');
    const [rating, setRating] = useState(0);
    const [isAtHome, setIsAtHome] = useState(false);
    const [shareWith, setShareWith] = useState<'private' | 'friends' | 'public'>('private');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Track if user has interacted with form (to show validation errors)
    const [hasLogInteracted, setHasLogInteracted] = useState(false);
    const [hasRecipeInteracted, setHasRecipeInteracted] = useState(false);
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
            // Fetch both public cocktails and user's private personal recipes
            const [publicCocktails, personalRecipes] = await Promise.all([
                fetchPublicCocktails(),
                fetchPrivatePersonalRecipes()
            ]);
            if (!mounted) return;
            const allCocktails = [...publicCocktails, ...personalRecipes];
            const mappedCocktails = allCocktails.map((c: DBCocktail) => ({ id: c.id, name: c.name }));
            setCocktails(mappedCocktails);
            
            // Pre-fill cocktail if parameters provided
            if (prefilledCocktailId && prefilledCocktailName) {
                setCocktailQuery(prefilledCocktailName);
                setSelectedCocktailId(prefilledCocktailId);
            }
        })();
        return () => { mounted = false };
    }, [prefilledCocktailId, prefilledCocktailName]);

    const [isUploading, setIsUploading] = useState(false);
    const [cocktails, setCocktails] = useState<Array<{ id: string; name: string | null }>>([]);
    const [cocktailQuery, setCocktailQuery] = useState('');
    const [cocktailSuggestionsVisible, setCocktailSuggestionsVisible] = useState(false);
    const [selectedCocktailId, setSelectedCocktailId] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [taggedFriendIds, setTaggedFriendIds] = useState<string[]>([]);

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
                ])
                .select()
                .single();

            if (insertError) {
                console.error('Insert error', insertError);
                alert('Saved image but failed to create log entry. See console.');
                return;
            }

            // Add tags if any friends were selected
            if (taggedFriendIds.length > 0 && insertData) {
                const tagResult = await addTags(insertData.id, taggedFriendIds);
                if (!tagResult.success) {
                    console.error('Failed to add tags:', tagResult.error);
                    // Don't fail the entire operation, just log the error
                }
            }

            // Check if this is the user's first cocktail log (for activation tracking)
            const { count } = await supabase
                .from('DrinkLog')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const isFirstLog = count === 1;

            // Track cocktail logged event
            if (isFirstLog) {
                trackWithTTFA(ANALYTICS_EVENTS.FIRST_COCKTAIL_LOGGED, {
                    cocktail_id: selectedCocktailId,
                    has_photo: !!uploadedUrl,
                    rating: rating,
                    visibility: shareWith,
                    location_type: isAtHome ? 'home' : 'bar',
                });
            } else {
                posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
                    feature: 'cocktail_logged',
                    cocktail_id: selectedCocktailId,
                    has_photo: !!uploadedUrl,
                    rating: rating,
                    visibility: shareWith,
                    location_type: isAtHome ? 'home' : 'bar',
                });
            }

            // Clear form fields first
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
            setTaggedFriendIds([]);

            // Reset interaction state so errors won't show on fresh form
            setHasLogInteracted(false);

            // Show confirmation modal
            setModalMessage('Drink logged successfully');
            setModalVisible(true);

            // user will dismiss the modal manually
        } catch (e) {
            console.error('Error logging cocktail', e);
            alert('Upload failed. See console for details.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRecipeCreated = () => {
        // Clear form fields first
        setPhotoUri(null);
        setSelectedDifficulty('Easy');

        // Reset interaction state so errors won't show on fresh form
        setHasRecipeInteracted(false);

        // Show success modal
        setModalMessage('Recipe created successfully');
        setModalVisible(true);
    };

    const handleModalConfirm = () => {
        setModalVisible(false);
        // Navigate to home tab
        navigation.navigate('Home' as never);
    };

    const canSubmit = !!selectedCocktailId && rating > 0 && caption.trim().length > 0 && (isAtHome || !!selectedLocationId);

    return (
        <Box className="flex-1 bg-neutral-50">
            <TopBar title="Add Drink" showLogo />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop: spacing.screenVertical,
                    paddingBottom: spacing.screenBottom,
                }}
            >
                {/* View Toggle */}
                <Box className="mb-4 bg-white rounded-2xl p-1 flex-row">
                    <Pressable
                        onPress={() => setActiveView('log')}
                        className={
                            activeView === 'log'
                                ? 'flex-1 py-2 px-4 rounded-xl bg-teal-500'
                                : 'flex-1 py-2 px-4 rounded-xl bg-transparent'
                        }
                    >
                        <Text
                            className={
                                activeView === 'log'
                                    ? 'text-sm text-center text-white font-medium'
                                    : 'text-sm text-center text-neutral-900 font-medium'
                            }
                        >
                            Existing Cocktail
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveView('recipe')}
                        className={
                            activeView === 'recipe'
                                ? 'flex-1 py-2 px-4 rounded-xl bg-teal-500'
                                : 'flex-1 py-2 px-4 rounded-xl bg-transparent'
                        }
                    >
                        <Text
                            className={
                                activeView === 'recipe'
                                    ? 'text-sm text-center text-white font-medium'
                                    : 'text-sm text-center text-neutral-900 font-medium'
                            }
                        >
                            Create Recipe
                        </Text>
                    </Pressable>
                </Box>

                {activeView === 'log' ? (
                    <LogView
                        cocktailQuery={cocktailQuery}
                        setCocktailQuery={setCocktailQuery}
                        cocktails={cocktails}
                        cocktailSuggestionsVisible={cocktailSuggestionsVisible}
                        setCocktailSuggestionsVisible={setCocktailSuggestionsVisible}
                        selectedCocktailId={selectedCocktailId}
                        setSelectedCocktailId={setSelectedCocktailId}
                        handleCameraPress={handleCameraPress}
                        handleGalleryPress={handleGalleryPress}
                        photoUri={photoUri}
                        rating={rating}
                        setRating={setRating}
                        caption={caption}
                        setCaption={setCaption}
                        locationQuery={locationQuery}
                        setLocationQuery={setLocationQuery}
                        suggestionsVisible={suggestionsVisible}
                        setSuggestionsVisible={setSuggestionsVisible}
                        locations={locations}
                        selectedLocationId={selectedLocationId}
                        setSelectedLocationId={setSelectedLocationId}
                        isAtHome={isAtHome}
                        setIsAtHome={setIsAtHome}
                        shareWith={shareWith}
                        setShareWith={setShareWith}
                        isUploading={isUploading}
                        handleLogCocktail={handleLogCocktail}
                        canSubmit={canSubmit}
                        hasInteracted={hasLogInteracted}
                        setHasInteracted={setHasLogInteracted}
                        taggedFriendIds={taggedFriendIds}
                        setTaggedFriendIds={setTaggedFriendIds}
                    />
                ) : (
                    <RecipeView
                        handleCameraPress={handleCameraPress}
                        handleGalleryPress={handleGalleryPress}
                        photoUri={photoUri}
                        selectedDifficulty={selectedDifficulty}
                        setSelectedDifficulty={setSelectedDifficulty}
                        onRecipeCreated={handleRecipeCreated}
                        hasInteracted={hasRecipeInteracted}
                        setHasInteracted={setHasRecipeInteracted}
                    />
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleModalConfirm}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <Box className="w-full max-w-sm bg-white rounded-2xl p-6">
                        <Heading level="h2" className="mb-3 text-center">
                            {modalMessage ?? 'Success!'}
                        </Heading>
                        <Text className="text-neutral-600 mb-6 text-center">
                            {activeView === 'log' ? 'Your drink has been logged.' : 'Your recipe has been created.'}
                        </Text>
                        <PrimaryButton
                            title="OK"
                            onPress={handleModalConfirm}
                        />
                    </Box>
                </View>
            </Modal>
        </Box>
    );
};

