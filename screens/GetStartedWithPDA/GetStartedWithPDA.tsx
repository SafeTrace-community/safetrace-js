import React, { FunctionComponent } from 'react';
import { StyleSheet, Platform, StatusBar } from 'react-native';
import {
    View,
    Image,
    Text,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import logo from '../../assets/sharetrace-logo.png';
import sharedStyles from '../../styles/shared';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Main';
import * as WebBrowser from 'expo-web-browser';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Link } from '../../components/Link';

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: 'white',
    },
    screen: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flex: 2,
        justifyContent: 'center',
    },
    actions: {
        flex: 3,
        justifyContent: 'center',
    },
    loginAction: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
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
        fontFamily: 'AvenirNext-DemiBold',
        color: '#ffffff',
        fontSize: 18,
        alignSelf: 'center',
    },
    text: {
        fontFamily: 'AvenirNext-Medium',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    learnMoreLink: {
        fontFamily: 'AvenirNext-Medium',
        fontSize: 14,
        color: '#1F5992',
    },
});

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'GetStartedWithPDA'>;
};

const GetStartedWithPDA: FunctionComponent<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={[sharedStyles.safeArea, styles.safeArea]}>
            {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}

            <View style={[sharedStyles.container, styles.screen]}>
                <View style={styles.logoContainer}>
                    <Image
                        source={logo}
                        style={{ width: 177 }}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.actions}>
                    <View style={styles.createAccountAction}>
                        <PrimaryButton
                            text="Get Started with PDA"
                            onPress={() => navigation.navigate('CreateAccount')}
                            testID="createAccountButton"
                        />
                    </View>

                    <View style={styles.loginAction}>
                        <Link
                            onPress={() => navigation.navigate('Login')}
                            testID="loginButton"
                        >
                            Already have a PDA? Login here
                        </Link>
                    </View>

                    <Text style={styles.text}>
                        When you sign up to ShareTrace, your data will be stored
                        in a Personal Data Account (PDA). PDAs use a new
                        technology called HAT Microserver to enable you to own
                        and control your data in the cloud. For more
                        information, see https://hubofallthings.com
                    </Text>
                </View>
                <View style={{ position: 'absolute', bottom: 10 }}>
                    <Link
                        onPress={() =>
                            WebBrowser.openBrowserAsync(
                                'https://www.sharetrace.org/'
                            )
                        }
                        testID="learnMoreLink"
                    >
                        Learn more about us!
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default GetStartedWithPDA;
