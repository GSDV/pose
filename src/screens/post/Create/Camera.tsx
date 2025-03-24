import { useEffect, useState, Fragment } from 'react';

import { Text } from 'react-native';

import { Camera as NativeCamera } from 'expo-camera';

import CapturePicture from './CapturePicture';



export default function RecordVideo() {
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);

    useEffect(() => {
        const getPermissions = async () => {
            const cameraPermission = await NativeCamera.requestCameraPermissionsAsync();
            const microphonePermission = await NativeCamera.requestMicrophonePermissionsAsync();

            setHasCameraPermission(cameraPermission.status === "granted");
            setHasMicrophonePermission(microphonePermission.status === "granted");
        }
        getPermissions();
    }, []);

    if (hasCameraPermission === undefined || hasMicrophonePermission === undefined) return <Text>Requesting permissions...</Text>
    else if (!hasCameraPermission) return <Text>Permission for camera not granted</Text>;

    return (
        <Fragment>
            <CapturePicture />
        </Fragment>
    );
}