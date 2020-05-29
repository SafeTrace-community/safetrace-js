import React, { FunctionComponent, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAccount from './screens/CreateAccount';
import Tracking from './screens/Tracking';
import Landing from './screens/Landing';
import { HatContext } from './context/HatContext';
import ViewLocations from './screens/ViewLocations';
import DeleteAccount from './screens/DeleteAccount';
import Login from './screens/Login';
import Introduction from './screens/Introduction';
import HealthStatusScreen from './screens/HealthStatus/HealthStatus';
import HealthCheckScreen from './screens/HealthCheck/HealthCheck';

export type RootStackParamList = {
    // Specifying undefined means that the route is there but has no params
    // see: https://reactnavigation.org/docs/typescript/
    Introduction: undefined;
    GetStartedWithHat: undefined;
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
                            name="GetStartedWithHat"
                            component={Landing}
                            options={{
                                headerBackTitle: 'Back',
                                headerTitle: '',
                            }}
                        />
                        <Stack.Screen
                            name="CreateAccount"
                            component={CreateAccount}
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
                                headerTitle: 'Login',
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Main;
