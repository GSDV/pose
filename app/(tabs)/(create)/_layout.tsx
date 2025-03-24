import { Stack } from 'expo-router';

import { defaultScreenOptions } from '@util/global-client';



export default function CreateStack() {
    return (
        <Stack>
            <Stack.Screen name='index' options={defaultScreenOptions} />
            <Stack.Screen name='capture/index' options={{ headerShown: false }} />
            <Stack.Screen name='crop/index' options={{ headerShown: false }} />
            <Stack.Screen name='review/index' options={defaultScreenOptions} />
        </Stack>
    );
}