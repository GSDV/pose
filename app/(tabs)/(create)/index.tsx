import { View } from 'react-native';

import Prompt from '@screens/post/Create/Prompt';

import { SafeAreaFull } from '@components/SafeArea';

import { COLORS } from '@util/global-client';



export default function Index() {
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <SafeAreaFull>
                <Prompt />
            </SafeAreaFull>
        </View>
    );
}