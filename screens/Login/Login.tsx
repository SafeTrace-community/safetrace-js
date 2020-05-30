import { RootStackParamList } from '../../Main';
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
import sharedStyles from '../../styles/shared';
import { HatContext } from '../../context/HatContext';
import Constants from 'expo-constants';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Input } from '../../components/Input';

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'ViewLocations'>;
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'space-between',
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
            await WebBrowser.openBrowserAsync(url!);
        } catch (error) {
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
                    <View style={styles.action}>
                        {error && (
                            <Text style={styles.error} testID="loginError">
                                {error}
                            </Text>
                        )}
                        <Text
                            style={{
                                marginBottom: 10,
                            }}
                        >
                            Enter your PDA domain:
                        </Text>
                        <Input
                            onChangeText={setHatDomain}
                            testID="inputHatDomain"
                            value={hatDomain}
                            placeholder="ie. mypdausername.hubofallthings.net"
                            style={{
                                marginBottom: 20,
                            }}
                        />
                        <PrimaryButton
                            testID="loginButton"
                            text="Login"
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
