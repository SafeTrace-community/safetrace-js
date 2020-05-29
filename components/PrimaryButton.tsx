import {
    TouchableOpacity,
    GestureResponderEvent,
    Platform,
    Text,
    TextStyle,
} from 'react-native';
import React from 'react';
import { FunctionComponent } from 'react';

const styles = {
    button: {
        backgroundColor: '#167976',
        borderRadius: 3,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.23,
        shadowRadius: 3.84,
        elevation: 5,
        width: '100%',
    },
    buttonText: {
        fontFamily: 'AvenirNext-DemiBold',
        color: '#ffffff',
        fontSize: 18,
        alignSelf: 'center',
    } as TextStyle,
};

type Props = {
    testID: string;
    onPress: (e: GestureResponderEvent) => void;
};

export const PrimaryButton: FunctionComponent<Props> = ({
    onPress,
    testID,
    children,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.button}
            testID={testID}
        >
            <Text style={styles.buttonText}>{children}</Text>
        </TouchableOpacity>
    );
};
