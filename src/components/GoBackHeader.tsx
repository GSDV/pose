import { TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { SafeAreaTop } from '@components/SafeArea';

import { COLORS } from '@util/global-client';



export default function GoBackHeader() {
    const router = useRouter();

    return (
        <View>
            <SafeAreaTop />
            <TouchableOpacity style={{ paddingLeft: 5, width: 50 }} onPress={router.back}>
                <Ionicons name='chevron-back' size={25} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
}