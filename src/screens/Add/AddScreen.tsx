import React, { useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { fetchPublicCocktails, fetchPrivatePersonalRecipes } from '@/src/api/cocktail';
import type { DBCocktail } from '@/src/api/cocktail';
import { colors } from '@/src/theme/colors';
import { ANALYTICS_EVENTS, posthogCapture, trackWithTTFA } from '@/src/analytics';
import { addTags } from '@/src/api/tags';

type ViewType = 'log' | 'recipe';

export const AddScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { prefilledCocktailId, prefilledCocktailName, prefilledCocktailImageUrl } = route.params || {};

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

    const { handleCameraPress, handleGalleryPress } = createCameraHandlers(setPhotoUri);

    React.useEffect(() => {
        let mounted = true;
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
                if (prefilledCocktailImageUrl) {
                    setPhotoUri(prefilledCocktailImageUrl);
                }
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
    const [modalActions, setModalActions] = useState<'default' | 'post-or-home'>('default');
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

            // Rating is already on 0-5 scale from RatingStars component
            const storedRating = rating;

            // save a DrinkLog for this user including the uploaded image URL
            const { data: insertData, error: insertError } = await supabase
                .from('DrinkLog')
                .insert([
                    {
                        user_id: user.id,
                        cocktail_id: selectedCocktailId,
                        rating: storedRating,
                        caption: caption.trim(),
                        location_id: null,
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

            // Make the cocktail public only if the post is public or friends-only
            // Private posts keep the recipe private
            if (shareWith === 'public' || shareWith === 'friends') {
                const { error: updateError } = await supabase
                    .from('Cocktail')
                    .update({ is_public: true })
                    .eq('id', selectedCocktailId)
                    .eq('is_public', false); // Only update if it was private

                if (updateError) {
                    console.error('Failed to update cocktail visibility:', updateError);
                    // Don't fail the entire operation, just log the error
                }
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
                });
            } else {
                posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
                    feature: 'cocktail_logged',
                    cocktail_id: selectedCocktailId,
                    has_photo: !!uploadedUrl,
                    rating: rating,
                    visibility: shareWith,
                });
            }

            // Clear form fields first
            setCocktailQuery('');
            setSelectedCocktailId(null);
            setCaption('');
            setRating(0);
            setPhotoUri(null);
            setShareWith('private');
            setCocktailSuggestionsVisible(false);
            setTaggedFriendIds([]);

            // Reset interaction state so errors won't show on fresh form
            setHasLogInteracted(false);

            // Show confirmation modal
            setModalMessage('Drink posted successfully');
            setModalActions('default');
            setModalVisible(true);

            // user will dismiss the modal manually
        } catch (e) {
            console.error('Error posting cocktail', e);
            alert('Upload failed. See console for details.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRecipeCreated = (created: { id: string; name: string; image_url: string | null }) => {
        // Clear form fields first
        setPhotoUri(null);
        setSelectedDifficulty('Easy');

        // Reset interaction state so errors won't show on fresh form
        setHasRecipeInteracted(false);

        // Prefill log view with created recipe and prompt user to post now or go home
        setActiveView('log');
        setCocktailQuery(created.name || '');
        setSelectedCocktailId(created.id || null);
        if (created.image_url) setPhotoUri(created.image_url);

        setModalMessage('Recipe created successfully');
        setModalActions('post-or-home');
        setModalVisible(true);

        // Increment recent recipe count for Home tip
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('recent_recipe_count');
                const n = raw ? parseInt(raw) : 0;
                await AsyncStorage.setItem('recent_recipe_count', String(n + 1));
            } catch { }
        })();
    };

    const handleModalConfirm = () => {
        setModalVisible(false);
        if (modalActions === 'post-or-home') {
            // Keep user on Add screen with log view prefilled
            setModalActions('default');
            return;
        }
        // Default action: navigate to Home (used after drink post)
        navigation.navigate('Home' as never);
    };

    const canSubmit = !!selectedCocktailId && rating > 0 && caption.trim().length > 0;

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
                <Box className="mb-4 bg-white rounded-2xl p-1">
                    <ToggleSwitch
                        value={activeView === 'log' ? 'left' : 'right'}
                        onChange={(val: 'left' | 'right') => setActiveView(val === 'left' ? 'log' : 'recipe')}
                        leftLabel="Existing Cocktail"
                        rightLabel="Create Recipe"
                    />
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
                        {modalActions === 'post-or-home' ? (
                            <>
                                <Text className="text-neutral-600 mb-6 text-center">
                                    Post it now or go Home?
                                </Text>
                                <Box className="flex-row gap-3">
                                    <Pressable className="flex-1 rounded-xl" style={{ backgroundColor: colors.primary[500], paddingVertical: 12 }} onPress={handleModalConfirm}>
                                        <Text className="text-white text-center">Post It</Text>
                                    </Pressable>
                                    <Pressable className="flex-1 rounded-xl" style={{ borderWidth: 1, borderColor: colors.primary[500], paddingVertical: 12, backgroundColor: '#fff' }} onPress={() => { setModalVisible(false); navigation.navigate('Home' as never); }}>
                                        <Text className="text-center" style={{ color: colors.primary[500] }}>Go Home</Text>
                                    </Pressable>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Text className="text-neutral-600 mb-6 text-center">
                                    Your drink has been posted.
                                </Text>
                                <PrimaryButton title="OK" onPress={handleModalConfirm} />
                            </>
                        )}
                    </Box>
                </View>
            </Modal>
        </Box>
    );
};

