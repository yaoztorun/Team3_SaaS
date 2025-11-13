import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export type SetUri = (uri: string | null) => void;

const handleWebFile = (file: File | null, setPhotoUri: SetUri) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPhotoUri(url);
};

export function createCameraHandlers(setPhotoUri: SetUri) {
        const handleCameraPress = async () => {
                try {
                        if (Platform.OS === 'web') {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                // @ts-ignore capture is a valid attribute on some browsers
                                input.capture = 'environment';
                                input.onchange = () => {
                                        const file = input.files && input.files[0];
                                        handleWebFile(file || null, setPhotoUri);
                                };
                                input.click();
                                return;
                        }

                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                                alert('Camera permission is required to take photos.');
                                return;
                        }

                        const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                quality: 0.8,
                                allowsEditing: true,
                        });

                        if (!result.canceled) {
                                const uri = result.assets && result.assets[0] && result.assets[0].uri;
                                if (uri) {
                                        setPhotoUri(uri);
                                        if ((Platform as any).OS !== 'web') {
                                                const { status: mlStatus } = await MediaLibrary.requestPermissionsAsync();
                                                if (mlStatus === 'granted') {
                                                        try {
                                                                await MediaLibrary.saveToLibraryAsync(uri);
                                                        } catch (e) {
                                                                // ignore save failures
                                                        }
                                                }
                                        }
                                }
                        }
                } catch (e) {
                        console.error('Camera error', e);
                }
        };

        const handleGalleryPress = async () => {
                try {
                        if (Platform.OS === 'web') {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = () => {
                                        const file = input.files && input.files[0];
                                        handleWebFile(file || null, setPhotoUri);
                                };
                                input.click();
                                return;
                        }

                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                                alert('Media library permission is required to pick photos.');
                                return;
                        }

                        const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                quality: 0.8,
                                allowsEditing: true,
                        });

                        if (!result.canceled) {
                                const uri = result.assets && result.assets[0] && result.assets[0].uri;
                                if (uri) {
                                        setPhotoUri(uri);
                                }
                        }
                } catch (e) {
                        console.error('Gallery error', e);
                }
        };

        return { handleCameraPress, handleGalleryPress };
}
