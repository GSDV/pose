import { ReactNode } from 'react';

import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



export function SafeAreaFull({ children }: { children: ReactNode }) {
    return (
        <View style={{ flex: 1 }}>
            <SafeAreaTop/>
                <View style={{ flex: 1 }}>
                    {children}
                </View>
            <SafeAreaBottom/>
        </View>
    );
}



// SafeAreaTop and SafeAreaBottom are to be used independently as well
// SafeAreaBottom should almost always be used within a parent container of style "flex: 1" and a sibling with "flex: 1", so that it is pushed to the bottom

export function SafeAreaTop() {
    const insets = useSafeAreaInsets();
    return <View style={{ paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }} />;
}

export function SafeAreaBottom() {
    const insets = useSafeAreaInsets();
    return <View style={{ paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }} />;
}