import React from 'react';
import {
    render,
    fireEvent,
    wait,
    GetByBoundProp,
    getByTestId,
    NativeTestInstance,
    act,
} from '@testing-library/react-native';
import CreatePDA from './CreatePDA';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'expo';
import { HatContext } from '../../context/HatContext';

jest.mock('expo-web-browser');
jest.mock('expo', () => {
    return {
        Linking: {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            makeUrl: jest.fn(),
            parse: jest.fn(),
        },
    };
});

const mockLinking: jest.Mocked<typeof Linking> = Linking as any;
const mockWebBrowser: jest.Mocked<typeof WebBrowser> = WebBrowser as any;

describe('Create PDA', () => {
    beforeEach(() => {
        mockLinking.addEventListener.mockReset();
        mockLinking.removeEventListener.mockReset();
        mockLinking.makeUrl.mockReset();
        mockLinking.parse.mockReset();
    });

    function submitFormWithEmail(container: NativeTestInstance, email: string) {
        const emailInput = getByTestId(container, 'emailInput');
        fireEvent.changeText(emailInput, email);

        const createPDAButton = getByTestId(container, 'createPDA');
        fireEvent.press(createPDAButton);
    }

    test('opening the WebBrowser with the correct URI', async () => {
        const email = 'james@wemakewaves.digital';
        const redirectUri = 'https//what';

        mockLinking.makeUrl.mockReturnValue(redirectUri);

        const { container } = render(<CreatePDA navigation={{} as any} />);

        submitFormWithEmail(container, email);

        await wait(() => {
            expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
                `https://hatters.dataswift.io/services/daas/signup?email=${email}&application_id=safe-trace-dev&redirect_uri=${redirectUri}`
            );
        });
    });

    describe('handling a redirect from Dataswift', () => {
        test('adding a listener for DS redirect', () => {
            const { container } = render(<CreatePDA navigation={{} as any} />);

            submitFormWithEmail(container, 'me@email.com');

            expect(mockLinking.addEventListener).toHaveBeenCalledWith(
                'url',
                expect.anything()
            );
        });

        test("removing the listener if there's an error opening the WebBrowser", async () => {
            const { container } = render(<CreatePDA navigation={{} as any} />);

            mockWebBrowser.openBrowserAsync.mockRejectedValue({});

            submitFormWithEmail(container, 'me@email.com');

            await wait(() =>
                expect(mockLinking.removeEventListener).toHaveBeenCalledWith(
                    'url',
                    expect.anything()
                )
            );
        });

        test('handling a redirect from Dataswift', () => {
            const authenticateWithToken = jest.fn();
            const token = 'dhfH£f4HJf4j43k£j4j£';

            const { container } = render(
                <HatContext.Provider value={{ authenticateWithToken } as any}>
                    <CreatePDA navigation={{} as any} />
                </HatContext.Provider>
            );

            submitFormWithEmail(container, 'me@email.com');

            const handleRedirect =
                mockLinking.addEventListener.mock.calls[0][1];

            mockLinking.parse.mockReturnValue({
                path: 'signup-return',
                queryParams: { token },
            } as any);

            handleRedirect({ url: '/signup-return' });

            expect(authenticateWithToken).toHaveBeenCalledWith(token);
        });

        test('removing the listener for DS redirect on success', () => {
            const { container } = render(
                <HatContext.Provider
                    value={{ authenticateWithToken: jest.fn() } as any}
                >
                    <CreatePDA navigation={{} as any} />
                </HatContext.Provider>
            );

            submitFormWithEmail(container, 'me@email.com');

            const handleRedirect =
                mockLinking.addEventListener.mock.calls[0][1];

            mockLinking.parse.mockReturnValue({
                path: 'signup-return',
                queryParams: { token: '123' },
            } as any);

            handleRedirect({ url: '/signup-return' });

            expect(mockLinking.removeEventListener).toHaveBeenCalledWith(
                'url',
                expect.anything()
            );
        });

        test('showing an error when DS redirect returns errors', () => {
            const { container } = render(
                <HatContext.Provider
                    value={{ authenticateWithToken: jest.fn() } as any}
                >
                    <CreatePDA navigation={{} as any} />
                </HatContext.Provider>
            );

            submitFormWithEmail(container, 'me@email.com');

            const handleRedirect =
                mockLinking.addEventListener.mock.calls[0][1];

            mockLinking.parse.mockReturnValue({
                path: 'signup-return',
                queryParams: { error: 'email_is_required' },
            } as any);

            act(() => {
                handleRedirect({ url: '/signup-return' });
            });

            expect(getByTestId(container, 'error').props.children).toContain(
                'email_is_required'
            );
        });
    });
});
