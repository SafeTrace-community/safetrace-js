import React, { useCallback, useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    Image,
    Button,
} from 'react-native';
import * as Location from 'expo-location';
import sharedStyles from '../styles/shared';
import logo from '../assets/safetrace-logo.png';
import { HatContext } from '../context/HatContext';
import locationService from '../services/LocationService';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../Main';

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
        marginBottom: 20,
    },

    contentContainer: {
        flex: 5,
    },
    actions: {
        marginBottom: 20,
    },

    paragraph: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'Tracking'>;
};

const Tracking: React.FunctionComponent<Props> = ({ navigation }) => {
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
                            <View style={styles.actions}>
                                <Button
                                    title="Your location logs"
                                    onPress={() => {
                                        navigation.navigate('ViewLocations');
                                    }}
                                />
                                <Button
                                    title="Stop tracking? (delete)"
                                    onPress={() => {
                                        navigation.navigate('DeleteAccount');
                                    }}
                                />
                            </View>

                            <Text style={styles.paragraph}>
                                Your SafeTrace personal data account is logging
                                your location privately. It is privately stored
                                in that account and no one else can see it.
                            </Text>

                            <Text style={styles.paragraph}>{hatDomain}</Text>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Tracking;
