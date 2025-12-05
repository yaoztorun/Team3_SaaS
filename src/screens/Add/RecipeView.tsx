import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Image as RNImage } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import {
    PrimaryButton,
    TextInputField,
    ImageUploadBox,
    DifficultySelector,
    IngredientInput,
    UnitSelectorModal,
} from '@/src/components/global';
import { supabase } from '@/src/lib/supabase';
import uploadImageUri from '@/src/utils/storage';
import { fetchIngredientUsage } from '@/src/api/cocktail';
import { ANALYTICS_EVENTS, posthogCapture } from '@/src/analytics';

interface RecipeViewProps {
    handleCameraPress: () => void;
    handleGalleryPress: () => void;
    photoUri: string | null;
    selectedDifficulty: 'Easy' | 'Medium' | 'Hard';
    setSelectedDifficulty: (v: 'Easy' | 'Medium' | 'Hard') => void;
    onRecipeCreated: (created: { id: string; name: string; image_url: string | null }) => void;
    hasInteracted: boolean;
    setHasInteracted: (v: boolean) => void;
}

const RecipeView: React.FC<RecipeViewProps> = ({
    handleCameraPress,
    handleGalleryPress,
    photoUri,
    selectedDifficulty,
    setSelectedDifficulty,
    onRecipeCreated,
    hasInteracted,
    setHasInteracted,
}) => {
    // Ingredient row shape
    type Ingredient = { id: string; name: string; amount: string; unit: string };
    type InstructionStep = { id: string; text: string };

    const MAX_STEPS = 20;
    const MAX_INGREDIENT_NAME_LENGTH = 25;

    const UNITS = ['ml', 'oz', 'tsp', 'tbsp', 'dash', 'slice', 'piece', 'to taste'];

    // Mark form as interacted when user starts filling fields
    const handleFieldInteraction = () => {
        if (!hasInteracted) {
            setHasInteracted(true);
        }
    };

    // Ingredient suggestions loaded from database
    const [ingredientSuggestions, setIngredientSuggestions] = useState<string[]>([]);
    const [unitModalVisible, setUnitModalVisible] = useState<string | null>(null);
    const [customIngredientIds, setCustomIngredientIds] = useState<Set<string>>(new Set());

    const [recipeName, setRecipeName] = useState('');
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [nameExists, setNameExists] = useState(false);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [instructions, setInstructions] = useState<InstructionStep[]>([]);
    const [nameQueryByIndex, setNameQueryByIndex] = useState<Record<string, string>>({});
    const [suggestionsVisibleByIndex, setSuggestionsVisibleByIndex] = useState<Record<string, boolean>>({});
    const [isUploading, setIsUploading] = useState(false);

    const addIngredient = () => {
        const newIng: Ingredient = { id: String(Date.now()), name: '', amount: '', unit: 'ml' };
        setIngredients(prev => [...prev, newIng]);
    };

    const updateIngredient = (id: string, patch: Partial<Ingredient>) => {
        setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    };

    const handleIngredientNameChange = (id: string, text: string) => {
        // Only allow letters (including accented characters) and spaces
        const sanitized = text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        updateIngredient(id, { name: sanitized });
        setNameQueryByIndex(q => ({ ...q, [id]: sanitized }));
        setSuggestionsVisibleByIndex(s => ({ ...s, [id]: true }));
    };

    const handleIngredientAmountChange = (id: string, text: string) => {
        // Only allow numbers and decimal point
        const sanitized = text.replace(/[^0-9.]/g, '');
        updateIngredient(id, { amount: sanitized });
    };

    const removeIngredient = (id: string) => {
        setIngredients(prev => prev.filter(i => i.id !== id));
        setNameQueryByIndex(q => { const copy = { ...q }; delete copy[id]; return copy; });
        setSuggestionsVisibleByIndex(s => { const copy = { ...s }; delete copy[id]; return copy; });
        setCustomIngredientIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const filteredSuggestions = (query: string) => {
        if (!query) return ingredientSuggestions.slice(0, 5);
        const q = query.toLowerCase();
        return ingredientSuggestions.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
    };

    // Load ingredient suggestions from database on mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            const data = await fetchIngredientUsage(500);
            if (!mounted) return;
            // Capitalize first letter of each ingredient name for display
            const names = data.map(item =>
                item.name.charAt(0).toUpperCase() + item.name.slice(1)
            );
            setIngredientSuggestions(names);
        })();
        return () => { mounted = false; };
    }, []);

    const addStep = () => {
        if (instructions.length >= MAX_STEPS) return;
        const newStep: InstructionStep = { id: String(Date.now()), text: '' };
        setInstructions(prev => [...prev, newStep]);
    };

    const updateStep = (id: string, text: string) => {
        setInstructions(prev => prev.map(s => s.id === id ? { ...s, text } : s));
    };

    const removeStep = (id: string) => {
        setInstructions(prev => prev.filter(s => s.id !== id));
    };

    // Check if recipe name already exists in DB (debounced)
    useEffect(() => {
        if (!recipeName || recipeName.trim().length < 1) {
            setNameExists(false);
            return;
        }

        const checkNameAvailability = async () => {
            setIsCheckingName(true);
            try {
                const { data, error } = await supabase
                    .from('Cocktail')
                    .select('id')
                    .ilike('name', recipeName.trim())
                    .limit(1);

                if (error) {
                    console.error('Error checking recipe name:', error);
                    return;
                }

                setNameExists(data && data.length > 0);
            } catch (e) {
                console.error('Unexpected error checking name:', e);
            } finally {
                setIsCheckingName(false);
            }
        };

        const timeoutId = setTimeout(checkNameAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [recipeName]);

    // Validation logic
    const hasValidIngredients = ingredients.length > 0 && ingredients.every(ing =>
        ing.name.trim() && ing.amount.trim()
    );
    const hasValidInstructions = instructions.length > 0 && instructions.every(step =>
        step.text.trim()
    );
    const canSubmit =
        recipeName.trim().length >= 2 &&
        !nameExists &&
        !isCheckingName &&
        photoUri &&
        selectedDifficulty &&
        hasValidIngredients &&
        hasValidInstructions;

    const handleCreateRecipe = async () => {
        try {
            setIsUploading(true);

            // Get authenticated user
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();

            if (userErr || !user) {
                console.error('Error fetching user', userErr);
                alert('Authentication error. Please sign in and try again.');
                setIsUploading(false);
                return;
            }

            // Final server-side check for duplicate name
            const { data: existingRecipe, error: checkError } = await supabase
                .from('Cocktail')
                .select('id')
                .ilike('name', recipeName.trim())
                .limit(1);

            if (checkError) {
                console.error('Error checking recipe name:', checkError);
                alert('Error validating recipe name. Please try again.');
                setIsUploading(false);
                return;
            }

            if (existingRecipe && existingRecipe.length > 0) {
                alert('A recipe with this name already exists. Please choose a different name.');
                setNameExists(true);
                setIsUploading(false);
                return;
            }

            // Upload photo to storage
            let uploadedUrl: string | null = null;
            if (photoUri) {
                uploadedUrl = await uploadImageUri(photoUri, user.id);
                console.log('Uploaded recipe image URL:', uploadedUrl);
            }

            // Format ingredients as JSONB array matching DB schema
            const formattedIngredients = ingredients.map(ing => ({
                name: ing.name.trim(),
                amount: parseFloat(ing.amount.trim()) || 0,
                unit: ing.unit,
            }));

            // Format instructions as JSONB array matching DB schema
            const formattedInstructions = instructions.map((step, index) => ({
                step: index + 1,
                description: step.text.trim(),
            }));

            // Insert new cocktail recipe
            const { data: insertData, error: insertError } = await supabase
                .from('Cocktail')
                .insert([
                    {
                        name: recipeName.trim(),
                        creator_id: user.id,
                        origin_type: 'user',
                        is_public: false,
                        difficulty: selectedDifficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
                        image_url: uploadedUrl,
                        ingredients: formattedIngredients as any,
                        instructions: formattedInstructions as any,
                        created_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (insertError) {
                console.error('Insert error', insertError);
                alert('Failed to create recipe. Please try again.');
                return;
            }

            // Success - notify parent with created recipe info
            if (insertData) {
                // Track recipe creation
                posthogCapture(ANALYTICS_EVENTS.FEATURE_USED, {
                    feature: 'recipe_created',
                    difficulty: selectedDifficulty.toLowerCase(),
                    ingredient_count: ingredients.length,
                    instruction_count: instructions.length,
                    has_photo: !!uploadedUrl,
                });
                
                onRecipeCreated({ id: insertData.id, name: insertData.name, image_url: insertData.image_url });
            } else {
                onRecipeCreated({ id: '', name: recipeName.trim(), image_url: uploadedUrl });
            }

            // Clear all form fields
            setRecipeName('');
            setIngredients([]);
            setInstructions([]);
            setNameQueryByIndex({});
            setSuggestionsVisibleByIndex({});
            setNameExists(false);
            setIsCheckingName(false);

        } catch (error) {
            console.error('Unexpected error creating recipe:', error);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box className="flex-1 space-y-6">
            {/* Recipe Name */}
            <Box className="space-y-2">
                <TextInputField
                    label="Recipe Name"
                    required
                    placeholder="Name your cocktail recipe"
                    value={recipeName}
                    onChangeText={(text) => {
                        handleFieldInteraction();
                        setRecipeName(text);
                    }}
                />
                {isCheckingName && (
                    <Text className="text-sm text-neutral-400">Checking availability...</Text>
                )}
                {!isCheckingName && nameExists && (
                    <Text className="text-sm text-red-500">A recipe with this name already exists. Please choose a different name.</Text>
                )}
                {!isCheckingName && recipeName.trim().length >= 2 && !nameExists && (
                    <Text className="text-sm text-green-600">✓ Name available</Text>
                )}
            </Box>

            {/* Recipe Photo */}
            <Box className="space-y-2">
                <Text className="text-sm text-neutral-950">Photo</Text>
                <ImageUploadBox
                    onCameraPress={handleCameraPress}
                    onGalleryPress={handleGalleryPress}
                    imageUri={photoUri}
                />
            </Box>

            {/* Ingredients */}
            <Box className="space-y-2">
                <Text className="text-sm text-neutral-950">Ingredients *</Text>
                <Box className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    {ingredients.length === 0 && (
                        <Box className="px-2 py-4">
                            <Text className="text-neutral-500">No ingredients yet. Add one below.</Text>
                        </Box>
                    )}

                    {ingredients.map((ing) => (
                        <IngredientInput
                            key={ing.id}
                            ingredient={ing}
                            maxNameLength={MAX_INGREDIENT_NAME_LENGTH}
                            onNameChange={(name) => handleIngredientNameChange(ing.id, name)}
                            onAmountChange={(amount) => handleIngredientAmountChange(ing.id, amount)}
                            onUnitPress={() => setUnitModalVisible(ing.id)}
                            onRemove={() => removeIngredient(ing.id)}
                            onNameFocus={() => setSuggestionsVisibleByIndex(s => ({ ...s, [ing.id]: true }))}
                            showSuggestions={!!suggestionsVisibleByIndex[ing.id]}
                            suggestions={filteredSuggestions(nameQueryByIndex[ing.id] || '')}
                            onSuggestionSelect={(s) => {
                                updateIngredient(ing.id, { name: s });
                                setSuggestionsVisibleByIndex(sv => ({ ...sv, [ing.id]: false }));
                                setNameQueryByIndex(q => ({ ...q, [ing.id]: s }));
                                setCustomIngredientIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(ing.id);
                                    return next;
                                });
                            }}
                            onCloseSuggestions={() => {
                                setSuggestionsVisibleByIndex(sv => ({ ...sv, [ing.id]: false }));
                                setCustomIngredientIds(prev => new Set(prev).add(ing.id));
                            }}
                            isCustomIngredient={customIngredientIds.has(ing.id)}
                        />
                    ))}

                    <TouchableOpacity
                        className="flex-row items-center justify-center py-2 mt-2"
                        onPress={addIngredient}
                    >
                        <Text className="text-primary-500">+ Add Ingredient</Text>
                    </TouchableOpacity>
                </Box>
            </Box>

            {/* Unit Selection Modal */}
            <UnitSelectorModal
                visible={unitModalVisible !== null}
                units={UNITS}
                selectedUnit={unitModalVisible ? ingredients.find(i => i.id === unitModalVisible)?.unit || null : null}
                onSelect={(unit) => {
                    if (unitModalVisible) {
                        updateIngredient(unitModalVisible, { unit });
                        setUnitModalVisible(null);
                    }
                }}
                onClose={() => setUnitModalVisible(null)}
            />

            {/* Instructions */}
            <Box className="space-y-2">
                <Text className="text-sm text-neutral-950">Instructions *</Text>
                <Box className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                    {instructions.length === 0 && (
                        <Box className="px-2 py-4">
                            <Text className="text-neutral-500">No steps yet. Add one below.</Text>
                        </Box>
                    )}

                    {instructions.map((step, index) => (
                        <Box key={step.id} className="flex-row items-start space-x-3">
                            <Text className="text-neutral-400 mt-3">{index + 1}.</Text>
                            <Box className="flex-1">
                                <TextInputField
                                    placeholder="Describe this step"
                                    multiline
                                    numberOfLines={2}
                                    value={step.text}
                                    onChangeText={(t) => updateStep(step.id, t)}
                                />
                            </Box>
                            <TouchableOpacity onPress={() => removeStep(step.id)} className="mt-3 p-2">
                                <Text className="text-red-500">✕</Text>
                            </TouchableOpacity>
                        </Box>
                    ))}

                    <TouchableOpacity
                        className="flex-row items-center justify-center py-2 mt-2"
                        onPress={addStep}
                        disabled={instructions.length >= MAX_STEPS}
                    >
                        <Text className={instructions.length >= MAX_STEPS ? "text-neutral-300" : "text-primary-500"}>
                            + Add Step {instructions.length >= MAX_STEPS && `(max ${MAX_STEPS})`}
                        </Text>
                    </TouchableOpacity>
                </Box>
            </Box>

            {/* Difficulty */}
            <Box className="space-y-2">
                <Text className="text-sm text-neutral-950">Difficulty *</Text>
                <Box className="bg-white p-4 rounded-xl border border-gray-200">
                    <DifficultySelector
                        selected={selectedDifficulty}
                        onChange={setSelectedDifficulty}
                    />
                </Box>
            </Box>

            {/* Submit Button */}
            <PrimaryButton
                title="Create Recipe"
                onPress={handleCreateRecipe}
                loading={isUploading}
                disabled={!canSubmit || isUploading}
            />
            {!canSubmit && !isUploading && hasInteracted && (
                <Text className="text-sm text-red-500 mt-2">
                    Please complete all required fields: unique name (min 2 characters), photo, difficulty, at least one ingredient with amount, and at least one instruction step.
                </Text>
            )}
        </Box>
    );
};

export default RecipeView;
