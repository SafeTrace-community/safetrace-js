import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import sharedStyles from '../../styles/shared';
import { RouteProp } from '@react-navigation/native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScrollView } from 'react-native-gesture-handler';
import CheckIcon from '../../assets/icons/check.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import {
    HealthCheckStackParamList,
    healthCheckStyles as styles,
    HealthCheckNavigationProp,
} from './HealthCheck';
import Back from '../../components/Back';

type Props = {
    navigation: HealthCheckNavigationProp;
    route?: RouteProp<HealthCheckStackParamList, 'Symptoms'>;
    handleSelection: (selection: string) => void;
    isSelected: (selection: string) => boolean;
    submitting: boolean;
    error: string | null;
    handleNext: () => void;
};

const symptoms = [
    'Loss of smell or taste',
    'Skipped meals',
    'Fatigue',
    'Fever',
    'Persistent cough',
];

const SymptomsScreen: React.FunctionComponent<Props> = ({
    navigation,
    handleSelection,
    isSelected,
    handleNext,
    submitting,
}) => {
    return (
        <SafeAreaView style={[sharedStyles.safeArea]}>
            <ScrollView style={[sharedStyles.container]}>
                <Text style={styles.title}>COVID-19 Symptom Checker</Text>

                <Text style={[sharedStyles.text, styles.small]}>
                    Answer the following questions to learn how your health
                    status impacts your Covid-19 status.
                </Text>

                <View style={styles.progress}>
                    <View style={styles.progressBar}>
                        <View style={styles.progressBarFill}></View>
                    </View>
                    <Text
                        style={[sharedStyles.text, { alignSelf: 'flex-end' }]}
                    >
                        1/2
                    </Text>
                </View>

                <Text style={styles.question}>
                    Have you experienced any of the symptoms listed below?
                </Text>

                <Text style={sharedStyles.text}>
                    Check any symptoms you have recently experienced. Click the
                    "Next" button to proceed.
                </Text>

                <View style={{ paddingVertical: 20 }}>
                    {symptoms.map((symptom, index) => (
                        <TouchableOpacity
                            key={index}
                            accessible={true}
                            accessibilityLabel={symptom}
                            onPress={() => handleSelection(symptom)}
                        >
                            <View
                                style={[
                                    styles.check,
                                    isSelected(symptom) && styles.selected,
                                ]}
                                testID="checkbox"
                            >
                                <View
                                    style={[
                                        styles.checkBox,
                                        isSelected(symptom) &&
                                            styles.selectedCheckbox,
                                    ]}
                                >
                                    <CheckIcon />
                                </View>
                                <Text style={styles.checkText}>{symptom}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.actions}>
                    <Back onPress={() => navigation.navigate('HealthStatus')} />
                    <PrimaryButton
                        onPress={handleNext}
                        text="Next"
                        testID="symptomsNext"
                        disabled={submitting}
                        style={{
                            alignSelf: 'flex-end',
                            width: 'auto',
                            paddingVertical: 8,
                        }}
                        textStyle={{
                            fontSize: 16,
                            lineHeight: 20,
                        }}
                    >
                        <ChevronRightIcon style={{ marginLeft: 10 }} />
                    </PrimaryButton>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SymptomsScreen;
