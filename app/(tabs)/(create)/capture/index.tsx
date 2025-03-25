import { useCallback, useState } from 'react';

import { useRouter } from 'expo-router';

import CapturePicture from '@screens/post/Create/CapturePicture';
import CropPicture from '@screens/post/Create/CropImage';



export default function Index() {
    const router = useRouter();

    const [pictureUri, setPictureUri] = useState<string>('');


    const setUri = useCallback((uri: string) => {
        setPictureUri(uri);
    }, []);

    const onCropComplete = useCallback((uri: string) => {
        router.push({
            pathname: '/(tabs)/(create)/review',
            params: { pictureUri: uri }
        });
    }, []);


    return ((pictureUri == '') ?
            <CapturePicture setUri={setUri} />
        :
            <CropPicture imageUri={pictureUri} setUri={setUri} onCropComplete={onCropComplete} />
    );
}