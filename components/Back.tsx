import React, { FunctionComponent } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

import ChevronLeftIcon from '../assets/icons/chevron-left.svg';

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        color: '#167976',
        fontFamily: 'AvenirNext-Medium',
        fontSize: 16,
    },
});

type Props = {
    onPress: () => void;
};

const Back: FunctionComponent<Props> = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <ChevronLeftIcon style={{ marginRight: 10 }} />
            <Text style={styles.text}>Back</Text>
        </TouchableOpacity>
    );
};

export default Back;
