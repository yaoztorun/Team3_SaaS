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
    showPassword?: boolean;
    onTogglePassword?: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    onSubmitEditing,
    showPassword: externalShowPassword,
    onTogglePassword,
}) => {
    const [internalShowPassword, setInternalShowPassword] = useState(false);
    
    // Use external state if provided, otherwise use internal state
    const showPassword = externalShowPassword !== undefined ? externalShowPassword : internalShowPassword;
    const togglePassword = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword));

    return (
        <TextInputField
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            onSubmitEditing={onSubmitEditing}
            style={{ fontSize: 16 }}
            icon={
                <Pressable onPress={togglePassword}>
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
