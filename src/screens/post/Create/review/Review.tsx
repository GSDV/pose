import { useState, useEffect, useRef } from 'react';

import {
    View,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    LayoutChangeEvent,
    GestureResponderEvent,
    TextInput,
    Text,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    Dimensions,
    TouchableOpacity
} from 'react-native';

import { useRouter } from 'expo-router';

import { ScrollView } from 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';

import BrandSearchModal from './BrandSearchModal';
import WebSearchModal, { ProductData } from './WebSearchModal';
import ReviewInfoDot, { DOT_SIZE } from '@components/post/dot/ReviewInfoDot';
import { SafeAreaTop } from '@components/SafeArea';

import { MAX_CAPTION_LENGTH } from '@util/global';
import { COLORS, DEFAULT_DOT_COLOR, FONT_SIZES } from '@util/global-client';

import { ReviewDot } from '@util/types';



interface Coords {
    xPercent: number,
    yPercent: number
}



export default function Review({ pictureUri }: { pictureUri: string }) {
    const router = useRouter();

    const [dots, setDots] = useState<ReviewDot[]>([]);

    const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
    const [imageOriginalDimensions, setImageOriginalDimensions] = useState({ width: 0, height: 0 });
    const [imageRenderedDimensions, setImageRenderedDimensions] = useState({ width: 0, height: 0, x: 0, y: 0 });

    const [brandModalVisible, setBrandModalVisible] = useState<boolean>(false);
    const [webModalVisible, setWebModalVisible] = useState<boolean>(false);

    const [caption, setCaption] = useState<string>('');
    const captionTooLong = (caption.length > MAX_CAPTION_LENGTH);

    const scrollViewRef = useRef<ScrollView>(null);
    const captionInputRef = useRef<TextInput>(null);

    // The current dot:
    const [coords, setCoords] = useState<Coords | null>(null);
    const [webModalUrl, setWebModalUrl] = useState<string | null>(null);

    const resetCurrentDot = () => {
        setCoords(null);
        setWebModalUrl(null);
        setBrandModalVisible(false);
        setWebModalVisible(false);
    }

    const handleContainerLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerDimensions({ width, height });
    }

    // This only runs if the user didn't cancel and has selected a brand for tagging.
    const selectBrand = (url: string) => {
        setWebModalUrl(url);
        setBrandModalVisible(false);
        setWebModalVisible(true);
    }

    const handleImageTap = (event: GestureResponderEvent) => {
        // If the user was typing a caption, just dismiss the keyboard:
        if (Keyboard.isVisible()) {
            Keyboard.dismiss();
            return;
        }

        const { locationX, locationY } = event.nativeEvent;
        if (!(
            locationX-DOT_SIZE >= imageRenderedDimensions.x && 
            locationX+DOT_SIZE <= imageRenderedDimensions.x + imageRenderedDimensions.width &&
            locationY-DOT_SIZE >= imageRenderedDimensions.y && 
            locationY+DOT_SIZE <= imageRenderedDimensions.y + imageRenderedDimensions.height
        )) return;

        const xRelativeToImage = locationX - imageRenderedDimensions.x;
        const yRelativeToImage = locationY - imageRenderedDimensions.y;
        const xPercent = (xRelativeToImage / imageRenderedDimensions.width) * 100;
        const yPercent = (yRelativeToImage / imageRenderedDimensions.height) * 100;

        setCoords({ yPercent, xPercent });
        setBrandModalVisible(true);
    }

    const handleWebModalDone = (productData: ProductData) => {
        if (coords === null) return;
        const dot: ReviewDot = {
            id: `dot-${dots.length}-${coords.xPercent.toFixed(2)}-${coords.yPercent.toFixed(2)}`,
            title: productData.title,
            price: productData.price,
            currency: productData.currency,
            imageUrl: productData.image,
            url: productData.url,
            xPercent: coords.xPercent,
            yPercent: coords.yPercent,
            color: DEFAULT_DOT_COLOR
        }
        setDots(prev => [...prev, dot]);
        resetCurrentDot();
    }


    const attemptPost = () => {
        Keyboard.dismiss();
        console.log('posting...')
    }

    useEffect(() => {
        if (!pictureUri) return;
        Image.getSize(
            pictureUri,
            (width, height) => setImageOriginalDimensions({ width, height })
        );
    }, [pictureUri]);

    useEffect(() => {
        if (!(containerDimensions.width > 0 && containerDimensions.height > 0 && imageOriginalDimensions.width > 0 && imageOriginalDimensions.height > 0)) return;
        const containerRatio = containerDimensions.width / containerDimensions.height;
        const imageRatio = imageOriginalDimensions.width / imageOriginalDimensions.height;
        let width, height, x, y;

        if (imageRatio > containerRatio) {
            width = containerDimensions.width;
            height = containerDimensions.width / imageRatio;
            x = 0;
            y = (containerDimensions.height - height) / 2;
        } else {
            height = containerDimensions.height;
            width = containerDimensions.height * imageRatio;
            x = (containerDimensions.width - width) / 2;
            y = 0;
        }

        setImageRenderedDimensions({ width, height, x, y });
    }, [containerDimensions, imageOriginalDimensions]);


    // Used to calculate fixed image heights
    const screenHeight = Dimensions.get('window').height;
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
            enabled={!brandModalVisible && !webModalVisible}
        >
            <SafeAreaTop />
            <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ paddingLeft: 5, width: 50 }} onPress={router.back}>
                    <Ionicons name='chevron-back' size={25} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingRight: 5 }} onPress={attemptPost}>
                    <Text style={{ padding: 5, paddingHorizontal: 10, backgroundColor: COLORS.primary, borderRadius: 5, color: COLORS.white, fontSize: FONT_SIZES.m }}>Post</Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView 
                ref={scrollViewRef}
                style={{ flex: 1 }} 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={true}
            >

                <TouchableWithoutFeedback onPress={handleImageTap}>
                    <View 
                        style={[styles.imageContainer, { height: screenHeight * 0.60 }]} 
                        onLayout={handleContainerLayout}
                    >
                        <Image
                            source={{ uri: pictureUri }}
                            style={styles.image}
                            resizeMode='contain'
                        />

                        {dots.map((dot) => {
                            const x = imageRenderedDimensions.x + (dot.xPercent / 100) * imageRenderedDimensions.width;
                            const y = imageRenderedDimensions.y + (dot.yPercent / 100) * imageRenderedDimensions.height;
                            const removeDot = () => {
                                setDots((prev) => prev.filter((d) => d.id!=dot.id ))
                            }
                            return <ReviewInfoDot key={dot.id} dot={dot} x={x} y={y} removeDot={removeDot} />;
                        })}
                    </View>
                </TouchableWithoutFeedback>
                
                <Text style={styles.tagText}>Tap on your clothes to tag them</Text>

                <TextInput
                    ref={captionInputRef}
                    style={styles.captionInput}
                    placeholder='Add a caption...'
                    placeholderTextColor={COLORS.medium_gray}
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    returnKeyType='done'
                    submitBehavior='blurAndSubmit'
                    onSubmitEditing={Keyboard.dismiss}
                    onFocus={() => {
                        // Add a small delay to ensure keyboard is fully shown.
                        // This is needed, will not work without.
                        setTimeout(() => {
                            scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                    }}
                />
                <Text style={[styles.captionLength, captionTooLong && { color: COLORS.destructive }]}>{caption.length} / {MAX_CAPTION_LENGTH}</Text>

                <BrandSearchModal
                    modalVisible={brandModalVisible}
                    handleCancel={resetCurrentDot}
                    selectBrand={selectBrand}
                />
                
                {(webModalUrl!==null) && <WebSearchModal
                    modalVisible={webModalVisible}
                    handleCancel={resetCurrentDot}
                    setProductData={handleWebModalDone}
                    webUrl={webModalUrl}
                />}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        paddingBottom: 40,
        alignItems: 'center'
    },
    imageContainer: {
        width: '100%',
        // Height set dynamically to preserve image sizing when keyboard appears.
        borderRadius: 20,
        backgroundColor: COLORS.light_gray,
        marginBottom: 10
    },
    image: {
        width: '100%',
        height: '100%'
    },
    tagText: {
        paddingBottom: 30, 
        textAlign: 'center', 
        color: COLORS.medium_gray, 
        fontSize: FONT_SIZES.m
    },
    captionInput: {
        width: '100%',
        padding: 10,
        maxHeight: 100,
        borderRadius: 10,
        backgroundColor: COLORS.light_gray,
        fontSize: FONT_SIZES.m,
        color: COLORS.black,
        textAlignVertical: 'top'
    },
    captionLength: {
        width: '100%',
        color: COLORS.gray,
        fontSize: FONT_SIZES.s
    }
});