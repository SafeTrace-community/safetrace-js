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

    describe('delete account', () => {
        test('calls delete account on PDAService and updates isAuthenticated from PDAservice', async () => {
            mockPdaService.isAuthenticated.mockReturnValue(false);

            const TestComponent: FunctionComponent = () => {
                const { isAuthenticated, deleteAccount } = useContext(
                    HatContext
                );

                return (
                    <>
                        <Text testID="isAuthenticated">
                            {isAuthenticated ? 'true' : 'false'}
                        </Text>
                        <Button
                            title="delete account"
                            testID="deleteAccountBtn"
                            onPress={() => deleteAccount()}
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'false'
            );
            const deleteAccountBtn = getByTestId('deleteAccountBtn');
            mockPdaService.isAuthenticated.mockReturnValue(true);

            fireEvent.press(deleteAccountBtn);

            await act(async () =>
                wait(() => {
                    expect(mockPdaService.deleteAccount).toBeCalled();

                    expect(
                        getByTestId('isAuthenticated').children.join('')
                    ).toEqual('true');
                })
            );
        });
    });
});
