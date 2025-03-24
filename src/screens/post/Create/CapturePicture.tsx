import { useState, useRef, useEffect } from 'react';

import { View, StyleSheet, Pressable } from 'react-native';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

import { useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { SafeAreaBottom } from '@components/SafeArea';

import { COLORS } from '@util/global-client';



export default function CapturePicture() {
    const [permission, requestPermission] = useCameraPermissions();

    const [direction, setDirection] = useState<CameraType>('back');
    const [flash, setFlash] = useState<'on' | 'off'>('off');

    const cameraRef = useRef<CameraView>(null);

    const insets = useSafeAreaInsets();

    const router = useRouter();


    const takePhoto = async () => {
        if (!cameraRef.current || !permission?.granted) return;
        const options = {
            quality: 1,
            base64: false,
            exif: false,
            flash: flash
        };
        const picture = await cameraRef.current.takePictureAsync(options);
        if (picture == undefined) return;

        router.push({
            pathname: '/(tabs)/(create)/crop',
            params: { pictureUri: picture.uri }
        });
    }

    const toggleFlash = () => setFlash((prev) => (prev == 'off') ? 'on' : 'off');
    const toggleDirection = () => setDirection((prev) => (prev == 'back') ? 'front' : 'back');


    useEffect(() => {
        (async () => {
            if (!permission?.granted) await requestPermission();
        })();
    }, [permission, requestPermission]);


    return (
        <CameraView style={styles.camera} facing={direction} ref={cameraRef}>
            <Pressable style={[{ position: 'absolute', left: '5%', top: insets.top }, styles.button]} onPress={router.back}>
                <Ionicons name='chevron-back' size={25} color={COLORS.primary} />
            </Pressable>

            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View style={styles.buttonContainer}>
                    <Pressable style={styles.button} onPress={toggleFlash}>
                        <Ionicons name={flash=='on' ? 'flash' : 'flash-off'} size={25} color={COLORS.primary} />
                    </Pressable>

                    <Pressable onPress={takePhoto}>
                        <Ionicons name='ellipse-outline' size={100} style={{ color: COLORS.primary, borderRadius: 100 }} />
                    </Pressable>

                    <Pressable style={styles.button} onPress={toggleDirection}>
                        <FontAwesome6 name='arrows-rotate' size={25} color={COLORS.primary} />
                    </Pressable>
                </View>

                <SafeAreaBottom />
            </View>
        </CameraView>
    );
}



const styles = StyleSheet.create({
    camera: {
        flex: 1
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center'
    }
});