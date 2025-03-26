import { Fragment, useState, useEffect } from 'react';

import { 
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    Pressable,
    Image,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Animated
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { ReviewDot } from '@util/types';



export const DOT_SIZE = 20;



const currencySymbols = ['$', '€', '£'];

interface InfoDotProps {
    dot: ReviewDot,
    x: number,
    y: number,
    removeDot: ()=>void
}

export default function ReviewInfoDot({ dot: initialDot, x, y, removeDot }: InfoDotProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [dot, setDot] = useState<ReviewDot>(initialDot);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [keyboardOffset] = useState(new Animated.Value(0));

    const openModal = () => setModalVisible(true);
    const closeModal = () => {
        setModalVisible(false);
        resetDotEdits();
    }

    const [title, setTitle] = useState<string>(dot.title);
    const [price, setPrice] = useState<string>(dot.price);
    const [currency, setCurrency] = useState<string>(dot.currency || currencySymbols[0]);
    const [imageUrl, setImageUrl] = useState<string>(dot.imageUrl);

    const toggleDropdown = () => setDropdownVisible(!dropdownVisible);
    const closeDropdown = () => setDropdownVisible(false);

    const removeImage = () => handleImageUrlChange('');

    const resetDotEdits = () => {
        setTitle(dot.title);
        setPrice(dot.price);
        setCurrency(dot.currency);
        setImageUrl(dot.imageUrl);
    }

    const handleTitleChange = (input: string) => setTitle(input);
    const handlePriceChange = (input: string) => setPrice(input);
    const handleCurrencyChange = (input: string) => {
        setCurrency(input);
        closeDropdown();
    }
    const handleImageUrlChange = (input: string) => setImageUrl(input);

    const saveProductData = () => {
        setDot((prev) => ({
            ...prev,
            imageUrl,
            title,
            price,
            currency
        }));
        setModalVisible(false);
    }

    // Set up keyboard listeners to animate the modal position
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                // Get keyboard height
                const keyboardHeight = e.endCoordinates.height;
                // Animate the modal up by half the keyboard height for better visibility
                Animated.timing(keyboardOffset, {
                    toValue: -keyboardHeight / 2,
                    duration: Platform.OS === 'ios' ? 300 : 0,
                    useNativeDriver: true
                }).start();
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                // Animate the modal back to its original position
                Animated.timing(keyboardOffset, {
                    toValue: 0,
                    duration: Platform.OS === 'ios' ? 300 : 0,
                    useNativeDriver: true
                }).start();
            }
        );

        // Clean up listeners on component unmount
        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    return (
        <Fragment>
            <TouchableOpacity
                style={[
                    styles.container,
                    { left: x, top: y, backgroundColor: dot.color  }
                ]}
                onPress={openModal}
                hitSlop={25}
            />

            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <KeyboardAvoidingView 
                    // behavior='padding'
                    style={styles.shadowBackground}
                >
                    <Pressable style={{ flex: 1, justifyContent: 'center' }} onPress={() => {
                        closeDropdown();
                        closeModal();
                    }}>
                        <Animated.View 
                            style={[
                                styles.modalView, 
                                { transform: [{ translateY: keyboardOffset }] }
                            ]}
                        >
                            <Pressable style={styles.contentContainer} onPress={Keyboard.dismiss}>
                                {imageUrl && (
                                    <View style={styles.modalImageContainer}>
                                        <Image
                                            source={{ uri: dot.imageUrl }}
                                            style={styles.modalImage}
                                            resizeMode='contain'
                                        />
                                        <Ionicons
                                            name='close-circle'
                                            size={20}
                                            style={styles.removeImage}
                                            onPress={removeImage}
                                        />
                                    </View>
                                )}

                                <View style={{ width: '100%', gap: 20 }}>
                                    <View style={{ width: '100%' }}>
                                        <Text style={styles.modalInputTitle}>Title</Text>
                                        <TextInput
                                            style={styles.modalInput}
                                            value={title}
                                            onChangeText={handleTitleChange}
                                            placeholder='Title'
                                        />
                                    </View>

                                    <View style={{ width: '100%' }}>
                                        <Text style={styles.modalInputTitle}>Price</Text>
                                        <View style={styles.priceContainer}>
                                            <View style={styles.currencyDropdownContainer}>
                                                <TouchableOpacity 
                                                    style={styles.currencyDropdownButton} 
                                                    onPress={toggleDropdown}
                                                >
                                                    <Text style={styles.currencySymbol}>{currency}</Text>
                                                    <Ionicons 
                                                        name={dropdownVisible ? 'chevron-up' : 'chevron-down'} 
                                                        size={16} 
                                                        color={COLORS.black}
                                                    />
                                                </TouchableOpacity>
                                                
                                                {dropdownVisible && (
                                                    <View style={styles.dropdownList}>
                                                        {currencySymbols.map((symbol) => (
                                                            <TouchableOpacity
                                                                key={symbol}
                                                                style={[
                                                                    styles.dropdownItem,
                                                                    symbol === currency && styles.selectedItem
                                                                ]}
                                                                onPress={() => handleCurrencyChange(symbol)}
                                                            >
                                                                <Text style={styles.currencySymbol}>{symbol}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                            
                                            <TextInput
                                                style={styles.priceInput}
                                                value={price}
                                                onChangeText={handlePriceChange}
                                                placeholder='Price'
                                                keyboardType='numeric'
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.destructive }]} onPress={removeDot}>
                                        <Text style={{ color: COLORS.white, fontWeight: '600' }}>Delete Dot</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.button} onPress={saveProductData}>
                                        <Text style={{ color: COLORS.white, fontWeight: '600' }}>Save Changes</Text>
                                    </TouchableOpacity>
                                </View>
                            </Pressable>
                        </Animated.View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
        </Fragment>
    );
}



const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        transform: [
            { translateX: '-50%' },
            { translateY: '-50%' }
        ],
        width: 20,
        height: 20,
        borderRadius: 20,
        zIndex: 1,
        borderColor: COLORS.white,
        borderWidth: 1
    },
    shadowBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalView: {
        position: 'relative',
        width: '80%',
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
    contentContainer: {
        padding: 30,
        alignItems: 'center',
        gap: 20,
    },
    modalImageContainer: {
        backgroundColor: COLORS.light_gray,
        alignItems: 'center'
    },
    modalImage: {
        width: '60%',
        aspectRatio: 1
    },
    removeImage: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        color: COLORS.destructive
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
    currencySymbol: {
        fontSize: FONT_SIZES.m,
        marginRight: 4
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
    dropdownItem: {
        padding: 8,
    },
    selectedItem: {
        backgroundColor: COLORS.primary
    },
    priceInput: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.black,
        fontSize: FONT_SIZES.m
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 10,
        alignItems: 'center',
        borderRadius: 5
    }
});