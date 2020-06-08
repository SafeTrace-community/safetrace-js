import React, { useContext, useState, useCallback, useMemo } from 'react';
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
import { PDAContext } from '../../context/PDAContext';
import { ProgressNav, ProgressNavItem } from '../../components/ProgressNav';
import { HealthIndicator } from '../../components/HealthIndicator';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import demographicInformationService from '../../services/DemographicInformationService';

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
                await demographicInformationService.pushToPDA();
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
        return healthSurveys && healthSurveys.length > 0 ? true : false;
    };

    const InitialView = useMemo(() => {
        return (
            <View style={styles.panel}>
                <Image
                    source={healthSurveyIcon}
                    resizeMode="cover"
                    style={styles.icon}
                />

                <Text style={[sharedStyles.text, styles.intro]}>
                    In order to provide an assessment of your health status, we
                    will need you to complete the 2 steps below.
                </Text>

                <ProgressNav>
                    <ProgressNavItem
                        onPress={() => navigation.navigate('GetStartedWithPDA')}
                        testID={'createPersonalDataAccount'}
                        isCompleted={isAuthenticated}
                        isEnabled={!isAuthenticated}
                        text="Create a personal data account"
                    />

                    <ProgressNavItem
                        onPress={() => navigation.navigate('HealthSurvey')}
                        testID={'providePreliminaryHealthSurvey'}
                        isCompleted={false}
                        isEnabled={isAuthenticated}
                        text="Provide preliminary health
                            survey"
                    />
                </ProgressNav>
            </View>
        );
    }, [isAuthenticated]);

    const CompletedView = useMemo(() => {
        return (
            <>
                <View style={styles.panel} testID="HealthStatusIndicator">
                    <Text style={styles.panelHeading}>Health Status</Text>
                    <HealthIndicator status="pending" />
                </View>

                <View style={styles.panel}>
                    <SecondaryButton
                        testID="retakeHealthSurvey"
                        text="Retake health survey"
                        onPress={() => navigation.navigate('HealthSurvey')}
                    />
                </View>

                <View style={styles.panel}>
                    <Text style={styles.panelHeading}>Complete profile</Text>

                    <ProgressNav>
                        <ProgressNavItem
                            onPress={() =>
                                navigation.navigate('GetStartedWithPDA')
                            }
                            testID={'createPersonalDataAccount'}
                            isCompleted={true}
                            isEnabled={false}
                            text="Create a personal data account"
                        />

                        <ProgressNavItem
                            onPress={() => navigation.navigate('HealthSurvey')}
                            testID={'providePreliminaryHealthSurvey'}
                            isCompleted={true}
                            isEnabled={false}
                            text="Provide preliminary health
                            survey"
                        />
                    </ProgressNav>
                </View>
            </>
        );
    }, []);

    return (
        <SafeAreaView style={sharedStyles.safeArea} testID="healthStatusScreen">
            <View style={[sharedStyles.container, styles.screen]}>
                {loading && (
                    <View testID={'screenLoading'}>
                        <ActivityIndicator size="large" />
                    </View>
                )}
                {!loading && hasCompletedHealthSurveySteps()
                    ? CompletedView
                    : InitialView}

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
