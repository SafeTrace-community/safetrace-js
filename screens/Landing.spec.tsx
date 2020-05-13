import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Landing from './Landing';
import * as WebBrowser from 'expo-web-browser';

jest.mock('expo-web-browser');

describe('Landing screen', () => {
    test('having create account button', () => {
        const { getByTestId } = render(<Landing navigation={{} as any} />);
        expect(getByTestId('createAccountButton')).toBeTruthy();
    });

    test('being able to log in', () => {
        const navigateStub = jest.fn();
        const { getByTestId } = render(
            <Landing navigation={{ navigate: navigateStub } as any} />
        );
        expect(getByTestId('loginButton')).toBeTruthy();

        fireEvent.press(getByTestId('loginButton'));

        expect(navigateStub).toHaveBeenCalledWith('Login');
    });

    test('being to learn more about HATs', () => {
        const { getByTestId } = render(<Landing navigation={{} as any} />);

        fireEvent.press(getByTestId('learnMoreLink'));

        expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
            'https://www.safetrace.io/'
        );
    });
});
