import React, { FunctionComponent } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

const styles = StyleSheet.create({
    link: {
        color: '#1F5992',
        alignSelf: 'flex-start',
        fontFamily: 'AvenirNext-Medium',
    },
});

export const Link: FunctionComponent<{ onPress: () => any } & TextProps> = ({
    onPress,
    style,
    children,
    ...props
}) => {
    return (
        <Text {...props} style={[styles.link, style]} onPress={onPress}>
            {children}
        </Text>
    );
};
