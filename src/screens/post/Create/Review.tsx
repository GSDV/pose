import { View, Image } from 'react-native';

import GoBackHeader from '@components/GoBackHeader';



export default function Review({ pictureUri }: { pictureUri: string }) {
    return (
        <View style={{ flex: 1 }}>
            <GoBackHeader />
            <Image source={{ uri: pictureUri }} />
        </View>
    );
}