import React, { useState } from 'react';
import { Pressable } from '@/src/components/ui/pressable';
import { Eye, EyeOff } from 'lucide-react-native';
import { TextInputField } from './TextInputField';

interface PasswordInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onSubmitEditing?: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    onSubmitEditing,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TextInputField
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            onSubmitEditing={onSubmitEditing}
            icon={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                        <EyeOff size={20} color="#717182" />
                    ) : (
                        <Eye size={20} color="#717182" />
                    )}
                </Pressable>
            }
        />
    );
};
