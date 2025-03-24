import { Stack } from 'expo-router';

import { defaultScreenOptions } from '@util/global-client';



export default function FeedStack() {
    return (
        <Stack>
            <Stack.Screen name='index' options={defaultScreenOptions} />
        </Stack>
    );
}