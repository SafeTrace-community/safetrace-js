import { render, wait, fireEvent, act } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';

import { IPDAContext, PDAContext } from '../../context/PDAContext';
import Login from './Login';

jest.mock('expo', () => {
    return {
        Linking: {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        },
    };
});

jest.mock('expo-web-browser');

describe('Login screen', () => {
    test('showing an error if hat domain is not valid', async () => {
        const mockContext = { getLoginUrl: jest.fn() as any };

        mockContext.getLoginUrl.mockResolvedValue(['There was an error', null]);

        const { getByTestId } = render(
            <PDAContext.Provider value={mockContext as IPDAContext}>
                <Login navigation={{} as any} />
            </PDAContext.Provider>
        );

        const input = getByTestId('inputHatDomain');
        fireEvent.changeText(input, 'invalidhatname');

        const button = getByTestId('loginButton');
        fireEvent.press(button);
        await act(async () =>
            wait(() => {
                expect(getByTestId('loginError').props.children).toEqual(
                    'There was an error'
                );
            })
        );
    });

    test('opening the web browser to the valid hat URL', async () => {
        const mockContext = { getLoginUrl: jest.fn() as any };
        const validUrl = 'http://validurl.com';
        mockContext.getLoginUrl.mockResolvedValue([null, validUrl]);

        const { getByTestId } = render(
            <PDAContext.Provider value={mockContext as IPDAContext}>
                <Login navigation={{} as any} />
            </PDAContext.Provider>
        );

        const input = getByTestId('inputHatDomain');
        fireEvent.changeText(input, 'hatname');

        const button = getByTestId('loginButton');
        fireEvent.press(button);

        await wait(() => {
            expect(WebBrowser.openBrowserAsync).toBeCalledWith(validUrl);
        });
    });
});
