import React, {
    FunctionComponent,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreatePDA from './screens/CreatePDA/CreatePDA';
import GetStartedWithPDA from './screens/GetStartedWithPDA/GetStartedWithPDA';
import { PDAContext } from './context/PDAContext';
import Login from './screens/Login/Login';
import Introduction from './screens/Introduction/Introduction';
import HealthStatusScreen from './screens/HealthStatus/HealthStatus';
import HealthSurveyScreen from './screens/HealthSurvey/HealthSurvey';
import { DemographicSurvey } from './screens/DemographicSurvey/DemographicSurvey';
import demographicInformationService from './services/DemographicInformationService';

export type RootStackParamList = {
    // Specifying undefined means that the route is there but has no params
    // see: https://reactnavigation.org/docs/typescript/
    Introduction: undefined;
    GetStartedWithPDA: undefined;
    CreateAccount: undefined;
    Login: undefined;
    HealthStatus: undefined;
    HealthSurvey: undefined;
    DemographicSurvey: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Main: FunctionComponent = () => {
    const {
        isInitialized,
        isAuthenticated,
        authenticateFromStoredToken,
        demographicInformation,
    } = useContext(PDAContext);

    useEffect(() => {
        authenticateFromStoredToken();
    }, []);

    if (!isInitialized) {
        // empty view while not initialised
        return <View testID="loading"></View>;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={
                    demographicInformation === null
                        ? 'Introduction'
                        : 'HealthStatus'
                }
            >
                {isAuthenticated ? (
                    <>
                        <Stack.Screen
                            name="HealthStatus"
                            component={HealthStatusScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="HealthSurvey"
                            component={HealthSurveyScreen}
                            options={{
                                headerShown: false,
                            }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="Introduction"
                            component={Introduction}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="DemographicSurvey"
                            component={DemographicSurvey}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="HealthStatus"
                            component={HealthStatusScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="GetStartedWithPDA"
                            component={GetStartedWithPDA}
                            options={{
                                headerBackTitle: 'Back',
                                headerTitle: '',
                            }}
                        />
                        <Stack.Screen
                            name="CreateAccount"
                            component={CreatePDA}
                            options={{
                                headerBackTitle: 'Back',
                                headerTitle: '',
                            }}
                        />
                        <Stack.Screen
                            name="Login"
                            component={Login}
                            options={{
                                headerBackTitle: 'Back',
                                headerTitle: 'Login with PDA',
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Main;
