import React from 'react';
import {
    HealthSurveyStackParamList,
    healthSurveyStyles as styles,
    HealthSurveyNavigationProp,
} from './HealthSurvey';
import { RouteProp } from '@react-navigation/native';
import sharedStyles from '../../styles/shared';
import { ScrollView } from 'react-native-gesture-handler';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import CheckIcon from '../../assets/icons/check.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import Back from '../../components/Back';

type Props = {
    navigation: HealthSurveyNavigationProp;
    route?: RouteProp<HealthSurveyStackParamList, 'PreExistingConditions'>;
    handleSelection: (selection: string) => void;
    isSelected: (selection: string) => boolean;
    submitting: boolean;
    error: string | null;
    handleNext: () => void;
};

const preExistingConditions = [
    'Asthma or chronic lung conditions',
    'Pregnancy',
    'Diabetes',
    'Kidney failure',
    'Cirrhosis of the liver',
    'Weakened immune system',
    'Congestive heart failure',
    'Extreme obesity',
];

const PreExistingConditions: React.FunctionComponent<Props> = ({
    navigation,
    handleSelection,
    isSelected,
    submitting,
    error,
    handleNext,
}) => {
    return (
        <SafeAreaView style={[sharedStyles.safeArea]}>
            <ScrollView style={[sharedStyles.container]}>
                <Text style={styles.title}>Health Status</Text>

                {error && (
                    <Text testID="error" style={styles.error}>
                        {error}
                    </Text>
                )}

                <Text style={[sharedStyles.text, styles.small]}>
                    Answer the following questions to learn how your health
                    status impacts your Covid-19 status.
                </Text>

                <View style={styles.progress}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressBarFill]}></View>
                    </View>
                    <Text
                        style={[sharedStyles.text, { alignSelf: 'flex-end' }]}
                    >
                        1/2
                    </Text>
                </View>

                <Text style={styles.question}>
                    Do you have any of the following pre-existing health
                    conditions?
                </Text>

                <Text style={sharedStyles.text}>
                    If not, click "Next" button to proceed.
                </Text>

                <View style={{ paddingVertical: 20 }}>
                    {preExistingConditions.map((condition, index) => (
                        <TouchableOpacity
                            key={index}
                            accessible={true}
                            accessibilityLabel={condition}
                            onPress={() => handleSelection(condition)}
                        >
                            <View
                                style={[
                                    styles.check,
                                    isSelected(condition) && styles.selected,
                                ]}
                                testID="checkbox"
                            >
                                <View
                                    style={[
                                        styles.checkBox,
                                        isSelected(condition) &&
                                            styles.selectedCheckbox,
                                    ]}
                                >
                                    <CheckIcon />
                                </View>
                                <Text style={styles.checkText}>
                                    {condition}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.actions}>
                    <Back onPress={() => navigation.navigate('Symptoms')} />

                    <PrimaryButton
                        onPress={handleNext}
                        text="Next"
                        testID="preExistingConditionsNext"
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

export default PreExistingConditions;
