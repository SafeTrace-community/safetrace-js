import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import sharedStyles, { Colors } from '../../styles/shared';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Main';
import { RouteProp } from '@react-navigation/native';
import { PrimaryButton } from '../../components/PrimaryButton';
import pdaService from '../../services/PDAService';
import { ScrollView } from 'react-native-gesture-handler';
import CheckIcon from '../../assets/icons/check.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'HealthStatus'>;
};

const symptoms = [
    'Loss of smell or taste',
    'Skipped meals',
    'Fatigue',
    'Fever',
    'Persistent cough',
];

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'AvenirNext-Medium',
        marginBottom: 10,
    },
    small: {
        ...sharedStyles.text,
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 20,
    },
    error: {
        color: Colors.red,
        fontFamily: 'AvenirNext-Medium',
        marginBottom: 10,
    },
    progress: {
        marginBottom: 20,
    },
    progressBar: {
        backgroundColor: '#DEE2E1',
        borderRadius: 3,
        marginBottom: 15,
    },
    progressBarFill: {
        height: 6,
        width: '50%',
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    question: {
        fontFamily: 'AvenirNext-Medium',
        marginBottom: 15,
        fontSize: 16,
        lineHeight: 20,
    },
    symptomCheck: {
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 3,
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 8,
        alignItems: 'center',
        flexDirection: 'row',
    },
    symptomCheckBox: {
        width: 21,
        height: 21,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 3,
        marginRight: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedSymptomCheckBox: {
        backgroundColor: Colors.primary,
    },
    symptomCheckText: {
        fontFamily: 'AvenirNext',
    },
    selected: {
        borderColor: '#167976',
        borderWidth: 1,
    },
});

const HealthCheckScreen: React.FunctionComponent<Props> = ({ navigation }) => {
    const [declaredSymptoms, setDeclaredSymptoms] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const symptomIsDeclared = (symptom: string): boolean =>
        declaredSymptoms.some((ds) => ds === symptom);

    const handleSymptomSelection = (symptom: string): void => {
        let newSymptoms: string[];

        if (symptomIsDeclared(symptom)) {
            newSymptoms = declaredSymptoms.filter((ds) => ds !== symptom);
        } else {
            newSymptoms = [...declaredSymptoms, symptom];
        }

        setDeclaredSymptoms(newSymptoms);
    };

    const submitSymptoms = useCallback(async () => {
        setError(null);
        setSubmitting(true);

        try {
            await pdaService.writeHealthCheck({
                symptoms: declaredSymptoms,
            });

            navigation.navigate('HealthCheckSuccess');
        } catch (err) {
            console.error(err);
            setError('An error occurred saving your health check');
        }

        setSubmitting(false);
    }, [declaredSymptoms]);

    return (
        <ScrollView style={[sharedStyles.safeArea]}>
            <View style={[sharedStyles.container]}>
                <Text style={styles.title}>COVID-19 Symptom Checker</Text>

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
                            onPress={() => handleSymptomSelection(symptom)}
                        >
                            <View
                                style={[
                                    styles.symptomCheck,
                                    symptomIsDeclared(symptom) &&
                                        styles.selected,
                                ]}
                                testID="checkbox"
                            >
                                <View
                                    style={[
                                        styles.symptomCheckBox,
                                        symptomIsDeclared(symptom) &&
                                            styles.selectedSymptomCheckBox,
                                    ]}
                                >
                                    <CheckIcon />
                                </View>
                                <Text style={styles.symptomCheckText}>
                                    {symptom}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <PrimaryButton
                    onPress={submitSymptoms}
                    text="Next"
                    testID="nextButton"
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
    );
};

export default HealthCheckScreen;

// import { createStackNavigator } from '@react-navigation/stack';

// // export type HealthCheckStackParamList = {
// //     // Specifying undefined means that the route is there but has no params
// //     // see: https://reactnavigation.org/docs/typescript/
// //     Symptoms: undefined;
// //     PreExistingConditions: undefined;
// // };

// // const Stack = createStackNavigator<HealthCheckStackParamList>();

// stateSymptoms

// stateConditions

// (): Data

// return (
//     <Stack.Navigator>
//         <Stack.Screen
//             name="Symptoms"
//             component={SymptomsScreen}
//             options={{ headerShown: false }}
//         />
//         {/* <Stack.Screen
//             name="PreExistingConditions"
//             component={PreExistingConditionsScreen}
//             options={{ headerShown: false }}
//         /> */}
//     </Stack.Navigator>
// );
