import React, { useContext, useEffect, useState, useCallback } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Main';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import {
    Text,
    View,
    SafeAreaView,
    Image,
    StyleSheet,
    Button,
    ActivityIndicator,
} from 'react-native';
import * as Sentry from 'sentry-expo';
import sharedStyles from '../../styles/shared';
import healthSurveyIcon from '../../assets/icons/health-check-icon.png';
import { HatContext } from '../../context/HatContext';
import { ProgressNav, ProgressNavItem } from '../../components/ProgressNav';

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'HealthStatus'>;
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    panel: {
        backgroundColor: 'white',
        padding: 18,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 4,
            height: 0,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
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
});

const HealthStatusScreen: React.FunctionComponent<Props> = ({ navigation }) => {
    const {
        isAuthenticated,
        getHealthSurveys,
        healthSurveys,
        logout,
    } = useContext(HatContext);

    const TEMP_logout = async () => {
        await logout();
        navigation.navigate('Introduction');
    };

    const [loading, setLoading] = useState(true);

    const onScreenEntry = useCallback(() => {
        setLoading(true);

        const getScreenData = async () => {
            if (healthSurveys.length === 0) {
                await getHealthSurveys();
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        try {
            getScreenData();
        } catch (error) {
            Sentry.captureException(error);
        }
    }, [healthSurveys]);

    useFocusEffect(onScreenEntry);

    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container, styles.screen]}>
                <View style={styles.panel}>
                    <Image
                        source={healthSurveyIcon}
                        resizeMode="cover"
                        style={styles.icon}
                    />

                    <Text style={[sharedStyles.text, styles.intro]}>
                        In order to provide an assessment of your health status,
                        we will need you to complete the 2 steps below.
                    </Text>

                    {loading && (
                        <View testID={'screenLoading'}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}

                    {!loading && (
                        <ProgressNav>
                            <ProgressNavItem
                                onPress={() =>
                                    navigation.navigate('GetStartedWithPDA')
                                }
                                testID={'createPersonalDataAccount'}
                                isCompleted={isAuthenticated}
                                isEnabled={!isAuthenticated}
                                text="Create a personal data account"
                            />

                            <ProgressNavItem
                                onPress={() =>
                                    navigation.navigate('HealthSurvey')
                                }
                                testID={'providePreliminaryHealthSurvey'}
                                isCompleted={healthSurveys.length > 0}
                                isEnabled={
                                    isAuthenticated &&
                                    healthSurveys.length === 0
                                }
                                text="Provide preliminary health
                                    survey"
                            />
                        </ProgressNav>
                    )}
                </View>
                <View style={{ marginTop: 'auto' }}>
                    <Button
                        onPress={() => TEMP_logout()}
                        title="Logout / Reset"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default HealthStatusScreen;
