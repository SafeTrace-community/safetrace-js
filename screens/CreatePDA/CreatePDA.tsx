import React, { useState, useContext, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Linking } from 'expo';
import * as WebBrowser from 'expo-web-browser';
import sharedStyles, { Colors } from '../../styles/shared';
import Constants from 'expo-constants';
import { HatContext } from '../../context/HatContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Main';
import { RouteProp } from '@react-navigation/native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Input } from '../../components/Input';

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#F6F6F6',
        justifyContent: 'space-around',
    },
    heading: {
        fontSize: 24,
        fontWeight: '500',
        marginBottom: 30,
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Avenir-DemiBold',
        color: '#272935',
        textAlign: 'center',
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
    form: {
        marginBottom: 35,
    },
    disclaimer: {
        marginBottom: 30,
    },
    disclaimerText: {
        color: '#272935',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    linkText: {
        color: '#1F5992',
    },
    well: {
        padding: 30,
        paddingHorizontal: 37,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 30,
    },
    wellBody: {
        color: '#272935',
        fontSize: 14,
        lineHeight: 20,
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

function formatBackendError(backendError: string): string {
    switch (backendError) {
        case 'email_is_not_valid':
            return 'Please enter a valid email address';
        case 'email_is_required':
            return 'Please enter your email address';
        default:
            return 'An error occurred, please try again';
    }
}

const CreatePDA: React.FunctionComponent<Props> = () => {
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const { authenticateWithToken } = useContext(HatContext);

    const handleRedirect = (event: { url: string }): void => {
        if (Constants.platform!.ios) {
            WebBrowser.dismissBrowser();
        } else {
            removeLinkingListener();
        }

        let data = Linking.parse(event.url);

        if (data.path !== 'signup-return') {
            return;
        }

        if (data.queryParams!.error) {
            const error = formatBackendError(
                data.queryParams!.error_reason || data.queryParams!.error
            );
            setError(error);
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

    const validateForm = (userEmail: string): boolean => {
        if (userEmail.length === 0) {
            setError('Please enter your email address');
            return false;
        }
        return true;
    };

    const handleCreatePDA = async () => {
        const isValid = validateForm(email);

        if (!isValid) {
            return;
        }

        addLinkingListener();
        const redirectUri = Linking.makeUrl('/signup-return');
        const url = `https://hatters.dataswift.io/services/daas/signup?email=${email}&application_id=safe-trace-dev&redirect_uri=${redirectUri}`;

        try {
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            // QUESTION: Do we want to pass something to Sentry here?
            console.log('ERROR', error);
            removeLinkingListener();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            style={[sharedStyles.safeArea, styles.screen]}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                    style={[
                        sharedStyles.container,
                        {
                            justifyContent: 'space-between',
                        },
                    ]}
                >
                    <Text style={styles.heading}>Create Account</Text>

                    <View style={styles.form}>
                        {error && (
                            <Text style={styles.error} testID="error">
                                {error}
                            </Text>
                        )}

                        <Input
                            onChangeText={(text) => {
                                setError(null);
                                setEmail(text);
                            }}
                            value={email}
                            placeholder="Input email"
                            keyboardType="email-address"
                            testID="emailInput"
                            style={(error && { borderColor: Colors.red }) || {}}
                        />
                    </View>

                    <View style={styles.disclaimer}>
                        <Text style={styles.disclaimerText}>
                            We use HAT Personal Data Accounts (PDAs) - a state
                            of the art technology to ensure data security and
                            data rights. By proceeding, you agree to:
                        </Text>

                        <TouchableOpacity
                            onPress={() =>
                                openLink('https://www.sharetrace.org')
                            }
                        >
                            <Text
                                style={[styles.linkText, { marginBottom: 10 }]}
                            >
                                ShareTrace terms of service
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                openLink(
                                    'https://cdn.dataswift.io/legal/dataswift-privacy-policy.pdf'
                                )
                            }
                        >
                            <Text style={styles.linkText}>
                                HAT Terms of service
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.well}>
                        <Text style={styles.wellBody}>
                            Your HAT PDA enables you to own your data for reuse
                            and sharing with applications.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <PrimaryButton
                            onPress={handleCreatePDA}
                            testID="createPDA"
                        >
                            Next
                        </PrimaryButton>
                    </View>

                    <TouchableOpacity
                        onPress={() => openLink('https://www.sharetrace.org')}
                    >
                        <Text
                            style={[styles.linkText, { textAlign: 'center' }]}
                        >
                            Learn how HAT PDA's protect your data
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default CreatePDA;
