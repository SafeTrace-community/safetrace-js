import React, { useContext, FunctionComponent, useEffect } from 'react';
import {
    render,
    cleanup,
    act,
    wait,
    fireEvent,
} from '@testing-library/react-native';
import { Text, Button } from 'react-native';

jest.mock('../services/PDAService');
jest.mock('expo-secure-store');
import * as SecureStore from 'expo-secure-store';

import HatProvider, { HatContext } from './HatContext';
import pdaService, { PDAService } from '../services/PDAService';
const mockPdaService = pdaService as jest.Mocked<PDAService>;

describe('HatContext provider', () => {
    beforeEach(cleanup);

    function renderComponent(Component: FunctionComponent) {
        return render(
            <HatProvider>
                <Component />
            </HatProvider>
        );
    }

    describe('is authenticated', () => {
        test('default value is whatever the PDAService.isAuthenticated returns (true)', () => {
            mockPdaService.isAuthenticated.mockReturnValue(true);

            const TestComponent: FunctionComponent = () => {
                const { isAuthenticated } = useContext(HatContext);

                return (
                    <Text testID="isAuthenticated">
                        {isAuthenticated ? 'true' : 'false'}
                    </Text>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'true'
            );
        });

        test('default value is whatever the PDAService.isAuthenticated returns (false)', () => {
            mockPdaService.isAuthenticated.mockReturnValue(false);

            const TestComponent: FunctionComponent = () => {
                const { isAuthenticated } = useContext(HatContext);

                return (
                    <Text testID="isAuthenticated">
                        {isAuthenticated ? 'true' : 'false'}
                    </Text>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'false'
            );
        });
    });

    describe('authenticateFromStoredToken', () => {
        test('calling authenticate on the hat service from a stored token', async () => {
            const TOKEN = '12345';

            //@ts-ignore
            SecureStore.getItemAsync.mockResolvedValue(TOKEN);
            mockPdaService.authenticate.mockResolvedValue();

            const TestComponent: FunctionComponent = () => {
                const {
                    isAuthenticated,
                    authenticateFromStoredToken,
                } = useContext(HatContext);

                useEffect(() => {
                    authenticateFromStoredToken();
                }, []);

                return (
                    <Text testID="isAuthenticated">
                        {isAuthenticated ? 'true' : 'false'}
                    </Text>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);

            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'false'
            );

            mockPdaService.isAuthenticated.mockReturnValue(true);

            await act(async () => {
                await wait(() =>
                    expect(pdaService.authenticate).toBeCalledWith(TOKEN)
                );

                await wait(() =>
                    expect(
                        getByTestId('isAuthenticated').children.join('')
                    ).toEqual('true')
                );
            });
        });
    });

    describe('log out of PDA', () => {
        test('calls logout PDAService and updates isAuthenticated from PDAservice', async () => {
            mockPdaService.isAuthenticated.mockReturnValue(false);

            const TestComponent: FunctionComponent = () => {
                const { isAuthenticated, logout } = useContext(HatContext);

                return (
                    <>
                        <Text testID="isAuthenticated">
                            {isAuthenticated ? 'true' : 'false'}
                        </Text>
                        <Button
                            title="delete account"
                            testID="logoutButton"
                            onPress={() => logout()}
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'false'
            );
            const logoutButton = getByTestId('logoutButton');
            mockPdaService.isAuthenticated.mockReturnValue(true);

            fireEvent.press(logoutButton);

            await act(async () =>
                wait(() => {
                    expect(mockPdaService.logout).toBeCalled();

                    expect(
                        getByTestId('isAuthenticated').children.join('')
                    ).toEqual('true');
                })
            );
        });
    });

    describe('getting health surveys', () => {
        test('setting health surveys in context via getHealthSurveys', async () => {
            const healthSurveys: st.HealthSurvey[] = [
                { symptoms: ['fatigue'], timestamp: Date.now() },
            ];

            mockPdaService.getHealthSurveys.mockResolvedValue(healthSurveys);

            const TestComponent: FunctionComponent = () => {
                const { getHealthSurveys, healthSurveys } = useContext(
                    HatContext
                );

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                        <Button
                            title="getHealthSurveys"
                            testID="getHealthSurveys"
                            onPress={() => getHealthSurveys()}
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('healthSurveys').children.join('')).toEqual(
                JSON.stringify([])
            );

            fireEvent.press(getByTestId('getHealthSurveys'));

            await act(async () =>
                wait(() => {
                    expect(mockPdaService.getHealthSurveys).toBeCalled();

                    expect(
                        getByTestId('healthSurveys').children.join('')
                    ).toEqual(JSON.stringify(healthSurveys));
                })
            );
        });
    });
});
