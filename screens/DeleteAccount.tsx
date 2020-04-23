import React, { FunctionComponent, useContext } from 'react';
import { View, Button, Text, StyleSheet, SafeAreaView } from 'react-native';
import { HatContext } from '../context/HatContext';
import sharedStyles from '../styles/shared';

const styles = StyleSheet.create({
    screen: {
        alignContent: 'center',
    },
    summary: {
        textAlign: 'center',
        marginBottom: 20,
    },
});
const DeleteAccount: FunctionComponent = () => {
    const { deleteAccount } = useContext(HatContext);
    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container, styles.screen]}>
                <Text style={styles.summary}>
                    Your locations will no longer be logged in your private
                    SafeTrace account. Are you sure you want to proceed?
                </Text>
                <Button
                    testID="deleteAccount"
                    title="Yes, delete my account"
                    onPress={() => deleteAccount()}
                />
            </View>
        </SafeAreaView>
    );
};

export default DeleteAccount;
