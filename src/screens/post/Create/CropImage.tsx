import { useState, useEffect, Fragment } from 'react';

import {
    View,
    Image,
    StyleSheet,
    PanResponder,
    TouchableOpacity,
    Text,
    Alert,
    AnimatableNumericValue,
    LayoutChangeEvent,
    GestureResponderHandlers,
    StyleProp,
    ViewStyle,
    ActivityIndicator,
} from 'react-native';

import * as ImageManipulator from 'expo-image-manipulator';

import { SafeAreaTop } from '@components/SafeArea';

import { COLORS, FONT_SIZES } from '@util/global-client';



interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageDimensions {
    width: number;
    height: number;
}

interface ImageLayout extends ImageDimensions {
    x: number;
    y: number;
}


const MIN_CROP_SIZE = 150;
const MIN_ASPECT_RATIO = 2 / 5;
const MAX_ASPECT_RATIO = 1 / 1;

const OVERLAY_SHADOW = 'rgba(0, 0, 0, 0.5)';

const DAGGER_SIZE = 25;
const DAGGER_HITSLOP = 30;

type CSS_NUM = AnimatableNumericValue | `${number}%`;
const TRANSLATE = (x: CSS_NUM, y: CSS_NUM) => ([ { translateX: x }, { translateY: y } ]);



interface ImageCropperProps {
    imageUri: string;
    setUri: (uri: string) => void;
    onCropComplete: (croppedImageUri: string) => void;
}

export default function CropPicture({ imageUri, setUri, onCropComplete }: ImageCropperProps) {
    // Original image dimensions
    const [imageSize, setImageSize] = useState<ImageDimensions>({ width: 0, height: 0 });
    
    // Container dimensions and position
    const [containerLayout, setContainerLayout] = useState<ImageLayout>({ width: 0, height: 0, x: 0, y: 0 });
    
    // Actual rendered image dimensions and position within the container
    const [actualImageLayout, setActualImageLayout] = useState<ImageLayout>({ width: 0, height: 0, x: 0, y: 0 });
    
    // Crop area dimensions and position
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });

    // Loading when cropping image.
    const [loading, setLoading] = useState<boolean>(false);
    

    // Calculate the actual image layout when rendered with 'contain' mode
    const calculateActualImageLayout = () => {
        if (imageSize.width === 0 || containerLayout.width === 0) return;
        
        // Calculate the scale factor to fit the image within the container
        const scaleWidth = containerLayout.width / imageSize.width;
        const scaleHeight = containerLayout.height / imageSize.height;
        const scale = Math.min(scaleWidth, scaleHeight);
        
        // Calculate the actual rendered dimensions
        const actualWidth = imageSize.width * scale;
        const actualHeight = imageSize.height * scale;
        
        // Calculate the position to center the image within the container
        const x = (containerLayout.width - actualWidth) / 2;
        const y = (containerLayout.height - actualHeight) / 2;
        
        setActualImageLayout({
            width: actualWidth,
            height: actualHeight,
            x,
            y
        });

        // Calculate the largest possible crop area that respects the aspect ratio constraints
        let cropWidth = actualWidth;
        let cropHeight = actualHeight;
        
        // Check if the current dimensions violate aspect ratio constraints
        const currentAspectRatio = cropWidth / cropHeight;
        
        if (currentAspectRatio < MIN_ASPECT_RATIO) {
            // Too tall, need to reduce height
            cropHeight = cropWidth / MIN_ASPECT_RATIO;
        } else if (currentAspectRatio > MAX_ASPECT_RATIO) {
            // Too wide, need to reduce width
            cropWidth = cropHeight * MAX_ASPECT_RATIO;
        }
        
        // Ensure minimum crop size
        cropWidth = Math.max(cropWidth, MIN_CROP_SIZE);
        cropHeight = Math.max(cropHeight, MIN_CROP_SIZE);
        
        // Center the crop area within the image
        const cropX = x + (actualWidth - cropWidth) / 2;
        const cropY = y + (actualHeight - cropHeight) / 2;
        
        setCropArea({
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
        });
    }

    // Load image dimensions
    useEffect(() => {
        if (!imageUri) return;
        
        Image.getSize(imageUri, (width, height) => {
            setImageSize({ width, height });
        });
    }, [imageUri]);

    // Recalculate actual image layout when container or image size changes
    useEffect(() => {
        calculateActualImageLayout();
    }, [containerLayout, imageSize]);


    const handleCrop = async () => {
        setLoading(true);
        try {
            // Convert crop coordinates from rendered view back to original image
            const cropX = (cropArea.x - actualImageLayout.x) / actualImageLayout.width * imageSize.width;
            const cropY = (cropArea.y - actualImageLayout.y) / actualImageLayout.height * imageSize.height;
            const cropWidth = cropArea.width / actualImageLayout.width * imageSize.width;
            const cropHeight = cropArea.height / actualImageLayout.height * imageSize.height;
            
            const manipResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [
                    {
                        crop: {
                            originX: cropX,
                            originY: cropY,
                            width: cropWidth,
                            height: cropHeight,
                        },
                    },
                ],
                { compress: 1, format: ImageManipulator.SaveFormat.PNG }
            );
            
            onCropComplete(manipResult.uri);
        } catch (error) {
            Alert.alert('Error', 'Failed to crop image.');
        }
        setLoading(false);
    };
    
    // PanResponder for moving the entire crop box
    const movePanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            const { dx, dy } = gestureState;
            setCropArea(prev => {
                let newX = prev.x + dx;
                let newY = prev.y + dy;

                // Keep within actual image bounds
                newX = Math.max(
                    actualImageLayout.x, 
                    Math.min(actualImageLayout.x + actualImageLayout.width - prev.width, newX)
                );
                newY = Math.max(
                    actualImageLayout.y, 
                    Math.min(actualImageLayout.y + actualImageLayout.height - prev.height, newY)
                );
                
                return { ...prev, x: newX, y: newY };
            });
        }
    });
    
    const createEdgePanResponder = (edge: string) => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                const { dx, dy } = gestureState;
                
                setCropArea(prev => {
                    let newX = prev.x;
                    let newY = prev.y;
                    let newWidth = prev.width;
                    let newHeight = prev.height;
                    
                    // Handle resize based on which edge is being dragged
                    if (edge === 'topLeft') {
                        newX = prev.x + dx;
                        newY = prev.y + dy;
                        newWidth = prev.width - dx;
                        newHeight = prev.height - dy;
                    } else if (edge === 'topRight') {
                        newY = prev.y + dy;
                        newWidth = prev.width + dx;
                        newHeight = prev.height - dy;
                    } else if (edge === 'bottomLeft') {
                        newX = prev.x + dx;
                        newWidth = prev.width - dx;
                        newHeight = prev.height + dy;
                    } else if (edge === 'bottomRight') {
                        newWidth = prev.width + dx;
                        newHeight = prev.height + dy;
                    } else if (edge === 'left') {
                        newX = prev.x + dx;
                        newWidth = prev.width - dx;
                    } else if (edge === 'right') {
                        newWidth = prev.width + dx;
                    } else if (edge === 'top') {
                        newY = prev.y + dy;
                        newHeight = prev.height - dy;
                    } else if (edge === 'bottom') {
                        newHeight = prev.height + dy;
                    }
                    
                    // Calculate image boundaries once
                    const imageRight = actualImageLayout.x + actualImageLayout.width;
                    const imageBottom = actualImageLayout.y + actualImageLayout.height;

                    // Bounds check
                    if (newX < actualImageLayout.x) {
                        newWidth = newWidth - (actualImageLayout.x - newX);
                        newX = actualImageLayout.x;
                    }
                    if (newY < actualImageLayout.y) {
                        newHeight = newHeight - (actualImageLayout.y - newY);
                        newY = actualImageLayout.y;
                    }
                    if (newX + newWidth > imageRight) newWidth = imageRight - newX;
                    if (newY + newHeight > imageBottom) newHeight = imageBottom - newY;

                    // Minimum size check
                    if (newWidth < MIN_CROP_SIZE) {
                        // Choose which side to adjust based on which edge was dragged
                        if (edge.includes('left')) {
                            // If dragging left edge, adjust x position
                            newX = Math.max(actualImageLayout.x, prev.x + prev.width - MIN_CROP_SIZE);
                        } else if (edge.includes('right') && newX + MIN_CROP_SIZE > imageRight) {
                            // If dragging right edge and min size doesn't fit, adjust x to make it fit
                            newX = Math.max(actualImageLayout.x, imageRight - MIN_CROP_SIZE);
                        }
                        newWidth = Math.min(MIN_CROP_SIZE, imageRight - newX);
                    }
                    
                    if (newHeight < MIN_CROP_SIZE) {
                        // Choose which side to adjust based on which edge was dragged
                        if (edge.includes('top')) {
                            // If dragging top edge, adjust y position
                            newY = Math.max(actualImageLayout.y, prev.y + prev.height - MIN_CROP_SIZE);
                        } else if (edge.includes('bottom') && newY + MIN_CROP_SIZE > imageBottom) {
                            // If dragging bottom edge and min size doesn't fit, adjust y to make it fit
                            newY = Math.max(actualImageLayout.y, imageBottom - MIN_CROP_SIZE);
                        }
                        newHeight = Math.min(MIN_CROP_SIZE, imageBottom - newY);
                    }
                    
                    // Aspect ratio limit
                    const aspectRatio = newWidth / newHeight;
                    if (aspectRatio < MIN_ASPECT_RATIO) {
                        // Adjust width or height to maintain minimum aspect ratio
                        if (edge.includes('left') || edge.includes('right')) {
                            const newTargetWidth = newHeight * MIN_ASPECT_RATIO;
                            // Make sure we don't exceed image boundaries
                            if (newX + newTargetWidth <= imageRight) {
                                newWidth = newTargetWidth;
                            } else {
                                // If we would exceed boundaries, adjust both to fit
                                newWidth = imageRight - newX;
                                newHeight = newWidth / MIN_ASPECT_RATIO;
                            }
                        } else {
                            const newTargetHeight = newWidth / MIN_ASPECT_RATIO;
                            // Make sure we don't exceed image boundaries
                            if (newY + newTargetHeight <= imageBottom) {
                                newHeight = newTargetHeight;
                            } else {
                                // If we would exceed boundaries, adjust both to fit
                                newHeight = imageBottom - newY;
                                newWidth = newHeight * MIN_ASPECT_RATIO;
                            }
                        }
                    } else if (aspectRatio > MAX_ASPECT_RATIO) {
                        if (edge.includes('left') || edge.includes('right')) {
                            const newTargetWidth = newHeight * MAX_ASPECT_RATIO;
                            if (newX + newTargetWidth <= imageRight) {
                                newWidth = newTargetWidth;
                            } else {
                                newWidth = imageRight - newX;
                                newHeight = newWidth / MAX_ASPECT_RATIO;
                            }
                        } else {
                            const newTargetHeight = newWidth / MAX_ASPECT_RATIO;
                            if (newY + newTargetHeight <= imageBottom) {
                                newHeight = newTargetHeight;
                            } else {
                                newHeight = imageBottom - newY;
                                newWidth = newHeight * MAX_ASPECT_RATIO;
                            }
                        }
                    }
                    
                    // Minimum size check
                    // this one is the one that actually enforces minimum size restriction
                    // the other previous one we have just in case
                    if (newWidth < MIN_CROP_SIZE) {
                        newWidth = Math.min(MIN_CROP_SIZE, imageRight - newX);
                        // If we still can't achieve min width, adjust position if possible
                        if (newWidth < MIN_CROP_SIZE && newX > actualImageLayout.x) {
                            const adjustment = Math.min(newX - actualImageLayout.x, MIN_CROP_SIZE - newWidth);
                            newX -= adjustment;
                            newWidth += adjustment;
                        }
                    }
                    
                    if (newHeight < MIN_CROP_SIZE) {
                        newHeight = Math.min(MIN_CROP_SIZE, imageBottom - newY);
                        // If we still can't achieve min height, adjust position if possible
                        if (newHeight < MIN_CROP_SIZE && newY > actualImageLayout.y) {
                            const adjustment = Math.min(newY - actualImageLayout.y, MIN_CROP_SIZE - newHeight);
                            newY -= adjustment;
                            newHeight += adjustment;
                        }
                    }
                    
                    return { x: newX, y: newY, width: newWidth, height: newHeight };
                });
            }
        });
    }

    // Create PanResponders for each corner and edge
    const topLeftResponder = createEdgePanResponder('topLeft');
    const topResponder = createEdgePanResponder('top');
    const topRightResponder = createEdgePanResponder('topRight');
    const rightResponder = createEdgePanResponder('right');
    const bottomRightResponder = createEdgePanResponder('bottomRight');
    const bottomResponder = createEdgePanResponder('bottom');
    const bottomLeftResponder = createEdgePanResponder('bottomLeft');
    const leftResponder = createEdgePanResponder('left');
    
    // Handle container layout changes
    const handleContainerLayout = (event: LayoutChangeEvent) => {
        const { width, height, x, y } = event.nativeEvent.layout;
        setContainerLayout({ width, height, x, y });
    }
    
    return (
        <Fragment>
            <View style={styles.container}>
                <SafeAreaTop />
                <View
                    style={[styles.imageContainer, { width: '100%', maxHeight: '70%' }]}
                    onLayout={handleContainerLayout}
                >
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    
                    {actualImageLayout.width > 0 && (
                        <View style={[styles.overlay, { width: actualImageLayout.width, height: actualImageLayout.height,   }]}>
                            {/* Semi-transparent overlay that excludes the crop area */}
                            <View style={[
                                styles.overlayRegion,
                                {
                                    top: actualImageLayout.y,
                                    left: actualImageLayout.x,
                                    width: '100%',
                                    height: (cropArea.y- actualImageLayout.y)
                                }
                            ]} />
                            <View style={[
                                styles.overlayRegion,
                                {
                                    top: cropArea.y + cropArea.height,
                                    left: actualImageLayout.x,
                                    width: '100%',
                                    height: actualImageLayout.y + actualImageLayout.height - (cropArea.y + cropArea.height)
                                }
                            ]} />
                            <View style={[
                                styles.overlayRegion,
                                {
                                    top: cropArea.y,
                                    left: actualImageLayout.x,
                                    width: cropArea.x - actualImageLayout.x,
                                    height: cropArea.height
                                }
                            ]} />
                            <View style={[
                                styles.overlayRegion,
                                {
                                    top: cropArea.y,
                                    left: cropArea.x + cropArea.width,
                                    width: actualImageLayout.x + actualImageLayout.width - (cropArea.x + cropArea.width),
                                    height: cropArea.height
                                }
                            ]} />

                            {/* Cutout for the crop area */}
                            <View
                                style={[
                                    styles.cropArea,
                                    {
                                        left: cropArea.x,
                                        top: cropArea.y,
                                        width: cropArea.width,
                                        height: cropArea.height,
                                    }
                                ]}
                            >
                                {/* Move handle (center area) */}
                                <View style={styles.moveHandle} {...movePanResponder.panHandlers} />
                                
                                {/* Corner and edge handles */}
                                <Dagger customStyle={styles.topLeft} panHandlers={topLeftResponder.panHandlers} />
                                <Dagger customStyle={[styles.top, styles.horizontalMiddleDragger]} panHandlers={topResponder.panHandlers} />
                                <Dagger customStyle={styles.topRight} panHandlers={topRightResponder.panHandlers} />
                                <Dagger customStyle={[styles.right, styles.verticalMiddleDragger]} panHandlers={rightResponder.panHandlers} />
                                <Dagger customStyle={styles.bottomRight} panHandlers={bottomRightResponder.panHandlers} />
                                <Dagger customStyle={[styles.bottom, styles.horizontalMiddleDragger]} panHandlers={bottomResponder.panHandlers} />
                                <Dagger customStyle={styles.bottomLeft} panHandlers={bottomLeftResponder.panHandlers} />
                                <Dagger customStyle={[styles.left, styles.verticalMiddleDragger]} panHandlers={leftResponder.panHandlers} />
                            </View>
                        </View>
                    )}
                </View>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => setUri('')}>
                        <Text style={styles.buttonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={handleCrop}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>

            </View>

            {loading && <LoadingScreen />}
        </Fragment>
    );
}



function Dagger({ customStyle, panHandlers }: { customStyle: StyleProp<ViewStyle>, panHandlers: GestureResponderHandlers }) {
    return <View hitSlop={DAGGER_HITSLOP} style={[styles.dragger, customStyle]} {...panHandlers} />;
}



function LoadingScreen() {
    return (
        <View style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignContent: 'center' }}>
            <ActivityIndicator size='large' color={COLORS.white} />
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    imageContainer: {
        position: 'relative',
        backgroundColor: COLORS.light_gray,
        overflow: 'hidden',
        borderRadius: 10
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
    overlayRegion: {
        position: 'absolute',
        backgroundColor: OVERLAY_SHADOW
    },
    cropArea: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: 'transparent',
    },
    dragger: {
        position: 'absolute',
        width: DAGGER_SIZE,
        height: DAGGER_SIZE,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 1,
        borderColor: '#fff',
    },
    verticalMiddleDragger: {
        width: DAGGER_SIZE - 10,
        height: DAGGER_SIZE + 40,
    },
    horizontalMiddleDragger: {
        width: DAGGER_SIZE + 40,
        height: DAGGER_SIZE - 10,
    },
    topLeft: {
        top: 0,
        left: 0,
        transform: TRANSLATE('-50%', '-50%')
    },
    topRight: {
        top: 0,
        right: 0,
        transform: TRANSLATE('50%', '-50%')
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        transform: TRANSLATE('-50%', '50%')
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        transform: TRANSLATE('50%', '50%')
    },
    top: {
        top: 0,
        right: '50%',
        transform: TRANSLATE('50%', '-50%')
    },
    right: {
        top: '50%',
        right: 0,
        transform: TRANSLATE('50%', '-50%')
    },
    bottom: {
        bottom: 0,
        left: '50%',
        transform: TRANSLATE('-50%', '50%')
    },
    left: {
        top: '50%',
        left: 0,
        transform: TRANSLATE('-50%', '-50%')
    },
    moveHandle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: 20
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        backgroundColor: COLORS.gray,
        minWidth: 120,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.m,
        fontWeight: '600',
    }
});