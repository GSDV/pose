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

export const DOT_SIZE = 8;
export const LARGE_DOT_SIZE = 20;

interface InfoDotProps {
    dot: Dot,
    x: number,
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
            useNativeDriver: false,
        }).start();
    }, [expanded, dotSize]);

    const openModal = () => setModalVisible(true);
    const closeModal = () => {
        setModalVisible(false);
    };

    // Calculate dynamic styles based on animated value
    const dynamicStyles = {
        width: dotSize,
        height: dotSize,
        borderRadius: Animated.divide(dotSize, 2),
        // Adjust position to keep the dot centered when it grows
        transform: [
            { translateX: Animated.multiply(dotSize, -0.5) },
            { translateY: Animated.multiply(dotSize, -0.5) }
        ],
        borderWidth: dotSize.interpolate({
            inputRange: [DOT_SIZE, LARGE_DOT_SIZE],
            outputRange: [1, 2],
        }),
        zIndex: expanded ? 10 : 1, // Ensure larger dots are above smaller ones
    };

    return (
        <Fragment>
            <Animated.View
                style={[
                    styles.container,
                    { left: x, top: y, backgroundColor: dot.color },
                    dynamicStyles
                ]}
            >
                <TouchableOpacity
                    style={styles.touchableArea}
                    onPress={openModal}
                    hitSlop={10}
                />
            </Animated.View>

            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.shadowBackground}>
                    <Pressable style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={closeModal}>
                        <View style={styles.modalView}>
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
                        </View>
                    </Pressable>
                </View>
            </Modal>
        </Fragment>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        borderColor: COLORS.white,
        borderWidth: 1,
        // Note: transform properties moved to dynamic styles
    },
    touchableArea: {
        width: '100%',
        height: '100%',
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
    },
    modalInputTitle: {
        fontSize: FONT_SIZES.s,
        color: COLORS.black
    },
    modalInput: {
        borderBottomWidth: 1,
        borderColor: COLORS.black,
        fontSize: FONT_SIZES.m
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    },
    currencyDropdownContainer: {
        position: 'relative',
        marginRight: 8,
        zIndex: 2
    },
    currencyDropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.black,
        borderRadius: 4,
        minWidth: 45
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.black,
        borderRadius: 5,
        width: '100%',
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
        zIndex: 3,
        overflow: 'hidden'
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 10,
        alignItems: 'center',
        borderRadius: 5
    }
});