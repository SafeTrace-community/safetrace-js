import React, { useEffect, useState } from 'react';
import * as Sentry from 'sentry-expo';
import { StatusBar, Platform } from 'react-native';
import Main from './Main';
import './tasks/backgroundLocation';
import HatProvider from './context/HatContext';
import { loadAsync, FontDisplay, FontResource } from 'expo-font';

Platform.OS === 'android' ? StatusBar.setBackgroundColor('#FFFFFF') : '';

Sentry.init({
    dsn:
        'https://0c4d473490d54c8a863a9131c02e94b2@o18262.ingest.sentry.io/5203890',
    enableInExpoDevelopment: true,
    debug: true,
});

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    useEffect(() => {
        loadAsync({
            AvenirNext: require('./assets/fonts/AvenirNext-Regular.ttf'),

            'AvenirNext-Medium': {
                uri: require('./assets/fonts/AvenirNext-Medium.ttf'),
                fontDisplay: FontDisplay.FALLBACK,
            } as FontResource,

            'AvenirNext-DemiBold': {
                uri: require('./assets/fonts/AvenirNext-DemiBold.ttf'),
                fontDisplay: FontDisplay.FALLBACK,
            } as FontResource,

            'AvenirNext-Bold': {
                uri: require('./assets/fonts/AvenirNext-Bold.ttf'),
                fontDisplay: FontDisplay.FALLBACK,
            } as FontResource,
        }).then(() => setFontsLoaded(true));
    }, []);

    return (
        <HatProvider>
            <StatusBar barStyle="dark-content" />
            {fontsLoaded && <Main />}
        </HatProvider>
    );
}
