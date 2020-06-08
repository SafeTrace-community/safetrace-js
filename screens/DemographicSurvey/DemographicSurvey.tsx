import React, { FunctionComponent, useState, useCallback } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Main';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { Input } from '../../components/Input';
import sharedStyles, { Colors } from '../../styles/shared';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RadioButton } from '../../components/RadioButton/RadioButton';
import demographicInformationService from '../../services/DemographicInformationService';
import styled from 'styled-components/native';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

const Title = styled.Text`
    font-size: 20px;
    line-height: 24px;
    font-family: 'AvenirNext-Medium';
    margin-bottom: 20px;
`;

const SupportingCopy = styled.Text`
    font-size: 16px;
    line-height: 20px;
    margin-bottom: 35px;
    font-family: 'AvenirNext';
    color: ${Colors.dark};
`;

const Question = styled.Text`
    font-family: 'AvenirNext-Medium';
    margin-bottom: 15px;
    font-size: 16px;
    line-height: 20px;
`;

const FormField = styled.View`
    margin-bottom: 30px;
`;

const FormActions = styled.View`
    margin-top: auto;
`;

const Error = styled.Text`
    color: ${Colors.red};
    margin-bottom: 5px;
`;

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'HealthSurvey'>;
};

type FormOptions = {
    age?: number;
    sex?: 'male' | 'female';
};

export const DemographicSurvey: FunctionComponent<Props> = ({ navigation }) => {
    const [demographic, setDemographic] = useState<FormOptions>();
    const [ageError, setAgeError] = useState<string | null>(null);
    const [sexError, setSexError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const selectSex = useCallback(
        (sex: 'male' | 'female') => {
            Keyboard.dismiss();
            setSexError(null);
            setDemographic({ ...demographic, sex });
        },
        [demographic]
    );

    const clearErrors = () => {
        setAgeError(null);
        setSexError(null);
    };

    const validateForm = useCallback((): boolean => {
        clearErrors();
        let isValid = true;

        if (!demographic || demographic.age === null) {
            setAgeError('Please enter your age');
            isValid = false;
        }

        if (!demographic || demographic.sex === null) {
            setSexError('Please indicate if you are biologically male');
            isValid = false;
        }

        return isValid;
    }, [demographic]);

    const saveDemographicInformation = async () => {
        setSubmitting(true);

        if (!validateForm()) {
            setSubmitting(false);
            return;
        }

        await demographicInformationService.saveDemographicInformation(
            demographic as st.Demographic
        );

        setSubmitting(false);
        navigation.navigate('HealthStatus');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={sharedStyles.safeArea}>
                <View style={[sharedStyles.container, styles.container]}>
                    <Title>Demographic Information</Title>

                    <SupportingCopy>
                        Please provide the following information about yourself
                        related to risks associated with COVID-19
                    </SupportingCopy>

                    <FormField>
                        <Question>What is your age?</Question>

                        {ageError && (
                            <Error testID="ageError">{ageError}</Error>
                        )}

                        <Input
                            onChangeText={(age) => {
                                setAgeError(null);
                                setDemographic({
                                    ...demographic,
                                    age: Number(age),
                                });
                            }}
                            value={
                                (demographic &&
                                    demographic.age &&
                                    String(demographic.age)) as
                                    | string
                                    | undefined
                            }
                            accessibilityLabel="What is your age?"
                            placeholder="e.g. 35"
                            keyboardType="number-pad"
                            autoCapitalize="none"
                        />
                    </FormField>

                    <FormField>
                        <Question>Were you born biologically male?</Question>

                        {sexError && (
                            <Error testID="sexError">{sexError}</Error>
                        )}

                        <RadioButton
                            label="Yes"
                            onPress={() => selectSex('male')}
                            isSelected={
                                !!(demographic && demographic.sex === 'male')
                            }
                            testID="maleRadio"
                            style={{ marginBottom: 10 }}
                        />

                        <RadioButton
                            label="No"
                            onPress={() => selectSex('female')}
                            isSelected={
                                !!(demographic && demographic.sex === 'female')
                            }
                            testID="femaleRadio"
                        />
                    </FormField>

                    <FormActions>
                        <PrimaryButton
                            onPress={saveDemographicInformation}
                            text={submitting ? 'Submitting' : 'Next'}
                            testID="nextButton"
                            disabled={submitting}
                            style={[
                                {
                                    alignSelf: 'flex-end',
                                    width: 'auto',
                                    paddingVertical: 8,
                                },
                                submitting && { opacity: 0.8 },
                            ]}
                            textStyle={{
                                fontSize: 16,
                                lineHeight: 20,
                            }}
                        >
                            {!submitting && (
                                <ChevronRightIcon style={{ marginLeft: 10 }} />
                            )}
                            {submitting && (
                                <ActivityIndicator
                                    color="white"
                                    style={{ marginLeft: 10 }}
                                />
                            )}
                        </PrimaryButton>
                    </FormActions>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};
