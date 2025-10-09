import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-4xl font-bold text-purple-700 text-center mb-4">
        Welcome to the Cocktail App!
      </Text>
      <Text className="text-lg text-gray-700 text-center mb-6">
        Discover amazing cocktail recipes on the go.
      </Text>
      <View className="w-full">
        <Button
          title="Learn About This App"
          color="#6B21A8"
          onPress={() => navigation.navigate('About')}
        />
      </View>
    </View>
  );
}
