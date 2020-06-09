import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';
import React, { useContext, useState, useCallback } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    Button,
    ActivityIndicator,
    Text,
} from 'react-native';
import * as Sentry from 'sentry-expo';

import { RootStackParamList } from '../../Main';
import { PDAContext } from '../../context/PDAContext';
import sharedStyles from '../../styles/shared';
import CompletedHealthStatusView from './partials/CompletedView';
import InitialView from './partials/InitialView';

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'HealthStatus'>;
};

export const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    panel: {
        backgroundColor: 'white',
        padding: 32,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 4,
            height: 0,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        marginBottom: 18,
    },
    panelHeading: {
        fontSize: 18,
        fontFamily: 'AvenirNext',
        fontWeight: '500',
        marginBottom: 15,
        alignSelf: 'center',
    },
    icon: {
        alignSelf: 'center',
        marginBottom: 35,
        marginTop: 40,
    },

    intro: {
        paddingLeft: 25,
        paddingRight: 25,
        marginBottom: 20,
    },

    engagementMessage: {
        alignSelf: 'center',
        marginBottom: 30,
    },
});

const HealthStatusScreen: React.FunctionComponent<Props> = ({ navigation }) => {
    const {
        isAuthenticated,
        getLatestHealthSurveys,
        healthSurveys,
        logout,
    } = useContext(PDAContext);

    const TEMP_logout = async () => {
        await logout();
        navigation.navigate('Introduction');
    };

    const [loading, setLoading] = useState(true);

    const onScreenEntry = useCallback(() => {
        setLoading(true);

        const getScreenData = async () => {
            if (isAuthenticated) {
                await getLatestHealthSurveys();
            }
            setLoading(false);
        };

        try {
            getScreenData();
        } catch (error) {
            Sentry.captureException(error);
        }
    }, [isAuthenticated]);

    useFocusEffect(onScreenEntry);

    const hasCompletedHealthSurveySteps = (): boolean => {
        return !!(healthSurveys && healthSurveys.length > 0);
    };

    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container, styles.screen]}>
                {loading && (
                    <View testID="screenLoading">
                        <ActivityIndicator size="large" />
                    </View>
                )}

                {!loading && hasCompletedHealthSurveySteps() && (
                    <CompletedHealthStatusView
                        latestHeathSurvey={healthSurveys![0]}
                        handleRetakeSurvey={() =>
                            navigation.navigate('HealthSurvey')
                        }
                    />
                )}

                {!loading && !hasCompletedHealthSurveySteps() && (
                    <InitialView
                        isAuthenticated={isAuthenticated}
                        navigation={navigation}
                    />
                )}

                <View
                    style={{
                        marginTop: 'auto',
                        borderWidth: 1,
                        borderColor: 'red',
                        borderStyle: 'dashed',
                        padding: 10,
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            marginBottom: 5,
                            color: '#888',
                        }}
                    >
                        Debug
                    </Text>
                    <Button
                        onPress={() => TEMP_logout()}
                        title="Logout / Reset"
                    />
                    <Text
                        style={{
                            textAlign: 'center',
                            color: '#888',
                            marginVertical: 5,
                        }}
                    >
                        {Constants.nativeBuildVersion}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default HealthStatusScreen;
