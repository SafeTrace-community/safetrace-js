import {
    TouchableOpacity,
    GestureResponderEvent,
    Text,
    StyleSheet,
    TouchableOpacityProps,
} from 'react-native';
import React from 'react';
import { FunctionComponent } from 'react';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#167976',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 30,
        elevation: 5,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'AvenirNext-Medium',
        color: '#ffffff',
        fontSize: 16,
        alignSelf: 'center',
    },
});

interface Props extends TouchableOpacityProps {
    onPress: (e: GestureResponderEvent) => void;
    text: string;
}

export const SecondaryButton: FunctionComponent<Props> = ({
    onPress,
    text,
    children,
    style,
    ...props
}) => {
    return (
        <TouchableOpacity
            {...props}
            onPress={onPress}
            style={[styles.button, style]}
        >
            <Text style={[styles.buttonText]}>{text}</Text>
            {children}
        </TouchableOpacity>
    );
};
