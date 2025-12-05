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
  const gap = 6;

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
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
              {it.imageUrl ? (
                <Image
                  source={{ uri: it.imageUrl }}
                  style={{ width: '100%', aspectRatio: 1, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <Center style={{ width: '100%', aspectRatio: 1, backgroundColor: '#e5e7eb', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                  <Text className="text-xs text-neutral-700" numberOfLines={1}>{it.name}</Text>
                </Center>
              )}

              <Box style={{ height: 1, backgroundColor: '#e5e7eb' }} />

              <Box style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 6 }}>
                <Text
                  className="text-xs font-medium text-neutral-900"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  isTruncated
                  style={{ flexShrink: 1, height: 18 }}
                >
                  {it.name}
                </Text>
                <Text className="text-[10px] text-neutral-400" style={{ marginTop: 2, height: 14 }} numberOfLines={1}>
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
