import { View, Text } from 'react-native';

import { COLORS } from '@util/global-client';



export default function Index() {
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Text>Account Screen</Text>
        </View>
    );
}