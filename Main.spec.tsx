import { render, wait, act } from '@testing-library/react-native';
import React from 'react';

import Main from './Main';
import { PDAContext, IPDAContext } from './context/PDAContext';

describe('Main', () => {
    test('rendering a loading screen until the app is initialized', async () => {
        const pdaContext = {
            authenticateFromStoredToken: jest.fn(),
            isAuthenticated: false,
            isInitialized: false,
        } as Partial<IPDAContext>;

        const { getByTestId } = render(
            <PDAContext.Provider value={pdaContext as IPDAContext}>
                <Main />
            </PDAContext.Provider>
        );

        await act(async () => {
            await wait(() => expect(getByTestId('loading')).toBeTruthy());
        });
    });

    describe('logged out', () => {
        test('rendering the Introduction when first opening the app and not being logged in', () => {
            const pdaContext = {
                authenticateFromStoredToken: jest.fn(),
                demographicInformation: null,
                isAuthenticated: false,
                isInitialized: true,
            } as Partial<IPDAContext>;

            const { getByTestId } = render(
                <PDAContext.Provider value={pdaContext as IPDAContext}>
                    <Main />
                </PDAContext.Provider>
            );

            expect(getByTestId('introductionScreen')).toBeTruthy();
        });

        test('rendering a loading screen until the app is initialized', async () => {
            const pdaContext = {
                authenticateFromStoredToken: jest.fn(),
                demographicInformation: {
                    age: 29,
                    sex: 'male',
                },
                isAuthenticated: false,
                isInitialized: true,
            } as Partial<IPDAContext>;

            const { getByTestId } = render(
                <PDAContext.Provider value={pdaContext as IPDAContext}>
                    <Main />
                </PDAContext.Provider>
            );

            await act(async () => {
                await wait(() =>
                    expect(getByTestId('healthStatusScreen')).toBeTruthy()
                );
            });
        });
    });
});
