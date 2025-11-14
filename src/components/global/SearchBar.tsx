import React, { useState } from 'react';
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
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View 
            className="bg-white rounded-lg border flex-row items-center px-3 py-2" 
            style={{ 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 1 }, 
                shadowOpacity: 0.05, 
                shadowRadius: 2, 
                elevation: 1,
                borderColor: isFocused ? '#9CA3AF' : '#E5E7EB',
            }}
        >
            <Search size={20} color="#6B7280" />
            <TextInput 
                className="flex-1 ml-2 text-base"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                style={{ outlineStyle: 'none' } as any}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </View>
    );
};
