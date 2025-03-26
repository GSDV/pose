import { Dimensions, PixelRatio } from 'react-native';



// UI
export const PRIMARY = 'rgb(242, 103, 61)';
export const SECONDARY = 'rgb(255, 174, 150)';
export const WHITE = 'rgb(255, 255, 255)';
export const LIGHT_GRAY = 'rgb(240, 240, 240)';
export const GRAY = 'rgb(130, 130, 130)';
export const BLACK = 'rgb(20, 20, 20)';
export const RED = 'rgb(242, 56, 56)';
export const COLORS = {
    white: WHITE,
    light_gray: LIGHT_GRAY,
    gray: GRAY,
    black: BLACK,
    primary: PRIMARY,
    secondary: SECONDARY,
    text: BLACK,
    background: WHITE,
    destructive: RED,
    tint: PRIMARY
};



const BASE_WDITH = 375;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SCALED_FONT = (size: number): number => {
    const scaleFactor = SCREEN_WIDTH / BASE_WDITH;
    const newSize = size * scaleFactor;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const FONT_SIZES = {
    s: SCALED_FONT(12),
    m: SCALED_FONT(16),
    l: SCALED_FONT(18),
    xl: SCALED_FONT(20),
    xxl: SCALED_FONT(35)
};



export const TAB_BAR_HEIGHT = 80;



export const contentStyle = { backgroundColor: COLORS.background };
export const defaultScreenOptions = { headerShown: false, contentStyle };



export const DEFAULT_DOT_COLOR = COLORS.primary;