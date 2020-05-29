import React, { useState, useCallback } from 'react';
import {
    View,
    SafeAreaView,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import sharedStyles from '../../styles/shared';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Main';
import { RouteProp } from '@react-navigation/native';
import { PrimaryButton } from '../../components/PrimaryButton';
import pdaService from '../../services/PDAService';

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
    symptomCheck: {
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selected: {
        borderColor: '#167976',
        borderWidth: 1,
    },
});

const HealthCheckScreen: React.FunctionComponent<Props> = () => {
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
        } catch (err) {
            setError('An error occurred saving your health check');
        }

        setSubmitting(false);
    }, [declaredSymptoms]);

    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            {error && <View testID="error">{error}</View>}

            <View style={[sharedStyles.container]}>
                <Text>Symptoms</Text>
                {symptoms.map((symptom, index) => (
                    <TouchableOpacity
                        key={index}
                        accessible={true}
                        accessibilityLabel={symptom}
                        onPress={() => handleSymptomSelection(symptom)}
                        style={[
                            styles.symptomCheck,
                            symptomIsDeclared(symptom) && styles.selected,
                        ]}
                    >
                        <View>
                            <Text>{symptom}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <PrimaryButton
                    onPress={submitSymptoms}
                    testID="nextButton"
                    disabled={submitting}
                >
                    Next
                </PrimaryButton>
            </View>
        </SafeAreaView>
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
