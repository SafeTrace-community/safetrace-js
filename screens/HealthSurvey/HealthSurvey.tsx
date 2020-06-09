import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useCallback, useContext } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';

import { RootStackParamList } from '../../Main';
import CheckIcon from '../../assets/icons/check.svg';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import Back from '../../components/Back';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PDAContext } from '../../context/PDAContext';
import sharedStyles, { Colors } from '../../styles/shared';

export const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'AvenirNext-Medium',
        marginBottom: 10,
    },
    small: {
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

export type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'HealthSurvey'>;
};

const isSelected = (collection: string[], selection: string): boolean =>
    collection.some((ds) => ds === selection.toLowerCase());

const toggleSelection = (collection: string[], selection: string): string[] => {
    let newCollection: string[];

    if (isSelected(collection, selection)) {
        newCollection = collection.filter(
            (ds) => ds !== selection.toLowerCase()
        );
    } else {
        newCollection = [...collection, selection.toLowerCase()];
    }

    return newCollection;
};

const symptoms = [
    'Loss of smell and taste',
    'Severe or significant persistent cough',
    'Severe fatigue',
    'Skipped meals',
];

const HealthSurveyScreen: React.FunctionComponent<Props> = ({ navigation }) => {
    const [error, setError] = useState<string | null>(null);
    const [declaredSymptoms, setDeclaredSymptoms] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const { writeHealthSurvey } = useContext(PDAContext);
    const submitHealthSurvey = useCallback(async () => {
        setError(null);
        setSubmitting(true);

        try {
            await writeHealthSurvey({
                symptoms: declaredSymptoms,
                timestamp: Date.now(),
            });

            navigation.navigate('HealthStatus');
        } catch (err) {
            console.error(err);
            setError('An error occurred saving your health check');
        }

        setSubmitting(false);
    }, [declaredSymptoms]);

    return (
        <SafeAreaView style={[sharedStyles.safeArea]}>
            <ScrollView style={[sharedStyles.container]}>
                <Text style={styles.title}>Health Status</Text>

                <Text style={sharedStyles.text}>
                    Have you experienced any of these in the last 7 days?
                </Text>

                <View style={{ paddingVertical: 20 }}>
                    {symptoms.map((symptom, index) => (
                        <TouchableOpacity
                            key={index}
                            accessible
                            accessibilityLabel={symptom}
                            onPress={() => {
                                const newSymptoms = toggleSelection(
                                    declaredSymptoms,
                                    symptom
                                );
                                setDeclaredSymptoms(newSymptoms);
                            }}
                        >
                            <View
                                style={[
                                    styles.check,
                                    isSelected(declaredSymptoms, symptom) &&
                                        styles.selected,
                                ]}
                                testID="checkbox"
                            >
                                <View
                                    style={[
                                        styles.checkBox,
                                        isSelected(declaredSymptoms, symptom) &&
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

                {error && (
                    <Text testID="error" style={styles.error}>
                        {error}
                    </Text>
                )}

                <View style={styles.actions}>
                    <Back
                        onPress={() => {
                            !submitting && navigation.navigate('HealthStatus');
                        }}
                    />
                    <PrimaryButton
                        onPress={submitHealthSurvey}
                        text={submitting ? 'Submitting' : 'Next'}
                        testID="symptomsNext"
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
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HealthSurveyScreen;
