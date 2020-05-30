import {
    TouchableOpacity,
    GestureResponderEvent,
    Text,
    StyleSheet,
    TouchableOpacityProps,
    View,
    StyleProp,
    TextStyle,
} from 'react-native';
import React from 'react';
import { FunctionComponent } from 'react';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#167976',
        borderRadius: 3,
        paddingVertical: 15,
        paddingHorizontal: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.23,
        shadowRadius: 3.84,
        elevation: 5,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'AvenirNext-DemiBold',
        color: '#ffffff',
        fontSize: 18,
        alignSelf: 'center',
    },
});

interface Props extends TouchableOpacityProps {
    onPress: (e: GestureResponderEvent) => void;
    text: string;
    textStyle?: StyleProp<TextStyle>;
}

export const PrimaryButton: FunctionComponent<Props> = ({
    onPress,
    text,
    children,
    style,
    textStyle,
    ...props
}) => {
    return (
        <TouchableOpacity
            {...props}
            onPress={onPress}
            style={[styles.button, style]}
        >
            <Text style={[styles.buttonText, textStyle]}>{text}</Text>
            {children}
        </TouchableOpacity>
    );
};
