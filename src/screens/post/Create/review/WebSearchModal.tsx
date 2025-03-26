import { useRef, useState } from 'react';

import {
    View,
    Modal,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import { Ionicons } from '@expo/vector-icons';

import { SafeAreaTop } from '@components/SafeArea';

import { COLORS, FONT_SIZES } from '@util/global-client';

import { EXTRACT_PRODUCT_DETAILS_SCRIPT } from '@util/web/extract-info-script';
import { Brand } from '@util/web/brands';



export interface ProductData {
    title: string;
    image: string;
    price: string;
    currency: string;
    url: string;
}



interface WebSearchModalProps {
    modalVisible: boolean;
    webUrl: string;
    handleCancel: () => void;
    setProductData: (pd: ProductData) => void;
}

export default function WebSearchModal({ modalVisible, webUrl, handleCancel, setProductData }: WebSearchModalProps) {
    const insets = useSafeAreaInsets();

    const webViewRef = useRef<WebView>(null);

    const [currentUrl, setCurrentUrl] = useState<string>(webUrl);
    const [canGoBack, setCanGoBack] = useState<boolean>(false);
    const [canGoForward, setCanGoForward] = useState<boolean>(false);


    const goBack = () => {
        if (webViewRef.current && canGoBack) webViewRef.current.goBack();
    }

    const goForward = () => {
        if (webViewRef.current && canGoForward) webViewRef.current.goForward();
    }

    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        setCurrentUrl(navState.url);
        setCanGoBack(navState.canGoBack);
        setCanGoForward(navState.canGoForward);
    };

    const handleDone = () => {
        // Inject JavaScript to find product details before closing
        if (!webViewRef.current) return;
        webViewRef.current.injectJavaScript(EXTRACT_PRODUCT_DETAILS_SCRIPT);
    }


    const handleWebViewMessage = (event: WebViewMessageEvent) => {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type !== 'productDetails') return;

        const currencySymbols = ['$', '€', '£', '¥', '₹', '₽', '₩'];

        let result = '';
        let hasDecimal = false;
        let digitsAfterDecimal = '';
        let price = message.data.price;
        let currency = '';

        // Check if the string starts with a currency symbol
        if (currencySymbols.includes(price[0])) {
            currency = price[0];
            price = price.substring(1).trim();
        }

        // Process the numbers and decimal point
        for (let i = 0; i < price.length; i++) {
            const char = price[i];

            if (!isNaN(parseInt(char))) {
                // It's a digit, keep it
                if (hasDecimal) digitsAfterDecimal += char;
                else result += char;
            } else if (char === '.' && !hasDecimal) {
                // It's the first decimal point we've encountered
                hasDecimal = true;
            } else if (char === ',') {
                continue;
            } else {
                break;
            }
        }

        // Add decimal point and digits after it if they exist
        if (hasDecimal && digitsAfterDecimal.length > 0) result += '.' + digitsAfterDecimal;

        const productData: ProductData = {
            image: message.data.prominentImage || '',
            title: message.data.title || '',
            price: result || '',
            currency: currency || '',
            url: currentUrl
        };

        setProductData(productData);
    }


    return (
        <Modal
            animationType='slide'
            transparent={false}
            visible={modalVisible}
            onRequestClose={handleCancel}
            style={{ backgroundColor: 'red' }}
        >
            <SafeAreaTop />
            <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleCancel}>
                    <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.l }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDone}>
                    <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.l }}>Select Product</Text>
                </TouchableOpacity>
            </View>

            <WebView 
                ref={webViewRef}
                source={{ uri: webUrl }}
                style={{ flex: 1 }}
                onNavigationStateChange={handleNavigationStateChange}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
            />

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
                <Ionicons
                    name='chevron-back'
                    style={[styles.navButton, !canGoBack && styles.disabledButton]}
                    onPress={goBack}
                    disabled={!canGoBack}
                />

                <Ionicons
                    name='chevron-forward'
                    style={[styles.navButton, !canGoForward && styles.disabledButton]}
                    onPress={goForward}
                    disabled={!canGoForward}
                />
            </View>
        </Modal>
    );
}



const styles = StyleSheet.create({
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: COLORS.background,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 5,
        gap: 20,
        backgroundColor: COLORS.background,
        borderTopWidth: 2,
        borderTopColor: COLORS.primary,
    },
    navButton: {
        padding: 10,
        color: COLORS.primary,
        fontSize: FONT_SIZES.xl
    },
    buttonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.m,
        fontWeight: '500',
    },
    disabledButton: {
        color: COLORS.light_gray,
    }
});