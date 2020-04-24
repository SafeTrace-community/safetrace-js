import React, { FunctionComponent, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAccount from './screens/CreateAccount';
import Tracking from './screens/Tracking';
import Landing from './screens/Landing';
import { HatContext } from './context/HatContext';
import ViewLocations from './screens/ViewLocations';
import DeleteAccount from './screens/DeleteAccount';

export type RootStackParamList = {
    // Specifying undefined means that the route doesn't have params
    // see: https://reactnavigation.org/docs/typescript/
    Tracking: undefined;
    ViewLocations: undefined;
    Landing: undefined;
    CreateAccount: undefined;
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
                            name="Landing"
                            component={Landing}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="CreateAccount"
                            options={{ headerShown: false }}
                            component={CreateAccount}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Main;
