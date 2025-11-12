import React from 'react';
import { TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
    value, 
    onChangeText, 
    placeholder = "Search..." 
}) => {
    return (
        <View className="bg-white rounded-lg border border-gray-200 flex-row items-center px-3 py-2">
            <Search size={20} color="#6B7280" />
            <TextInput 
                className="flex-1 ml-2 text-base"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
            />
        </View>
    );
};
