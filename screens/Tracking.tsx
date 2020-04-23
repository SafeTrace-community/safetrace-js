import React, { useCallback, useEffect, useState, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image } from 'react-native';
import * as Location from 'expo-location';
import sharedStyles from '../styles/shared';
import logo from '../assets/safetrace-logo.png';
import { HatContext } from '../context/HatContext';
import locationService from '../services/LocationService';

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'space-between',
    },
    heading: {
        fontWeight: '500',
        marginBottom: 30,
        fontSize: 24,
        textAlign: 'center',
    },

    logoContainer: {
        alignItems: 'center',
        flex: 1,
        marginTop: 40,
    },

    contentContainer: {
        flex: 5,
    },

    paragraph: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

const Tracking: React.FunctionComponent = () => {
    enum TRACKING_STATUS {
        'ENABLED',
        'DENIED',
        'PENDING',
    }

    const { hatDomain } = useContext(HatContext);
    const [trackingStatus, setTrackingStatus] = useState<TRACKING_STATUS>(
        TRACKING_STATUS.PENDING
    );

    const setupBackgroundTracking = useCallback(async () => {
        const { status } = await Location.requestPermissionsAsync();

        if (status === 'granted') {
            await locationService.startLocationTracking();
            setTrackingStatus(TRACKING_STATUS.ENABLED);
        } else {
            setTrackingStatus(TRACKING_STATUS.DENIED);
            console.error('Did not grant permissions, received:', status);
        }
    }, []);

    useEffect(() => {
        setupBackgroundTracking();
    }, []);

    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container, styles.screen]}>
                <View style={styles.logoContainer}>
                    <Image source={logo} style={{ width: 120, height: 76.8 }} />
                </View>
                <View style={styles.contentContainer}>
                    {trackingStatus === TRACKING_STATUS.PENDING && (
                        <Text>Waiting for permissions to track</Text>
                    )}
                    {trackingStatus === TRACKING_STATUS.DENIED && (
                        <Text>Permission to track denied</Text>
                    )}

                    {trackingStatus === TRACKING_STATUS.ENABLED && (
                        <>
                            <Text style={styles.heading}>Congratulations</Text>

                            <Text style={styles.paragraph}>
                                You are privately tracking your location data
                                with the SafeTrace contact tracing application.
                                You are the only person who has access to your
                                location information.
                            </Text>

                            <Text style={styles.paragraph}>
                                As we ramp up our contact tracing capability, we
                                will begin to show you your risk of exposure to
                                COVID-19.
                            </Text>

                            <Text style={styles.paragraph}>
                                If your public health authority needs to trace
                                the exposure of someone who has a confirmed case
                                of COVID-19 we may try to contact you through
                                this application.
                            </Text>

                            <Text style={styles.paragraph}>
                                {' '}
                                If you have any questions about this
                                application, please contact us at
                                info@safetrace.io
                            </Text>

                            <Text style={styles.paragraph}>
                                Stay safe, stay at home
                            </Text>

                            <Text style={styles.paragraph}> </Text>
                            <Text style={styles.paragraph}>{hatDomain}</Text>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Tracking;
