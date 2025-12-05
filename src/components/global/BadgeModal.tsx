import React from 'react';
import { Modal, Pressable, Image } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { X } from 'lucide-react-native';
import { Badge } from '@/src/api/badges';

interface BadgeModalProps {
    visible: boolean;
    badge: Badge | null;
    onClose: () => void;
}

const BADGE_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
    cocktails: {
        title: 'Cocktail Enthusiast',
        description: 'Earned by logging cocktails you\'ve tried.\n\nBronze: 5 cocktails\nSilver: 20 cocktails\nGold: 50 cocktails',
    },
    friends: {
        title: 'Social Butterfly',
        description: 'Earned by connecting with other cocktail lovers.\n\nBronze: 5 friends\nSilver: 20 friends\nGold: 50 friends',
    },
    partiesHosted: {
        title: 'Party Host',
        description: 'Earned by hosting cocktail parties and events.\n\nBronze: 5 parties hosted\nSilver: 20 parties hosted\nGold: 50 parties hosted',
    },
    partiesAttended: {
        title: 'Party Goer',
        description: 'Earned by attending cocktail parties and events.\n\nBronze: 5 parties attended\nSilver: 20 parties attended\nGold: 50 parties attended',
    },
    recipes: {
        title: 'Mixologist',
        description: 'Earned by creating your own cocktail recipes.\n\nBronze: 5 recipes created\nSilver: 20 recipes created\nGold: 50 recipes created',
    },
    streak: {
        title: 'Daily Streak',
        description: 'Earned by logging cocktails on consecutive days.\n\nBronze: 5 day streak\nSilver: 20 day streak\nGold: 50 day streak',
    },
};

export const BadgeModal: React.FC<BadgeModalProps> = ({ visible, badge, onClose }) => {
    if (!badge) return null;

    const badgeInfo = BADGE_DESCRIPTIONS[badge.type];
    const tierText = badge.tier ? badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1) : '';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/50 items-center justify-center"
                onPress={onClose}
            >
                <Pressable
                    className="bg-white rounded-3xl p-6 mx-8 max-w-md w-full"
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <Pressable
                        onPress={onClose}
                        className="absolute top-4 right-4 z-10"
                    >
                        <X size={24} color="#6b7280" />
                    </Pressable>

                    {/* Badge Image */}
                    <Box className="items-center mb-6 mt-2">
                        <Image
                            source={{ uri: badge.imageUrl }}
                            style={{ width: 120, height: 120 }}
                            resizeMode="contain"
                        />
                    </Box>

                    {/* Badge Title */}
                    <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
                        {badgeInfo.title}
                    </Text>

                    {/* Tier and Count */}
                    <Text className="text-lg text-[#00BBA7] font-semibold text-center mb-4">
                        {tierText} • {badge.count} {badge.label.toLowerCase()}
                    </Text>

                    {/* Description */}
                    <Text className="text-base text-neutral-600 text-center leading-6">
                        {badgeInfo.description}
                    </Text>

                    {/* Close Button */}
                    <Pressable
                        onPress={onClose}
                        className="bg-[#00BBA7] rounded-xl py-3 mt-6"
                    >
                        <Text className="text-white text-center font-semibold text-base">
                            Close
                        </Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
};
