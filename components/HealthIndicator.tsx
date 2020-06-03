import React, { FunctionComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import sharedStyles, { Colors } from '../styles/shared';

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        borderWidth: 2,
        backgroundColor: 'white',
        padding: 25,
    },
    indicator: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    indicatorColor: {
        height: 36,
        width: 36,
        borderRadius: 18,
    },
    indicatorStatusText: {
        color: Colors.dark,
        fontSize: 18,
        lineHeight: 24,
        fontFamily: 'AvenirNext-DemiBold',
        marginLeft: 10,
        alignSelf: 'center',
    },
    indicatorExplanationText: {
        alignSelf: 'center',
        textAlign: 'center',
    },
    serious: {
        backgroundColor: Colors.red,
        borderColor: Colors.red,
    },
    caution: {
        backgroundColor: Colors.amber,
        borderColor: Colors.amber,
    },
    safe: {
        backgroundColor: Colors.green,
        borderColor: Colors.green,
    },
    pending: {
        backgroundColor: '#888888',
        borderColor: '#888888',
    },
});

type HealthStatus = 'serious' | 'caution' | 'safe' | 'pending';
type Props = {
    status: HealthStatus;
};

const indicatorExplanationTextMap: { [K in HealthStatus]: string } = {
    serious: 'REPLACE: You are at serious risk',
    caution: 'REPLACE: We advice caution',
    safe: 'You have no current symptoms',
    pending: "We don't have the data yet to show you your health score",
};

const indicatorStatusTextMap = {
    serious: 'Serious',
    caution: 'Caution advised',
    safe: 'Safe',
    pending: 'Waiting results',
};

export const HealthIndicator: FunctionComponent<Props> = ({ status }) => (
    <View style={[styles[status], styles.container]}>
        <View style={[styles.indicator]}>
            <View style={[styles.indicatorColor, styles[status]]}></View>
            <Text style={styles.indicatorStatusText}>
                {' '}
                {indicatorStatusTextMap[status]}{' '}
            </Text>
        </View>
        <Text style={[sharedStyles.text, styles.indicatorExplanationText]}>
            {indicatorExplanationTextMap[status]}
        </Text>
    </View>
);
