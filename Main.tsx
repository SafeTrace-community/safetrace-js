import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { FunctionComponent, useContext, useEffect } from 'react';
import { View } from 'react-native';

import { PDAContext } from './context/PDAContext';
import CreatePDA from './screens/CreatePDA/CreatePDA';
import DemographicSurveyScreen from './screens/DemographicSurvey/DemographicSurvey';
import GetStartedWithPDA from './screens/GetStartedWithPDA/GetStartedWithPDA';
import HealthStatusScreen from './screens/HealthStatus/HealthStatus';
import HealthSurveyScreen from './screens/HealthSurvey/HealthSurvey';
import Introduction from './screens/Introduction/Introduction';
import Login from './screens/Login/Login';

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
        return <View testID="loading" />;
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
                            component={DemographicSurveyScreen}
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
