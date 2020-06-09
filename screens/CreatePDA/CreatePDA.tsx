import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Linking } from 'expo';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import React, { useState, useContext, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { RootStackParamList } from '../../Main';
import { Input } from '../../components/Input';
import { Link } from '../../components/Link';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PDAContext } from '../../context/PDAContext';
import sharedStyles, { Colors } from '../../styles/shared';

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#F6F6F6',
        justifyContent: 'space-around',
    },
    heading: {
        fontSize: 24,
        marginBottom: 30,
        marginTop: 10,
        fontFamily: 'AvenirNext-Medium',
        color: Colors.dark,
        textAlign: 'center',
    },
    formInput: {
        marginBottom: 15,
        position: 'relative',
    },
    formGlobalError: {
        color: Colors.red,
        textAlign: 'center',
        padding: 3,
        overflow: 'hidden',
        marginBottom: 10,
    },
    formError: {
        color: Colors.red,
        marginBottom: 5,
    },
    disclaimer: {
        marginBottom: 30,
    },
    disclaimerText: {
        color: Colors.dark,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    linkText: {
        color: '#1F5992',
        alignSelf: 'flex-start',
    },
    well: {
        padding: 30,
        paddingHorizontal: 37,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 30,
    },
    wellBody: {
        fontFamily: 'AvenirNext-Medium',
    },
    actions: {
        marginBottom: 30,
    },
});

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'CreateAccount'>;
};

const openLink = (url: string) => {
    WebBrowser.openBrowserAsync(url);
};

const CreatePDA: React.FunctionComponent<Props> = () => {
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    const { authenticateWithToken } = useContext(PDAContext);

    const mapBackendError = useCallback((backendError: string): void => {
        switch (backendError) {
            case 'email_is_not_valid':
                setEmailError('Please enter a valid email address');
                break;
            case 'email_is_required':
                setEmailError('Please enter your email address');
                break;
            case 'email_already_taken':
                setEmailError('Email already registered');
                break;
            case 'hat_name_is_required':
                setUsernameError('Please enter a valid username');
                break;
            case 'hat_name_is_not_valid':
                setUsernameError(
                    'Username must be lowercase, between 4 and 24 characters and start with a letter'
                );
                break;
            case 'hat_name_already_taken':
                setUsernameError('That username is already taken');
                break;
            default:
                console.error(backendError);
                setError('An error occurred');
                break;
        }
    }, []);

    const handleRedirect = useCallback((event: { url: string }): void => {
        if (Constants.platform!.ios) {
            WebBrowser.dismissBrowser();
        } else {
            removeLinkingListener();
        }

        const data = Linking.parse(event.url);

        if (data.path !== 'signup-return') {
            return;
        }

        if (data.queryParams!.error) {
            mapBackendError(
                data.queryParams!.error_reason || data.queryParams!.error
            );
            removeLinkingListener();
            return;
        }

        if (data.queryParams!.token) {
            authenticateWithToken(data.queryParams!.token);
        }
    }, []);

    const addLinkingListener = useCallback(() => {
        Linking.addEventListener('url', handleRedirect);
    }, []);

    const removeLinkingListener = useCallback(() => {
        Linking.removeEventListener('url', handleRedirect);
    }, []);

    const clearErrors = useCallback(() => {
        setError(null);
        setEmailError(null);
        setUsernameError(null);
    }, []);

    const validateForm = useCallback((): boolean => {
        clearErrors();
        let isValid = true;

        if (email.length === 0) {
            setEmailError('Please enter your email address');
            isValid = false;
        }

        if (username.length === 0) {
            setUsernameError('Please enter a username');
            isValid = false;
        }

        return isValid;
    }, [email, username]);

    const handleCreatePDA = async () => {
        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        addLinkingListener();
        const redirectUri = Linking.makeUrl('/signup-return');
        const url = `https://hatters.dataswift.io/services/baas/signup?hat_name=${username}&email=${email}&application_id=sharetrace-dev&redirect_uri=${redirectUri}`;

        try {
            await WebBrowser.openBrowserAsync(url);
        } catch (err) {
            removeLinkingListener();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[sharedStyles.safeArea, styles.screen]}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView>
                    <View style={sharedStyles.container}>
                        <Text style={styles.heading}>Create Account</Text>

                        {error && (
                            <Text style={styles.formGlobalError} testID="error">
                                {error}
                            </Text>
                        )}

                        <View style={styles.formInput}>
                            {emailError && (
                                <Text
                                    style={styles.formError}
                                    testID="emailError"
                                >
                                    {emailError}
                                </Text>
                            )}

                            <Input
                                onChangeText={(text) => {
                                    setEmailError(null);
                                    setEmail(text);
                                }}
                                value={email}
                                placeholder="Input email"
                                keyboardType="email-address"
                                testID="emailInput"
                                autoCapitalize="none"
                                style={
                                    (emailError && {
                                        borderColor: Colors.red,
                                    }) ||
                                    {}
                                }
                            />
                        </View>

                        <View style={[styles.formInput, { marginBottom: 30 }]}>
                            {usernameError && (
                                <Text
                                    style={styles.formError}
                                    testID="usernameError"
                                >
                                    {usernameError}
                                </Text>
                            )}

                            <Input
                                onChangeText={(text) => {
                                    setUsernameError(null);
                                    setUsername(text);
                                }}
                                value={username}
                                placeholder="Input username"
                                keyboardType="default"
                                autoCapitalize="none"
                                testID="usernameInput"
                                style={
                                    (usernameError && {
                                        borderColor: Colors.red,
                                    }) ||
                                    {}
                                }
                            />
                        </View>

                        <View style={styles.disclaimer}>
                            <Text
                                style={[
                                    sharedStyles.text,
                                    styles.disclaimerText,
                                ]}
                            >
                                We use HAT Personal Data Accounts (PDAs) - a
                                state of the art technology to ensure data
                                security and data rights. By proceeding, you
                                agree to:
                            </Text>

                            <Link
                                style={{ marginBottom: 10 }}
                                onPress={() =>
                                    openLink(
                                        'https://www.sharetrace.org/privacy'
                                    )
                                }
                            >
                                ShareTrace terms of service
                            </Link>

                            <Link
                                onPress={() =>
                                    openLink(
                                        'https://cdn.dataswift.io/legal/dataswift-privacy-policy.pdf'
                                    )
                                }
                            >
                                HAT Terms of service
                            </Link>
                        </View>

                        <View style={styles.well}>
                            <Text style={[sharedStyles.text, styles.wellBody]}>
                                Your HAT PDA enables you to own your data for
                                reuse and sharing with applications.
                            </Text>
                        </View>

                        <View style={styles.actions}>
                            <PrimaryButton
                                text="Next"
                                onPress={handleCreatePDA}
                                testID="createPDA"
                            />
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default CreatePDA;
