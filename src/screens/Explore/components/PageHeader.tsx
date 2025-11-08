import React from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { HStack } from '@/src/components/ui/hstack';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface PageHeaderProps {
    title: string;
}

export const PageHeader = ({ title }: PageHeaderProps) => {
    const navigation = useNavigation();

    return (
        <Box className="bg-white p-4 shadow-sm">
            <HStack className="items-center">
                <Pressable
                    onPress={() => navigation.goBack()}
                    className="mr-3"
                >
                    <ChevronLeft size={24} color="#000" />
                </Pressable>
                <Text className="text-xl font-semibold">{title}</Text>
            </HStack>
        </Box>
    );
};