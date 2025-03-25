import { View } from 'react-native';

import Prompt from '@screens/post/Create/Prompt';

import { SafeAreaFull } from '@components/SafeArea';



export default function Index() {
    return (
        <View style={{ flex: 1 }}>
            <SafeAreaFull>
                <Prompt />
            </SafeAreaFull>
        </View>
    );
}