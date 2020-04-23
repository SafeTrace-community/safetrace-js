import React, { FunctionComponent, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreateAccount from './screens/CreateAccount';
import Tracking from './screens/Tracking';
import Landing from './screens/Landing';
import { HatContext } from './context/HatContext';

const Stack = createStackNavigator();

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
