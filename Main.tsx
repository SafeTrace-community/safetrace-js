import React, { FunctionComponent, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreatePDA from './screens/CreatePDA/CreatePDA';
import Tracking from './screens/Tracking';
import Landing from './screens/Landing';
import { HatContext } from './context/HatContext';
import ViewLocations from './screens/ViewLocations';
import DeleteAccount from './screens/DeleteAccount';
import Login from './screens/Login';
import Introduction from './screens/Introduction';

export type RootStackParamList = {
    // Specifying undefined means that the route is there but has no params
    // see: https://reactnavigation.org/docs/typescript/
    Introduction: undefined;
    Landing: undefined;
    CreateAccount: undefined;
    Login: undefined;
    Tracking: undefined;
    ViewLocations: undefined;
    DeleteAccount: undefined;
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
                            name="Tracking"
                            component={Tracking}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ViewLocations"
                            component={ViewLocations}
                            options={{
                                headerBackTitle: 'Back',
                                headerTitle: 'Location logs',
                            }}
                        />
                        <Stack.Screen
                            name="DeleteAccount"
                            component={DeleteAccount}
                            options={{
                                headerBackTitle: 'Back',
                                headerTitle: 'Delete Account?',
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
                            name="Landing"
                            component={Landing}
                            options={{ headerShown: false }}
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
