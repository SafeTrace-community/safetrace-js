import React from 'react';
import {
    View,
    SafeAreaView,
    Text,
    Button,
    CheckBox,
    TouchableOpacity,
} from 'react-native';
import sharedStyles from '../../styles/shared';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Main';
import { RouteProp } from '@react-navigation/native';

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

const HealthCheckScreen: React.FunctionComponent<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container]}>
                <Text>Symptoms</Text>
                {symptoms.map((symptom, index) => (
                    <TouchableOpacity
                        key={index}
                        accessible={true}
                        accessibilityLabel={symptom}
                    >
                        <View>
                            <Text>{symptom}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
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
