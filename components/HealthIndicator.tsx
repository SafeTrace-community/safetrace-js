import React, { FunctionComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import sharedStyles, { Colors } from '../styles/shared';

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.green,
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
        backgroundColor: Colors.green,
    },
    indicatorText: {
        color: Colors.dark,
        fontSize: 18,
        lineHeight: 24,
        fontFamily: 'AvenirNext-DemiBold',
        marginLeft: 15,
    },
});

export const HealthIndicator: FunctionComponent = () => (
    <View style={styles.container}>
        <View style={styles.indicator}>
            <View style={styles.indicatorColor}></View>
            <Text style={styles.indicatorText}>Safe</Text>
        </View>
        <Text style={sharedStyles.text}>
            You have no underlying health conditions or current symptoms
        </Text>
    </View>
);
