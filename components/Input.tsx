import { TextInputProps, TextInput } from 'react-native';
import React from 'react';
import { FunctionComponent } from 'react';

const styles = {
    input: {
        height: 42,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderColor: '#CFCFCF',
        borderRadius: 4,
        borderWidth: 1,
        fontSize: 14,
        backgroundColor: 'white',
    },
};

export const Input: FunctionComponent<TextInputProps> = (props) => {
    return (
        <TextInput
            {...props}
            placeholderTextColor="#929296"
            style={[styles.input, props.style]}
        />
    );
};
