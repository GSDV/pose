import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import Review from '@screens/post/Create/review/Review';



export default function Index() {
    const pictureUri = useLocalSearchParams().pictureUri as string;

    return (
        <View style={{ flex: 1 }}>
            <Review pictureUri={pictureUri} />
        </View>
    );
}