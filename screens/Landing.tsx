import React, { FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import {
    View,
    Image,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Button,
} from 'react-native';
import logo from '../assets/safetrace-logo.png';
import sharedStyles from '../styles/shared';

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
});

// @todo: Type checking
const Landing: FunctionComponent<any> = ({ navigation }) => {
    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container, styles.screen]}>
                <View style={styles.logoContainer}>
                    <Image source={logo} style={{ width: 305, height: 159 }} />
                </View>
                <Button
                    title="Create account"
                    onPress={() => {
                        navigation.navigate('CreateAccount');
                    }}
                    testID="createAccountButton"
                />
            </View>
        </SafeAreaView>
    );
};

export default Landing;
