import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { FunctionComponent, useEffect, useState } from 'react';

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
        visible ? fadeIn() : fadeOut();
    }, [visible]);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            {isVisible && children}
        </Animated.View>
    );
};
