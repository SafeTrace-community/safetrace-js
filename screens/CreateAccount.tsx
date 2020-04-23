import React, { useState, useContext } from 'react';
import {
    StyleSheet,
    Button,
    TextInput,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { Linking } from 'expo';
import * as WebBrowser from 'expo-web-browser';
import sharedStyles from '../styles/shared';
import Constants from 'expo-constants';
import { HatContext } from '../context/HatContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Main';
import { RouteProp } from '@react-navigation/native';

interface ICreateAccountProps {
    handleAccountSuccess(authToken: string): Promise<void>;
}

const styles = StyleSheet.create({
    screen: {},
    heading: {
        fontSize: 24,
        marginTop: 100,
        fontWeight: 'bold',
        marginBottom: 50,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
    disclaimer: {
        marginBottom: 30,
    },
    disclaimerText: {
        color: '#888',
        marginBottom: 10,
    },
    linkText: {
        color: 'rgb(0, 108, 229)',
        marginBottom: 5,
    },
    hint: {
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: '#eee',
        borderRadius: 10,
        marginBottom: 20,
    },
    hintTitle: {
        marginBottom: 10,
        fontWeight: '500',
        color: '#666',
    },
    hintBody: {
        color: '#666',
    },
    hintLink: {
        color: '#666',
    },
});

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'CreateAccount'>;
};

const CreateAccount: React.FunctionComponent<Props> = () => {
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const { authenticateWithToken } = useContext(HatContext);
    const handleRedirect = (event: any): void => {
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

    const handleCreateAccount = async () => {
        addLinkingListener();
        const redirect_uri = Linking.makeUrl('/signup-return');
        const url = `https://hatters.dataswift.io/services/daas/signup?email=${email}&application_id=safe-trace-dev&redirect_uri=${redirect_uri}`;

        try {
            const result = await WebBrowser.openBrowserAsync(url);
            console.log(result);
        } catch (error) {
            console.log('ERROR', error);
            removeLinkingListener();
        }
    };

    const openLink = (url: string) => {
        WebBrowser.openBrowserAsync(url);
    };

    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container, styles.screen]}>
                <Text style={styles.heading}>Enter your details</Text>

                {error && <Text style={styles.error}>{error}</Text>}

                <TextInput
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderBottomWidth: 1,
                        marginBottom: 30,
                    }}
                />

                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>
                        We use HAT Personal Data Accounts (PDAs) - a state of
                        the art technology to ensure data security and data
                        rights. By proceeding, you agree to:
                    </Text>

                    <TouchableOpacity
                        onPress={() => openLink('https://safetrace.io')}
                    >
                        <Text style={styles.linkText}>
                            SafeTrace terms of service
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

                <View style={styles.hint}>
                    <Text style={styles.hintTitle}>
                        Learn how we protect your data
                    </Text>
                    <Text style={styles.hintBody}>
                        Your HAT PDA enables you to own your data for reuse and
                        sharing with applications. For more information on PDAs,
                        please visit
                    </Text>
                    <TouchableOpacity
                        onPress={() => openLink('https://hubofallthings.com')}
                    >
                        <Text style={styles.hintLink}>
                            https://hubofallthings.com
                        </Text>
                    </TouchableOpacity>
                </View>
                <Button title="Next" onPress={handleCreateAccount} />
            </View>
        </SafeAreaView>
    );
};

export default CreateAccount;
