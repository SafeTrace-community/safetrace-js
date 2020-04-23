import React, { useContext, FunctionComponent, useEffect } from 'react';
import { render, cleanup, act, wait } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('../services/HATService');
jest.mock('expo-secure-store');
import * as SecureStore from 'expo-secure-store';

import HatProvider, { HatContext } from './HatContext';
import hatService, { HATService } from '../services/HATService';
const mockedHatService = hatService as jest.Mocked<HATService>;

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
        test('default value is whatever the HatService.isAuthenticated returns (true)', () => {
            mockedHatService.isAuthenticated.mockReturnValue(true);

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

        test('default value is whatever the HatService.isAuthenticated returns (false)', () => {
            mockedHatService.isAuthenticated.mockReturnValue(false);

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
            mockedHatService.authenticate.mockResolvedValue();

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

            mockedHatService.isAuthenticated.mockReturnValue(true);

            await act(async () => {
                await wait(() =>
                    expect(hatService.authenticate).toBeCalledWith(TOKEN)
                );

                await wait(() =>
                    expect(
                        getByTestId('isAuthenticated').children.join('')
                    ).toEqual('true')
                );
            });
        });
    });
});
