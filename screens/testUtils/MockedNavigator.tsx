import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

const Stack = createStackNavigator();
const MockedNavigator = ({
    ComponentForScreen,
    propOverrides = {},
    params = {},
}: {
    ComponentForScreen: any;
    propOverrides?: any;
    params?: any;
}) => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="MockedScreen">
                    {(props) => (
                        <ComponentForScreen {...props} {...propOverrides} />
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default MockedNavigator;
