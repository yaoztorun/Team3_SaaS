import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { TextInputField } from './TextInputField';
import { Trash2 } from 'lucide-react-native';

interface IngredientInputProps {
    ingredient: {
        id: string;
        name: string;
        amount: string;
        unit: string;
    };
    maxNameLength: number;
    onNameChange: (name: string) => void;
    onAmountChange: (amount: string) => void;
    onUnitPress: () => void;
    onRemove: () => void;
    onNameFocus: () => void;
    showSuggestions: boolean;
    suggestions: string[];
    onSuggestionSelect: (suggestion: string) => void;
    onCloseSuggestions: () => void;
    isCustomIngredient: boolean;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({
    ingredient,
    maxNameLength,
    onNameChange,
    onAmountChange,
    onUnitPress,
    onRemove,
    onNameFocus,
    showSuggestions,
    suggestions,
    onSuggestionSelect,
    onCloseSuggestions,
    isCustomIngredient,
}) => {
    return (
        <Box className="mb-3 flex-row">
            {/* Ingredient Fields */}
            <Box className="flex-1 bg-gray-50 p-3 rounded-lg mr-2">
                {/* Ingredient Name */}
                <Box className="mb-2">
                    <TextInputField
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChangeText={(t) => {
                            if (t.length <= maxNameLength) {
                                onNameChange(t);
                            }
                        }}
                        onFocus={onNameFocus}
                    />
                    {isCustomIngredient && ingredient.name && !showSuggestions && (
                        <Text className="text-xs text-teal-600 mt-1">
                            ✨ Nice! That's a custom ingredient – getting creative!
                        </Text>
                    )}
                    {ingredient.name.length >= maxNameLength - 5 && (
                        <Text className="text-xs text-orange-500 mt-1">
                            🍹 Whoa there, chef! Keep it snappy – {maxNameLength - ingredient.name.length} chars left!
                        </Text>
                    )}
                    {showSuggestions && (
                        <Box className="bg-white border border-gray-200 rounded-lg mt-1 overflow-hidden">
                            {suggestions.length > 0 && (
                                <>
                                    <Box className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                                        <Text className="text-xs text-neutral-600 font-medium">
                                            💡 Popular ingredients (tap to select or keep typing)
                                        </Text>
                                    </Box>
                                    {suggestions.map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            className="px-3 py-2.5 border-b border-gray-100 flex-row items-center"
                                            onPress={() => onSuggestionSelect(s)}
                                        >
                                            <Text className="text-neutral-700 text-base">✓ {s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}
                            {ingredient.name && (
                                <TouchableOpacity
                                    className="px-3 py-2.5 bg-teal-50 border-t border-teal-200"
                                    onPress={onCloseSuggestions}
                                >
                                    <Text className="text-sm text-teal-700 font-medium">
                                        ✏️ Use "{ingredient.name}" as custom ingredient
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Amount and Unit Row */}
                <Box className="flex-row items-center space-x-2">
                    <Box className="flex-1">
                        <TextInputField
                            placeholder="Amount"
                            value={ingredient.amount}
                            onChangeText={onAmountChange}
                            keyboardType="numeric"
                        />
                    </Box>

                    <Box className="flex-1">
                        <TouchableOpacity
                            className="bg-white rounded-lg border border-gray-300 p-3"
                            onPress={onUnitPress}
                        >
                            <Text className="text-base text-neutral-900">{ingredient.unit}</Text>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Box>

            {/* Delete Button */}
            <TouchableOpacity
                onPress={onRemove}
                className="bg-red-100 rounded-lg items-center justify-center"
                style={{ width: 48 }}
            >
                <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
        </Box>
    );
};
