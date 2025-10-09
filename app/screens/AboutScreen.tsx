import { View, Text, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-white px-6 py-6 justify-start"
    >
      {/* Overview Section */}
      <Text className="text-4xl font-bold text-purple-700 mb-4 text-center">
        Overview
      </Text>
      <Text className="text-lg text-gray-700 mb-6 text-center">
        Cocktail Companion is a SaaS web application that helps cocktail lovers log, rate, and explore drinks. 
        Users can discover cocktails they can make with ingredients at home, add their own recipes, and plan parties with smart recommendations.
      </Text>

      {/* Key Features Section */}
      <Text className="text-4xl font-bold text-purple-700 mb-4 text-center">
        Key Features
      </Text>
      <View className="space-y-3">
        <Text className="text-lg text-gray-700">• Log and rate cocktails you’ve tried</Text>
        <Text className="text-lg text-gray-700">• Find cocktails based on ingredients you have</Text>
        <Text className="text-lg text-gray-700">• Create and share your own recipes</Text>
        <Text className="text-lg text-gray-700">• Estimate bottle quantities for parties</Text>
        <Text className="text-lg text-gray-700">• Get bartending tips, techniques, and history</Text>
      </View>
    </ScrollView>
  );
}
