import React, { FunctionComponent, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreatePDA from './screens/CreatePDA/CreatePDA';
import GetStartedWithPDA from './screens/GetStartedWithPDA/GetStartedWithPDA';
import { HatContext } from './context/HatContext';
import Login from './screens/Login/Login';
import Introduction from './screens/Introduction';
import HealthStatusScreen from './screens/HealthStatus/HealthStatus';
import HealthCheckScreen from './screens/HealthCheck/HealthCheck';

export type RootStackParamList = {
    // Specifying undefined means that the route is there but has no params
    // see: https://reactnavigation.org/docs/typescript/
    Introduction: undefined;
    GetStartedWithPDA: undefined;
    CreateAccount: undefined;
    Login: undefined;
    Tracking: undefined;
    ViewLocations: undefined;
    DeleteAccount: undefined;
    HealthStatus: undefined;
    HealthCheck: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Main: FunctionComponent = () => {
    const { isAuthenticated, authenticateFromStoredToken } = useContext(
        HatContext
    );

    useEffect(() => {
        authenticateFromStoredToken();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen
                            name="HealthStatus"
                            component={HealthStatusScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="HealthCheck"
                            component={HealthCheckScreen}
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
