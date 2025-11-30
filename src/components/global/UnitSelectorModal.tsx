import React from 'react';
import { Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { X } from 'lucide-react-native';

interface UnitSelectorModalProps {
        visible: boolean;
        units: string[];
        selectedUnit: string | null;
        onSelect: (unit: string) => void;
        onClose: () => void;
}

export const UnitSelectorModal: React.FC<UnitSelectorModalProps> = ({
        visible,
        units,
        selectedUnit,
        onSelect,
        onClose,
}) => {
        return (
                <Modal
                        visible={visible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={onClose}
                >
                        <TouchableOpacity
                                activeOpacity={1}
                                onPress={onClose}
                                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                        >
                                <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={(e) => e.stopPropagation()}
                                        style={{
                                                backgroundColor: 'white',
                                                borderTopLeftRadius: 24,
                                                borderTopRightRadius: 24,
                                                maxHeight: '50%'
                                        }}
                                >
                                        <Box className="px-4 py-4 border-b border-gray-200 flex-row items-center justify-between">
                                                <Text className="text-lg font-semibold">Select Unit</Text>
                                                <TouchableOpacity onPress={onClose}>
                                                        <X size={24} color="#666" />
                                                </TouchableOpacity>
                                        </Box>
                                        <ScrollView 
                                                style={{ flex: 1 }}
                                                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
                                                showsVerticalScrollIndicator={true}
                                        >
                                                {units.map((unit) => (
                                                        <TouchableOpacity
                                                                key={unit}
                                                                className="py-4 border-b border-gray-100 flex-row items-center justify-between"
                                                                onPress={() => onSelect(unit)}
                                                        >
                                                                <Text className="text-base text-neutral-900">{unit}</Text>
                                                                {selectedUnit === unit && (
                                                                        <Box className="w-5 h-5 rounded-full bg-teal-500 items-center justify-center">
                                                                                <Text className="text-white text-xs">✓</Text>
                                                                        </Box>
                                                                )}
                                                        </TouchableOpacity>
                                                ))}
                                        </ScrollView>
                                </TouchableOpacity>
                        </TouchableOpacity>
                </Modal>
        );
};
