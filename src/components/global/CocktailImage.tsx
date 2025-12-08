import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export type CocktailImageProps = {
	uri: string;
};

export const CocktailImage: React.FC<CocktailImageProps> = ({ uri }) => {
	const opacity = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		opacity.setValue(0);
	}, [uri]);

	const onLoad = () => {
		Animated.timing(opacity, {
			toValue: 1,
			duration: 280,
			useNativeDriver: true,
		}).start();
	};

	return (
		<View
			style={{
				width: 180,
				height: 180,
				borderRadius: 12,
				overflow: 'hidden',
				backgroundColor: '#050816',
				alignSelf: 'center',
			}}
		>
			<Animated.Image
				source={{ uri }}
				style={{ width: '100%', height: '100%', opacity }}
				resizeMode="cover"
				onLoad={onLoad}
			/>
		</View>
	);
};
