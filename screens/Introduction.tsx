import React, { FunctionComponent, useState, useEffect } from 'react';
import { StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { View, Image, Text } from 'react-native';
import introHeader from '../assets/intro-header.png';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../Main';
import { ToggleAppearance } from '../components/ToggleAppearance';

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        width: '100%',
        position: 'relative',
    },
    skipIntroWrapper: {
        position: 'absolute',
        top: '6%',
        right: 20,
        zIndex: 11,
    },
    skipIntroButton: {
        paddingVertical: 7,
        paddingHorizontal: 25,
        borderStyle: 'solid',
        borderColor: '#ffffff',
        borderRadius: 3,
        borderWidth: 2,
    },
    skipIntroButtonText: {
        color: '#ffffff',
        fontFamily: 'Avenir Next',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
    },
    imageWrapper: {},
    image: {
        flex: 3,
        width: '100%',
        resizeMode: 'cover',
        marginBottom: 20,
        marginTop: -50,
    },
    contentWrapper: {
        flex: 2,
        width: '100%',
    },
    infoSlider: {
        flexGrow: 0,
        flexBasis: 210,
    },
    slide: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        fontFamily: 'Avenir Next',
        color: '#272935',
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Avenir Next',
        color: '#272935',
    },
    actions: {
        height: 100,
        width: '100%',
        alignItems: 'stretch',
        paddingLeft: 30,
        paddingRight: 30,
        justifyContent: 'center',
        position: 'relative',
        marginTop: 'auto',
    },
    hint: {
        color: '#646465',
        fontFamily: 'Avenir Next',
    },

    button: {
        backgroundColor: '#167976',
        borderRadius: 3,
        paddingVertical: 15,
    },
    buttonWrapper: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.13,
        shadowRadius: 3.84,
        elevation: 5,
        position: 'absolute',
        left: 30,
        right: 30,
    },
    buttonText: {
        fontFamily: 'Avenir Next',
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        alignSelf: 'center',
    },
});

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'Introduction'>;
};

const Introduction: FunctionComponent<Props> = ({ navigation }) => {
    const swiperRef = React.createRef<Swiper>();
    const [showSkipButton, setShowSkipButton] = useState(true);
    const [showHint, setShowHint] = useState(true);
    const [showButton, setShowButton] = useState(false);

    const skipIntro = () => {
        swiperRef.current!.scrollBy(4);
    };

    return (
        <View style={[styles.screen]}>
            <View style={styles.skipIntroWrapper}>
                <ToggleAppearance visible={showSkipButton}>
                    <TouchableOpacity
                        onPress={skipIntro}
                        testID="skipIntroButton"
                    >
                        <View style={styles.skipIntroButton}>
                            <Text style={styles.skipIntroButtonText}>
                                Skip intro
                            </Text>
                        </View>
                    </TouchableOpacity>
                </ToggleAppearance>
            </View>

            <Image source={introHeader} style={styles.image} />

            <View style={styles.contentWrapper}>
                <View style={styles.infoSlider}>
                    <Swiper
                        loop={false}
                        index={0}
                        ref={swiperRef}
                        activeDotColor="#167976"
                        onIndexChanged={(index) => {
                            if (index === 0) {
                                setShowSkipButton(true);
                                setShowHint(true);
                            } else {
                                setShowSkipButton(false);
                                setShowHint(false);
                            }

                            if (index === 4) {
                                setShowButton(true);
                            } else {
                                setShowButton(false);
                            }
                        }}
                        testID="swiper"
                    >
                        <View style={styles.slide}>
                            <Text style={styles.title}>
                                Contribute anonymously
                            </Text>

                            <Text style={styles.text}>
                                ShareTrace uses HAT, a Personal Data Account
                                (PDA), to ensure that your data remains yours
                                and always under your control. Whenever your
                                data leaves your PDA it is anonymized.
                            </Text>
                        </View>
                        <View style={styles.slide}>
                            <Text style={styles.title}>Protect your data</Text>

                            <Text style={styles.text}>
                                ShareTrace’s distributed architecture protects
                                your privacy by eliminating the need to
                                broadcast even the anonymized user IDs and
                                related information which could otherwise be
                                used to identify you.
                            </Text>
                        </View>
                        <View style={styles.slide}>
                            <Text style={styles.title}>Assess your risk</Text>

                            <Text style={styles.text}>
                                ShareTrace integrates your personal health data
                                as well as history related to your recent
                                patterns of contact to provide a personal risk
                                assessment.
                            </Text>
                        </View>
                        <View style={styles.slide}>
                            <Text style={styles.title}>
                                Be informed of exposure
                            </Text>

                            <Text style={styles.text}>
                                ShareTrace is able to connect the dots between
                                those whom you have come in contact with and
                                their recent contacts to provide you with
                                appropriate alerts much more quickly than simple
                                contact tracing schemes do.
                            </Text>
                        </View>

                        <View style={styles.slide}>
                            <Text style={styles.title}>Safer travels</Text>

                            <Text style={styles.text}>
                                ShareTrace’s hyperlocal networks allow you to
                                roam and continue to receive appropriate
                                guidance even when traveling.
                            </Text>
                        </View>
                    </Swiper>
                </View>

                <View style={styles.actions}>
                    <ToggleAppearance visible={showHint}>
                        <View
                            style={{
                                width: '100%',
                                alignItems: 'center',
                            }}
                            testID="hint"
                        >
                            <Text style={styles.hint}>
                                Swipe left to learn more
                            </Text>
                        </View>
                    </ToggleAppearance>

                    <View style={styles.buttonWrapper}>
                        <ToggleAppearance visible={showButton}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Landing')}
                                style={styles.button}
                                testID="continueButton"
                            >
                                <Text style={styles.buttonText}>
                                    Become part of the solution
                                </Text>
                            </TouchableOpacity>
                        </ToggleAppearance>
                    </View>
                </View>

                <StatusBar barStyle="light-content" />
            </View>
        </View>
    );
};

export default Introduction;
