import React, { useRef, FunctionComponent, useEffect, useState } from 'react';
import { Animated } from 'react-native';

export const ToggleAppearance: FunctionComponent<{
    visible: boolean;
    children: any;
}> = ({ visible, children }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [isVisible, setIsVisible] = useState(true);

    const fadeIn = () => {
        setIsVisible(true);

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
        }).start();
    };

    const fadeOut = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
        }).start(() => setIsVisible(false));
    };

    useEffect(() => {
        if (visible) {
            fadeIn();
        } else {
            fadeOut();
        }
    }, [visible]);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            {isVisible && children}
        </Animated.View>
    );
};
