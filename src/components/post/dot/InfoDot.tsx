import { Fragment, useState, useEffect, useRef } from 'react';

import { 
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    Pressable,
    Image,
    Animated,
    Easing
} from 'react-native';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { Dot } from '@util/types';



export const DOT_SIZE = 10;
export const LARGE_DOT_SIZE = 25;



interface InfoDotProps {
    dot: Dot;
    x: number;
    y: number;
    expanded: boolean;
}

export default function InfoDot({ dot, x, y, expanded }: InfoDotProps) {
    const [modalVisible, setModalVisible] = useState(false);
    // Create an animated value for the size
    const dotSize = useRef(new Animated.Value(DOT_SIZE)).current;
    
    // Animate the dot size when expanded state changes
    useEffect(() => {
        Animated.timing(dotSize, {
            toValue: expanded ? LARGE_DOT_SIZE : DOT_SIZE,
            duration: 300, // Animation duration in ms
            easing: Easing.elastic(1), // Elastic effect for bouncy feel
            useNativeDriver: false // Must be false for width/height animations
        }).start();
    }, [expanded, dotSize]);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    // Calculate position based on the dot size
    const translateX = dotSize.interpolate({
        inputRange: [DOT_SIZE, LARGE_DOT_SIZE],
        outputRange: [-DOT_SIZE/2, -LARGE_DOT_SIZE/2]
    });
    
    const translateY = dotSize.interpolate({
        inputRange: [DOT_SIZE, LARGE_DOT_SIZE],
        outputRange: [-DOT_SIZE/2, -LARGE_DOT_SIZE/2]
    });

    const borderWidth = dotSize.interpolate({
        inputRange: [DOT_SIZE, LARGE_DOT_SIZE],
        outputRange: [2, 2]
    });

    const borderRadius = dotSize.interpolate({
        inputRange: [DOT_SIZE, LARGE_DOT_SIZE],
        outputRange: [DOT_SIZE/2, LARGE_DOT_SIZE/2]
    });

    return (
        <Fragment>
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [ { translateX }, { translateY } ],
                        left: x,
                        top: y,
                        zIndex: expanded ? 10 : 1
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.touchableArea}
                    onPress={openModal}
                    hitSlop={10}
                    activeOpacity={0.6}
                >
                    <Animated.View 
                        style={{
                            width: dotSize,
                            height: dotSize,
                            borderRadius,
                            borderWidth,
                            borderColor: COLORS.white,
                            backgroundColor: 'transparent',
                            overflow: 'hidden'
                        }}
                    />
                </TouchableOpacity>
            </Animated.View>

            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.shadowBackground}>
                    <Pressable style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={closeModal}>
                        <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalImageContainer}>
                                <Image
                                    source={{ uri: dot.imageUrl }}
                                    style={styles.modalImage}
                                    resizeMode='contain'
                                />
                            </View>

                            <View style={{ width: '100%', gap: 5 }}>
                                <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black, fontWeight: '600' }}>{dot.title}</Text>
                                <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black, fontWeight: '300' }}>{dot.currency}{dot.price}</Text>
                                <Text style={{ fontSize: FONT_SIZES.m, color: COLORS.black, fontWeight: '300' }}>From <Text style={{ color: COLORS.primary, textDecorationColor: COLORS.primary, textDecorationLine: 'underline' }}>{dot.brand}</Text></Text>
                            </View>
                        </Pressable>
                    </Pressable>
                </View>
            </Modal>
        </Fragment>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        overflow: 'hidden'
    },
    touchableArea: {
        width: '100%',
        height: '100%'
    },
    shadowBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalView: {
        position: 'relative',
        padding: 30,
        width: '80%',
        alignItems: 'center',
        gap: 20,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalImageContainer: {
        backgroundColor: COLORS.light_gray,
        alignItems: 'center',
        width: '100%'
    },
    modalImage: {
        width: '60%',
        aspectRatio: 1
    }
});