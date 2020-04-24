import { RootStackParamList } from '../Main';
import * as WebBrowser from 'expo-web-browser';
import { StackNavigationProp } from '@react-navigation/stack';
import { Linking } from 'expo';
import { RouteProp } from '@react-navigation/native';
import React, {
    FunctionComponent,
    useState,
    useContext,
    useCallback,
} from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    Image,
    TextInput,
    Text,
    Button,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import sharedStyles from '../styles/shared';
import logo from '../assets/safetrace-logo.png';
import { HatContext } from '../context/HatContext';
import Constants from 'expo-constants';

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'ViewLocations'>;
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'space-between',
    },
    logoContainer: {
        alignItems: 'center',
        flex: 1,
    },
    action: {
        flex: 1,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
});

const Login: FunctionComponent<Props> = () => {
    const [hatDomain, setHatDomain] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { getLoginUrl, authenticateWithToken } = useContext(HatContext);

    const handleRedirect = (event: any): void => {
        if (Constants.platform!.ios) {
            WebBrowser.dismissBrowser();
        } else {
            removeLinkingListener();
        }

        let data = Linking.parse(event.url);

        if (data.path !== 'login-success' && data.path !== 'login-failure') {
            return;
        }

        if (data.queryParams!.error) {
            setError(data.queryParams!.error_reason || data.queryParams!.error);
            return;
        }

        if (data.queryParams!.token) {
            authenticateWithToken(data.queryParams!.token);
            return;
        }
    };

    const addLinkingListener = () => {
        Linking.addEventListener('url', handleRedirect);
    };

    const removeLinkingListener = () => {
        Linking.removeEventListener('url', handleRedirect);
    };

    const redirectToLogin = useCallback(async (hatDomain) => {
        addLinkingListener();
        const [error, url] = await getLoginUrl(hatDomain);

        if (error) {
            setError(error);
            return;
        }

        try {
            const result = await WebBrowser.openBrowserAsync(url!);
            console.log(result);
        } catch (error) {
            console.log('ERROR', error);
            removeLinkingListener();
        }
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            style={sharedStyles.safeArea}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[sharedStyles.container, styles.screen]}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={logo}
                            style={{ width: 120, height: 76.8 }}
                        />
                    </View>
                    <View style={styles.action}>
                        {error && (
                            <Text style={styles.error} testID="loginError">
                                {error}
                            </Text>
                        )}
                        <Text>Enter your hat domain:</Text>
                        <TextInput
                            onChangeText={setHatDomain}
                            testID="inputHatDomain"
                            value={hatDomain}
                            placeholder="ie. myhatusername.hubofallthings.net"
                            style={{
                                height: 40,
                                borderColor: 'gray',
                                borderBottomWidth: 1,
                                marginBottom: 30,
                            }}
                        />
                        <Button
                            title="Login"
                            testID="loginButton"
                            onPress={() => {
                                redirectToLogin(hatDomain);
                            }}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default Login;
