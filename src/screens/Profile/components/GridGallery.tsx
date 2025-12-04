import React from 'react';
import { Image } from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Center } from '@/src/components/ui/center';
import { Pressable } from '@/src/components/ui/pressable';

export type RecentDrink = {
  id: string;
  name: string;
  subtitle: string;
  rating: number;
  time: string;
  createdAt: string;
  creatorId: string | null;
  imageUrl: string;
  type: 'log' | 'recipe';
  visibility?: 'public' | 'friends' | 'private';
  cocktailId?: string | null;
};

interface GridGalleryProps {
  items: RecentDrink[];
  onPress: (item: RecentDrink) => void;
}

export const GridGallery: React.FC<GridGalleryProps> = ({ items, onPress }) => {
  const gap = 12;

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const truncateTitle = (title: string, maxLength: number = 16): string => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  return (
    <Box>
      <Box className="flex-row flex-wrap" style={{ marginRight: -gap }}>
        {items.map((it, idx) => (
          <Pressable
            key={`${it.id}-${idx}`}
            onPress={() => onPress(it)}
            style={{ width: '33.333%', paddingRight: gap, paddingBottom: gap }}
          >
            <Box
              className="bg-white rounded-xl overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              <Box style={{ padding: 8 }}>
                {it.imageUrl ? (
                  <Image
                    source={{ uri: it.imageUrl }}
                    style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Center style={{ width: '100%', aspectRatio: 1, backgroundColor: '#e5e7eb', borderRadius: 8 }}>
                    <Text className="text-xs text-neutral-700" numberOfLines={1}>{it.name}</Text>
                  </Center>
                )}
              </Box>

              <Box style={{ height: 1, backgroundColor: '#e5e7eb' }} />

              <Box style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 10, height: 48 }}>
                <Text className="text-xs font-medium text-neutral-900">
                  {truncateTitle(it.name)}
                </Text>
                <Text className="text-[10px] text-neutral-400" style={{ marginTop: 3 }}>
                  {formatDate(it.createdAt)}
                </Text>
              </Box>
            </Box>
          </Pressable>
        ))}
      </Box>
    </Box>
  );
};
