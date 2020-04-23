import React from 'react';
import * as Sentry from 'sentry-expo';
import { StatusBar, Platform } from 'react-native';
import Main from './Main';
import './tasks/backgroundLocation';
import HatProvider from './context/HatContext';

Platform.OS === 'android' ? StatusBar.setBackgroundColor('#FFFFFF') : '';

Sentry.init({
    dsn:
        'https://0c4d473490d54c8a863a9131c02e94b2@o18262.ingest.sentry.io/5203890',
    enableInExpoDevelopment: true,
    debug: true,
});

export default function App() {
    return (
        <HatProvider>
            <StatusBar barStyle="dark-content" />
            <Main />
        </HatProvider>
    );
}
