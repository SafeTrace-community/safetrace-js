import React, { useContext } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Main';
import { RouteProp } from '@react-navigation/native';
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StyleSheet,
} from 'react-native';
import sharedStyles from '../../styles/shared';
import healthCheckIcon from '../../assets/health-check-icon.png';
import ProgressNavigationUncheckedIcon from '../../assets/progress-navigation-unchecked.svg';
import NavigationCaretIcon from '../../assets/navigation-caret.svg';
import ProgressNavigationCheckedIcon from '../../assets/progress-navigation-checked.svg';
import { HatContext } from '../../context/HatContext';

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

    // Could be moved away
    progressNav: {
        borderTopColor: '#CFCFCF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#CFCFCF',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    progressNavItem: {
        borderBottomColor: '#CFCFCF',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    progressNavItemLast: {
        borderBottomWidth: 0,
    },

    progressNavItemLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 5,
        paddingRight: 5,
    },

    progressNavItemLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    progressNavItemLinkContentIcon: {
        marginRight: 10,
    },

    progressNavItemLinkText: {
        fontFamily: 'AvenirNext-DemiBold',
        color: '#1F5992',
    },

    progressNavItemDisabled: {
        opacity: 0.5,
    },
});

const HealthStatusScreen: React.FunctionComponent<Props> = ({ navigation }) => {
    const { isAuthenticated } = useContext(HatContext);
    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container, styles.screen]}>
                <View style={styles.panel}>
                    <Image
                        source={healthCheckIcon}
                        resizeMode="cover"
                        style={styles.icon}
                    />

                    <Text style={[sharedStyles.text, styles.intro]}>
                        In order to provide an assessment of your health status,
                        we will need you to complete the 2 steps below.
                    </Text>

                    {/* This could all be moved into a component that accepts enabled, completed props for each step */}
                    <View style={styles.progressNav}>
                        <View style={[styles.progressNavItem]}>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate('GetStartedWithHat')
                                }
                                testID="createPersonalDataAccount"
                                disabled={isAuthenticated}
                                style={[styles.progressNavItemLink]}
                            >
                                <View style={styles.progressNavItemLinkContent}>
                                    {!isAuthenticated && (
                                        <ProgressNavigationUncheckedIcon
                                            height={28}
                                            width={28}
                                            style={
                                                styles.progressNavItemLinkContentIcon
                                            }
                                        />
                                    )}

                                    {isAuthenticated && (
                                        <ProgressNavigationCheckedIcon
                                            height={28}
                                            width={28}
                                            style={
                                                styles.progressNavItemLinkContentIcon
                                            }
                                            testID="createPersonalDataAccountComplete"
                                        />
                                    )}
                                    <Text
                                        style={styles.progressNavItemLinkText}
                                    >
                                        Create a personal data account
                                    </Text>
                                </View>
                                {!isAuthenticated && (
                                    <NavigationCaretIcon
                                        height={10}
                                        width={5}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View
                            style={[
                                styles.progressNavItem,
                                styles.progressNavItemLast,
                                !isAuthenticated &&
                                    styles.progressNavItemDisabled,
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate('HealthCheck')
                                }
                                testID="provideProvisionalHealthCheck"
                                disabled={!isAuthenticated}
                                style={[styles.progressNavItemLink]}
                            >
                                <View style={styles.progressNavItemLinkContent}>
                                    <ProgressNavigationUncheckedIcon
                                        height={28}
                                        width={28}
                                        style={
                                            styles.progressNavItemLinkContentIcon
                                        }
                                    />
                                    <Text
                                        style={styles.progressNavItemLinkText}
                                    >
                                        Provide preliminary health check
                                    </Text>
                                </View>
                                {isAuthenticated && (
                                    <NavigationCaretIcon
                                        height={10}
                                        width={5}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default HealthStatusScreen;
