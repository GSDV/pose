import { ComponentProps } from 'react';

import { StyleSheet, Animated } from 'react-native';

import { Tabs, usePathname } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';

import { COLORS, TAB_BAR_HEIGHT } from '@util/global-client';



// Create a shared Animated.Value for tab bar hiding.
export const tabBarAnimation = new Animated.Value(0);



type IconName = ComponentProps<typeof Ionicons>['name'];

interface TabType {
    fileName: string;
    iconFocused: IconName;
    iconUnfocused: IconName;
}



export default function TabLayout() {
    const pathname = usePathname();
    const isPostOrProfile = pathname.includes('/post/') || pathname.includes('/profile/');
    const hideTabs = pathname.includes('/capture') || pathname.includes('/review');

    // Reset tab bar position when returning to main screens.
    if (!isPostOrProfile) {
        tabBarAnimation.setValue(0);
    }

    const tabs: TabType[] = [
        { fileName: '(feed)', iconFocused: 'chatbubbles', iconUnfocused: 'chatbubbles-outline' },
        { fileName: '(create)', iconFocused: 'add-circle', iconUnfocused: 'add-circle-outline' },
        { fileName: '(account)', iconFocused: 'person', iconUnfocused: 'person-outline' }
    ];

    // Hide tab bar downward when user scrolls down in post thread or profile view.
    const animatedTranslateY = tabBarAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100]
    });

    return (
        <Tabs 
            initialRouteName='(create)' 
            screenOptions={{
                tabBarActiveTintColor: COLORS.tint,
                headerShown: false,
                sceneStyle: { backgroundColor: COLORS.background },
                tabBarShowLabel: false,
                tabBarStyle: [
                    styles.tabBar,
                    { transform: [{ translateY: animatedTranslateY }] },
                    hideTabs && { display: 'none' }
                ],
                tabBarItemStyle: styles.tabBarItem
            }}
        >
            {tabs.map((tab, i) => (
                <Tabs.Screen 
                    key={i}
                    name={tab.fileName}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons 
                                name={focused ? tab.iconFocused : tab.iconUnfocused}
                                color={color}
                                size={28}
                            />
                        )
                    }} 
                />
            ))}
        </Tabs>
    );
}



const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: TAB_BAR_HEIGHT,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.light_gray
    },
    tabBarItem: {
        paddingVertical: 5
    }
});