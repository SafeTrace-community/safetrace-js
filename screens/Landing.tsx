import React, { FunctionComponent } from 'react';
import { StyleSheet, Platform } from 'react-native';
import {
    View,
    Image,
    Text,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import logo from '../assets/sharetrace-logo.png';
import sharedStyles from '../styles/shared';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../Main';
import * as WebBrowser from 'expo-web-browser';

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flex: 3,
        justifyContent: 'center',
    },
    actions: {
        flex: 3,
        justifyContent: 'center',
    },
    loginAction: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    createAccountAction: {
        marginBottom: 25,
    },
    button: {
        backgroundColor: '#167976',
        borderRadius: 3,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.23,
        shadowRadius: 3.84,
        elevation: 5,
        width: '100%',
    },
    secondaryButton: {
        borderColor: '#167976',
        borderStyle: 'solid',
        borderWidth: 2,
        paddingVertical: 15,
        borderRadius: 3,
        backgroundColor: '#ffffff',
    },
    buttonText: {
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Avenir-DemiBold',
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        alignSelf: 'center',
    },
    text: {
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Avenir-DemiBold',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    learnMoreLink: {
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Avenir-Medium',
        fontWeight: '500',
        fontSize: 14,
        color: '#1F5992',
    },
});

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'Landing'>;
};

const Landing: FunctionComponent<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container, styles.screen]}>
                <View style={styles.logoContainer}>
                    <Image
                        source={logo}
                        style={{ width: 177 }}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.actions}>
                    <View style={styles.loginAction}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            style={styles.button}
                            testID="loginButton"
                        >
                            <Text style={styles.buttonText}>
                                Log In with HAT
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.createAccountAction}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreateAccount')}
                            style={styles.secondaryButton}
                            testID="createAccountButton"
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    { color: '#167976' },
                                ]}
                            >
                                Get Started with HAT
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.text}>
                        We use HAT to secure your data and to provide you with
                        more accurate risk scores
                    </Text>
                </View>
                <View style={{ position: 'absolute', bottom: 10 }}>
                    <TouchableOpacity
                        onPress={() =>
                            WebBrowser.openBrowserAsync(
                                'https://www.sharetrace.org/'
                            )
                        }
                        testID="learnMoreLink"
                    >
                        <Text style={styles.learnMoreLink}>
                            Learn more about us!
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Landing;
