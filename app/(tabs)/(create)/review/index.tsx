import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import Review from '@screens/post/Create/Review';

import GoBackHeader from '@components/GoBackHeader';



export default function Index() {
    const pictureUri = useLocalSearchParams().pictureUri as string;

    return (
        <View style={{ flex: 1 }}>
            <GoBackHeader />
            <Review pictureUri={pictureUri} />
        </View>
    );
}