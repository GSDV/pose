import { Stack } from 'expo-router';

import { COLORS } from '@util/global-client';



const contentStyle = { backgroundColor: COLORS.background };



export default function CreateStack() {
    return (
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false, contentStyle }} />
        </Stack>
    );
}