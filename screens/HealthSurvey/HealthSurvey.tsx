import React, { useState, useCallback } from 'react';
import {
    createStackNavigator,
    StackNavigationProp,
} from '@react-navigation/stack';
import SymptomsScreen from './Symptoms';
import { RootStackParamList } from '../../Main';
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import sharedStyles, { Colors } from '../../styles/shared';
import pdaService from '../../services/PDAService';
import PreExistingConditions from './PreExistingConditions';

export type HealthSurveyStackParamList = {
    // Specifying undefined means that the route is there but has no params
    // see: https://reactnavigation.org/docs/typescript/
    Symptoms: undefined;
    PreExistingConditions: undefined;
};

const Stack = createStackNavigator<HealthSurveyStackParamList>();

export type HealthSurveyNavigationProp = CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    StackNavigationProp<HealthSurveyStackParamList>
>;

type Props = {
    navigation: HealthSurveyNavigationProp;
    route?: RouteProp<RootStackParamList, 'HealthSurvey'>;
};

export const healthSurveyStyles = StyleSheet.create({
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
    check: {
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 3,
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 8,
        alignItems: 'center',
        flexDirection: 'row',
    },
    checkBox: {
        width: 21,
        height: 21,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 3,
        marginRight: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCheckbox: {
        backgroundColor: Colors.primary,
    },
    checkText: {
        fontFamily: 'AvenirNext',
    },
    selected: {
        borderColor: '#167976',
        borderWidth: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 50,
    },
});

const isSelected = (collection: string[], selection: string): boolean =>
    collection.some((ds) => ds === selection);

const toggleSelection = (collection: string[], selection: string): string[] => {
    let newCollection: string[];

    if (isSelected(collection, selection)) {
        newCollection = collection.filter((ds) => ds !== selection);
    } else {
        newCollection = [...collection, selection];
    }

    return newCollection;
};

const HealthSurveyScreen: React.FunctionComponent<Props> = ({ navigation }) => {
    const [error, setError] = useState<string | null>(null);
    const [declaredSymptoms, setDeclaredSymptoms] = useState<string[]>([]);
    const [
        declaredPreExistingConditions,
        setDeclaredPreExistingConditions,
    ] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const submitHealthSurvey = useCallback(async () => {
        setError(null);
        setSubmitting(true);

        try {
            await pdaService.writeHealthSurvey({
                symptoms: declaredSymptoms,
                preExistingConditions: declaredPreExistingConditions,
            });

            navigation.navigate('HealthSurveySuccess');
        } catch (err) {
            console.error(err);
            setError('An error occurred saving your health check');
        }

        setSubmitting(false);
    }, [declaredSymptoms, declaredPreExistingConditions]);

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="PreExistingConditions"
                options={{ headerShown: false }}
            >
                {(props) => (
                    <PreExistingConditions
                        {...props}
                        isSelected={(condition) =>
                            isSelected(declaredPreExistingConditions, condition)
                        }
                        handleSelection={(condition) => {
                            const newPreExistingConditions = toggleSelection(
                                declaredPreExistingConditions,
                                condition
                            );
                            setDeclaredPreExistingConditions(
                                newPreExistingConditions
                            );
                        }}
                        error={error}
                        submitting={submitting}
                        handleNext={() => props.navigation.navigate('Symptoms')}
                    />
                )}
            </Stack.Screen>
            <Stack.Screen name="Symptoms" options={{ headerShown: false }}>
                {(props) => (
                    <SymptomsScreen
                        {...props}
                        isSelected={(symptom) =>
                            isSelected(declaredSymptoms, symptom)
                        }
                        handleSelection={(symptom) => {
                            const newSymptoms = toggleSelection(
                                declaredSymptoms,
                                symptom
                            );
                            setDeclaredSymptoms(newSymptoms);
                        }}
                        error={error}
                        submitting={submitting}
                        handleNext={submitHealthSurvey}
                    />
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
};

export default HealthSurveyScreen;
