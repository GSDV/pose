import { Stack } from 'expo-router';

import { defaultScreenOptions } from '@util/global-client';



export default function CreateStack() {
    return (
        <Stack>
            <Stack.Screen name='index' options={defaultScreenOptions} />
            <Stack.Screen name='capture/index' options={defaultScreenOptions} />
        </Stack>
    );
}