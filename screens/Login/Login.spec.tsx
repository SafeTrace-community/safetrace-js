import React from 'react';
import { render, wait, fireEvent, act } from '@testing-library/react-native';
import Login from './Login';
import { IHatContext, HatContext } from '../../context/HatContext';
import * as WebBrowser from 'expo-web-browser';

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
            <HatContext.Provider value={mockContext as IHatContext}>
                <Login navigation={{} as any} />
            </HatContext.Provider>
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
            <HatContext.Provider value={mockContext as IHatContext}>
                <Login navigation={{} as any} />
            </HatContext.Provider>
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
