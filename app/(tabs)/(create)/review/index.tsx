import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import Review from '@screens/post/Create/Review';

import { SafeAreaFull } from '@components/SafeArea';



export default function Index() {
    const pictureUri = useLocalSearchParams().pictureUri as string;

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaFull>
                <Review pictureUri={pictureUri} />
            </SafeAreaFull>
        </View>
    );
}