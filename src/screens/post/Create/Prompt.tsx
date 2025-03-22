
import { View, Text, StyleSheet, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import Entypo from '@expo/vector-icons/Entypo';

import { COLORS, FONT_SIZES } from '@util/global-client';



export default function PromptCreate() {
    const router = useRouter();

    const goToCapture = () => {
        router.push('/(tabs)/(create)/capture');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Capture Your Fit</Text>
            <Pressable onPress={goToCapture} style={styles.cameraIcon}>
                <Entypo name='camera' size={100} color={COLORS.background} />
            </Pressable>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        alignItems: 'center',
        gap: 20
    },
    text: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '600',
        color: COLORS.primary,
        textAlign: 'center'
    },
    cameraIcon: {
        width: '50%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: COLORS.secondary
    }
});