import React from 'react';
import { ActivityIndicator } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { HStack } from '@/src/components/ui/hstack';
import { Center } from '@/src/components/ui/center';
import { Heading } from '@/src/components/global';
import { colors } from '@/src/theme/colors';
import type { UserStats } from '@/src/api/stats';

interface ProfileStatsProps {
    userStats: UserStats | null;
    avgRatingOutOf5: string | number;
    ratingTrendCounts5: number[];
    loading?: boolean;
    title?: string;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
    userStats,
    avgRatingOutOf5,
    ratingTrendCounts5,
    loading = false,
    title = 'Your Stats',
}) => {
    const barChartColor = colors.primary[500];

    if (loading) {
        return (
            <Box className="bg-white rounded-2xl p-4 mb-4">
                <Center className="py-4">
                    <ActivityIndicator size="large" color="#00BBA7" />
                </Center>
            </Box>
        );
    }

    return (
        <>
            {/* Stats Overview */}
            <Box className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-base text-neutral-900 mb-4">
                    {title}
                </Text>
                <HStack className="justify-between">
                    <Box className="items-center">
                        <Text className="text-3xl text-teal-500 font-semibold">
                            {userStats?.drinksLogged || 0}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                            Drinks Logged
                        </Text>
                    </Box>
                    <Box className="items-center">
                        <Text className="text-3xl text-red-500 font-semibold">
                            {avgRatingOutOf5}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                            Avg Rating
                        </Text>
                    </Box>
                    <Box className="items-center">
                        <Text className="text-3xl text-blue-500 font-semibold">
                            {userStats?.barsVisited || 0}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                            Bars Visited
                        </Text>
                    </Box>
                </HStack>
            </Box>

            {/* Top Cocktails */}
            {userStats?.topCocktails && userStats.topCocktails.length > 0 && (
                <Box className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-base text-neutral-900 mb-3">
                        Top 3 Most Popular
                    </Text>
                    {userStats.topCocktails.map((cocktail, index) => (
                        <Box
                            key={index}
                            className="flex-row items-center justify-between py-3 border-b border-neutral-100 last:border-b-0"
                        >
                            <HStack className="items-center flex-1">
                                <Box className="w-8 h-8 rounded-full bg-teal-500 items-center justify-center mr-3">
                                    <Text className="text-white font-semibold">
                                        {index + 1}
                                    </Text>
                                </Box>
                                <Text className="text-sm text-neutral-900 flex-1" numberOfLines={1}>
                                    {cocktail.name}
                                </Text>
                            </HStack>
                            <Box className="bg-teal-50 px-3 py-1 rounded-full ml-2">
                                <Text className="text-sm text-teal-600 font-medium">
                                    {cocktail.count}x
                                </Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Rating Trend */}
            <Box className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-base text-neutral-900 mb-2">
                    Rating Trend
                </Text>
                {userStats?.ratingTrend && userStats.ratingTrend.some(item => item.count > 0) ? (
                    <Box className="items-center justify-center -ml-8">
                        <BarChart
                            data={{
                                labels: ['1⭐', '2⭐', '3⭐', '4⭐', '5⭐'],
                                datasets: [{
                                    data: ratingTrendCounts5.slice(1, 6),
                                }],
                            }}
                            width={360}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: () => barChartColor,
                                labelColor: () => barChartColor,
                                fillShadowGradientFrom: barChartColor,
                                fillShadowGradientFromOpacity: 1,
                                fillShadowGradientTo: barChartColor,
                                fillShadowGradientToOpacity: 1,
                                barPercentage: 0.7,
                            }}
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                                marginLeft: -40,
                            }}
                            withInnerLines={false}
                            withVerticalLabels={true}
                            withHorizontalLabels={false}
                            fromZero={true}
                            showBarTops={false}
                            showValuesOnTopOfBars={true}
                            segments={4}
                        />
                    </Box>
                ) : (
                    <Box className="h-48 items-center justify-center">
                        <Text className="text-gray-400">No rating data yet</Text>
                    </Box>
                )}
            </Box>

            {/* Cocktail Breakdown */}
            <Box className="bg-white rounded-2xl p-4">
                <Heading level="h3" className="mb-4">
                    Cocktail Breakdown
                </Heading>
                {userStats?.cocktailBreakdown && userStats.cocktailBreakdown.length > 0 ? (
                    <>
                        <Box className="items-center justify-center mb-4">
                            <PieChart
                                data={userStats.cocktailBreakdown.map(item => ({
                                    name: item.name,
                                    population: item.count,
                                    color: item.color,
                                }))}
                                width={280}
                                height={220}
                                chartConfig={{
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="60"
                                absolute
                                hasLegend={false}
                            />
                        </Box>
                        <Box>
                            {userStats.cocktailBreakdown.map((item, idx) => (
                                <HStack key={idx} className="items-center justify-between py-2">
                                    <HStack className="items-center">
                                        <Box
                                            style={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: 6,
                                                backgroundColor: item.color,
                                                marginRight: 8,
                                            }}
                                        />
                                        <Text className="text-sm text-neutral-700">{item.name}</Text>
                                    </HStack>
                                    <Text className="text-sm text-neutral-500">{item.count}</Text>
                                </HStack>
                            ))}
                        </Box>
                    </>
                ) : (
                    <Box className="h-48 items-center justify-center">
                        <Text className="text-gray-400">No cocktails logged yet</Text>
                    </Box>
                )}
            </Box>
        </>
    );
};
