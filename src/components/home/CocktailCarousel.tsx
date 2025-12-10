import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Heading } from '@/src/components/global';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/theme/colors';
import { supabase } from '@/src/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTIVE_CARD_WIDTH = 220;
const PREVIEW_WIDTH = 116;
const PREVIEW_GAP = 24; // distance from active card edge to preview center

export type CarouselItem = {
  id: string;
  name: string;
  image: string; // URL string from database
  count: number; // Number of logs this month
};

/**
 * Fetch the 6 most logged cocktails within the last month
 */
async function fetchMostLoggedCocktailsThisMonth(): Promise<CarouselItem[]> {
  try {
    // Calculate the date 30 days ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const oneMonthAgoISO = oneMonthAgo.toISOString();

    // Fetch drink logs from the last month with cocktail info
    const { data: drinkLogs, error } = await supabase
      .from('DrinkLog')
      .select('cocktail_id, Cocktail(id, name, image_url)')
      .gte('created_at', oneMonthAgoISO)
      .not('cocktail_id', 'is', null);

    if (error) {
      console.error('Error fetching most logged cocktails:', error);
      return [];
    }

    // Count occurrences of each cocktail
    const cocktailCounts = new Map<string, { id: string; name: string; image: string; count: number }>();
    
    drinkLogs?.forEach((log: any) => {
      const cocktailId = log.cocktail_id;
      const cocktail = log.Cocktail;
      
      if (cocktail && cocktail.image_url) {
        if (cocktailCounts.has(cocktailId)) {
          cocktailCounts.get(cocktailId)!.count++;
        } else {
          cocktailCounts.set(cocktailId, {
            id: cocktail.id,
            name: cocktail.name || 'Unknown',
            image: cocktail.image_url,
            count: 1,
          });
        }
      }
    });

    // Sort by count and take top 6
    const sortedCocktails = Array.from(cocktailCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(({ id, name, image, count }) => ({ id, name, image, count }));

    return sortedCocktails;
  } catch (e) {
    console.error('Unexpected error fetching most logged cocktails:', e);
    return [];
  }
}

type CocktailCarouselProps = {
  onCardTap?: (cocktailId: string, cocktailName: string) => void;
};

export const CocktailCarousel: React.FC<CocktailCarouselProps> = ({ onCardTap }) => {
  const [cocktails, setCocktails] = useState<CarouselItem[]>([]);
  const cocktailsRef = useRef<CarouselItem[]>([]); // ref to avoid stale closure in panResponder
  const [isLoading, setIsLoading] = useState(true);
  const [currentCocktailIndex, setCurrentCocktailIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const dragX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  // separate gesture tracker for side preview animations (so final swipe animation doesn't distort previews)
  const gestureX = useRef(new Animated.Value(0)).current;
  // dynamic blur intensities for side previews (native only)
  const [blurIntensityLeft, setBlurIntensityLeft] = useState(8);
  const [blurIntensityRight, setBlurIntensityRight] = useState(8);
  // side preview crossfade opacities
  const sideLeftOpacity = useRef(new Animated.Value(1)).current;
  const sideRightOpacity = useRef(new Animated.Value(1)).current;
  // animated scales for pagination dots (initialized empty, updated when cocktails load)
  const dotScales = useRef<Animated.Value[]>([]);
  // auto-scroll timer
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const tapStartRef = useRef<number | null>(null);

  // Fetch cocktails on mount
  useEffect(() => {
    const loadCocktails = async () => {
      setIsLoading(true);
      const data = await fetchMostLoggedCocktailsThisMonth();
      setCocktails(data);
      cocktailsRef.current = data; // keep ref in sync
      // Initialize dot scales for the fetched cocktails
      dotScales.current = data.map((_, i) => new Animated.Value(i === 0 ? 1.15 : 0.9));
      setIsLoading(false);
    };
    loadCocktails();
  }, []);

  // Function to advance carousel automatically
  const autoAdvanceCarousel = () => {
    if (cocktailsRef.current.length === 0) return;
    const newIndex = (currentIndexRef.current + 1) % cocktailsRef.current.length;

    Animated.parallel([
      Animated.timing(dragX, {
        toValue: -Dimensions.get('window').width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentCocktailIndex(newIndex);

      // crossfade side previews
      sideLeftOpacity.setValue(0);
      sideRightOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(sideLeftOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(sideRightOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();

      // animate dot scales
      dotScales.current.forEach((val, idx) => {
        Animated.spring(val, {
          toValue: idx === newIndex ? 1.15 : 0.9,
          useNativeDriver: true,
          friction: 6,
          tension: 90,
        }).start();
      });

      dragX.setValue(Dimensions.get('window').width);
      cardOpacity.setValue(0);
      gestureX.setValue(0);
      Animated.parallel([
        Animated.timing(dragX, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Reset auto-scroll timer
  const resetAutoScrollTimer = () => {
    if (cocktailsRef.current.length === 0) return;
    lastInteractionRef.current = Date.now();
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }
    autoScrollTimerRef.current = setTimeout(() => {
      autoAdvanceCarousel();
    }, 5000);
  };

  // Set up auto-scroll effect
  useEffect(() => {
    if (cocktails.length > 0) {
      resetAutoScrollTimer();
    }

    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, [currentCocktailIndex, cocktails.length]);

  // PanResponder for swipe gestures
  const swipeThreshold = 80; // px drag required to trigger swipe
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // for tap detection
        tapStartRef.current = Date.now();
        // Reset auto-scroll timer on user interaction
        resetAutoScrollTimer();
      },
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        dragX.setValue(gesture.dx);
        gestureX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        const { dx } = gesture;
        // Detect quick tap with minimal movement to trigger callback
        const tapDuration = Date.now() - (tapStartRef.current || Date.now());
        if (Math.abs(dx) < 6 && tapDuration < 200) {
          if (cocktailsRef.current.length === 0) return;
          const active = cocktailsRef.current[currentIndexRef.current];
          if (active && onCardTap) {
            onCardTap(active.id, active.name);
          }
          return;
        }
        if (Math.abs(dx) < swipeThreshold) {
          Animated.parallel([
            Animated.spring(dragX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(gestureX, { toValue: 0, useNativeDriver: true }),
          ])?.start();
          return;
        }
        const direction = dx < 0 ? -1 : 1;
        Animated.parallel([
          Animated.timing(dragX, {
            toValue: direction * Dimensions.get('window').width,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          let newIndex = 0;
          setCurrentCocktailIndex((prev) => {
            newIndex = direction === -1 ? (prev + 1) % cocktailsRef.current.length : (prev - 1 + cocktailsRef.current.length) % cocktailsRef.current.length;
            return newIndex;
          });
          // crossfade side previews
          sideLeftOpacity.setValue(0);
          sideRightOpacity.setValue(0);
          Animated.parallel([
            Animated.timing(sideLeftOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
            Animated.timing(sideRightOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
          ]).start();
          // animate dot scales
          dotScales.current.forEach((val: Animated.Value, idx: number) => {
            Animated.spring(val, {
              toValue: idx === newIndex ? 1.15 : 0.9,
              useNativeDriver: true,
              friction: 6,
              tension: 90,
            }).start();
          });
          // light haptic feedback on successful swipe (native only)
          try { if (Platform.OS !== 'web') Haptics.selectionAsync(); } catch { }
          dragX.setValue(-direction * Dimensions.get('window').width);
          cardOpacity.setValue(0);
          gestureX.setValue(0); // reset gesture preview influence immediately
          Animated.parallel([
            Animated.timing(dragX, {
              toValue: 0,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        });
      },
    })
  ).current;

  // keep ref in sync so gesture callbacks always read the latest index
  useEffect(() => {
    currentIndexRef.current = currentCocktailIndex;
  }, [currentCocktailIndex]);

  // Animated derived opacity for subtle drag blur/glow effects
  const dragBlurOpacity = gestureX.interpolate({
    inputRange: [-200, -80, 0, 80, 200],
    outputRange: [0.18, 0.1, 0, 0.1, 0.18],
    extrapolate: 'clamp',
  });
  const sideOverlayOpacityLeft = gestureX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [0.08, 0.05, 0.03],
    extrapolate: 'clamp',
  });
  const sideOverlayOpacityRight = gestureX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [0.03, 0.05, 0.08],
    extrapolate: 'clamp',
  });

  // update blur intensities live based on drag distance (native only)
  useEffect(() => {
    const id = gestureX.addListener(({ value }) => {
      const normalized = Math.min(1, Math.abs(value) / 220); // 0..1
      const dynamic = 14 * normalized; // up to +14 intensity
      setBlurIntensityLeft(8 + dynamic);
      setBlurIntensityRight(8 + dynamic);
    });
    return () => gestureX.removeListener(id);
  }, [gestureX]);

  // Show loading state
  if (isLoading) {
    return (
      <Box className="mb-8">
        <Heading level="h3" className="mb-5">Popular right now</Heading>
        <Box className="h-80 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="mt-4 text-neutral-500">Loading...</Text>
        </Box>
      </Box>
    );
  }

  // Show message if no cocktails found
  if (cocktails.length === 0) {
    return (
      <Box className="mb-8">
        <Heading level="h3" className="mb-5">Popular right now</Heading>
        <Box className="h-80 items-center justify-center">
          <Text className="text-neutral-500">No popular cocktails this week</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="mb-8">
      <Heading level="h3" className="mb-5">Popular right now</Heading>
      <Box className="h-80 items-center justify-center" style={{ overflow: 'visible' }}>
        <View style={{ width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
          {/* Side previews */}
          <Animated.View style={{
            position: 'absolute',
            zIndex: 1,
            transform: [
              {
                translateX: Animated.add(
                  gestureX.interpolate({ inputRange: [-200, 0, 200], outputRange: [-6, 0, 6], extrapolate: 'clamp' }),
                  new Animated.Value(-(ACTIVE_CARD_WIDTH / 2 + PREVIEW_GAP))
                )
              },
              { scale: gestureX.interpolate({ inputRange: [-200, 0, 200], outputRange: [0.9, 0.92, 0.94], extrapolate: 'clamp' }) },
            ],
            opacity: Animated.multiply(
              sideLeftOpacity,
              gestureX.interpolate({ inputRange: [-200, 0, 200], outputRange: [0.55, 0.6, 0.7], extrapolate: 'clamp' })
            ),
          }} pointerEvents="none">
            <View style={{
              width: PREVIEW_WIDTH,
              height: 200,
              borderRadius: 26,
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.55)',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 8,
            }}>
              <Image
                source={{ uri: cocktails[(currentCocktailIndex - 1 + cocktails.length) % cocktails.length]?.image }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 26 }}
              />
              {Platform.OS !== 'web' && (
                <BlurView
                  intensity={blurIntensityLeft}
                  tint="light"
                  style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
              )}
              {/* Soft vignette mask */}
              <Animated.View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: '#fff',
                opacity: sideOverlayOpacityLeft,
              }} />
            </View>
          </Animated.View>
          <Animated.View style={{
            position: 'absolute',
            zIndex: 1,
            transform: [
              {
                translateX: Animated.add(
                  gestureX.interpolate({ inputRange: [-200, 0, 200], outputRange: [-6, 0, 6], extrapolate: 'clamp' }),
                  new Animated.Value(ACTIVE_CARD_WIDTH / 2 + PREVIEW_GAP)
                )
              },
              { scale: gestureX.interpolate({ inputRange: [-200, 0, 200], outputRange: [0.94, 0.92, 0.9], extrapolate: 'clamp' }) },
            ],
            opacity: Animated.multiply(
              sideRightOpacity,
              gestureX.interpolate({ inputRange: [-200, 0, 200], outputRange: [0.7, 0.6, 0.55], extrapolate: 'clamp' })
            ),
          }} pointerEvents="none">
            <View style={{
              width: PREVIEW_WIDTH,
              height: 200,
              borderRadius: 26,
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.55)',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 8,
            }}>
              <Image
                source={{ uri: cocktails[(currentCocktailIndex + 1) % cocktails.length]?.image }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 26 }}
              />
              {Platform.OS !== 'web' && (
                <BlurView
                  intensity={blurIntensityRight}
                  tint="light"
                  style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                />
              )}
              {/* Soft vignette mask */}
              <Animated.View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: '#fff',
                opacity: sideOverlayOpacityRight,
              }} />
            </View>
          </Animated.View>
          {/* Active card */}
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              width: 220,
              height: 320,
              borderRadius: 28,
              backgroundColor: '#ffffff',
              shadowColor: '#009689',
              shadowOpacity: 0.28,
              shadowOffset: { width: 0, height: 14 },
              shadowRadius: 22,
              elevation: 12,
              borderWidth: 1.5,
              borderColor: 'rgba(0,150,137,0.25)',
              padding: 12,
              paddingBottom: 16,
              justifyContent: 'space-between',
              alignItems: 'center',
              overflow: 'hidden',
              transform: [
                { translateX: dragX },
                {
                  translateY: gestureX.interpolate({
                    inputRange: [-200, 0, 200],
                    outputRange: [2, 0, 2],
                    extrapolate: 'clamp',
                  }),
                },
                {
                  scale: gestureX.interpolate({
                    inputRange: [-200, 0, 200],
                    outputRange: [0.985, 1, 0.985],
                    extrapolate: 'clamp',
                  }),
                },
              ],
              opacity: cardOpacity,
              zIndex: 2,
            }}
          >
            <Animated.View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.primary[100],
              opacity: dragBlurOpacity,
            }} />
            {/* Image container with proper border radius */}
            <View style={{
              width: '100%',
              height: '82%',
              borderRadius: 18,
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
            }}>
              <Image
                source={{ uri: cocktails[currentCocktailIndex]?.image }}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
              />
              {/* Log count badge - bottom left */}
              <View style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 6,
                elevation: 4,
              }}>
                <Text style={{ fontSize: 13, marginRight: 4 }}>🔥</Text>
                <Text style={{ color: colors.primary[600], fontSize: 13, fontWeight: '700' }}>
                  {cocktails[currentCocktailIndex]?.count || 0}
                </Text>
              </View>
            </View>
            <Text className="text-lg font-semibold text-neutral-800 text-center" numberOfLines={1}>
              {cocktails[currentCocktailIndex]?.name}
            </Text>
          </Animated.View>
        </View>
        {/* Pagination dots below card */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          {cocktails.map((c, idx) => (
            <Animated.View
              key={c.id}
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                marginHorizontal: 5,
                backgroundColor: idx === currentCocktailIndex ? colors.primary[500] : '#d1d5db',
                opacity: idx === currentCocktailIndex ? 1 : 0.55,
                borderWidth: idx === currentCocktailIndex ? 2 : 0,
                borderColor: idx === currentCocktailIndex ? 'rgba(0,150,137,0.3)' : 'transparent',
                transform: [{ scale: dotScales.current[idx] || 1 }],
              }}
            />
          ))}
        </View>
      </Box>
    </Box>
  );
};
