import {
    render,
    fireEvent,
    wait,
    getByTestId,
    NativeTestInstance,
    act,
    queryByTestId,
} from '@testing-library/react-native';
import { Linking } from 'expo';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';

import { PDAContext } from '../../context/PDAContext';
import CreatePDA from './CreatePDA';

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

    function submitFormWithEmail(
        container: NativeTestInstance,
        email: string,
        username: string
    ) {
        const emailInput = getByTestId(container, 'emailInput');
        fireEvent.changeText(emailInput, email);

        const usernameInput = getByTestId(container, 'usernameInput');
        fireEvent.changeText(usernameInput, username);

        const createPDAButton = getByTestId(container, 'createPDA');
        fireEvent.press(createPDAButton);
    }

    test('opening the WebBrowser with the correct URI', async () => {
        const email = 'james@wemakewaves.digital';
        const username = 'james';
        const redirectUri = 'https//redirect';

        mockLinking.makeUrl.mockReturnValue(redirectUri);

        const { container } = render(<CreatePDA navigation={{} as any} />);

        submitFormWithEmail(container, email, username);

        await wait(() => {
            expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
                `https://hatters.dataswift.io/services/baas/signup?hat_name=${username}&email=${email}&application_id=sharetrace-dev&redirect_uri=${redirectUri}`
            );
        });
    });

    test('showing an error if nothing is entered in the email input', () => {
        const { container } = render(<CreatePDA navigation={{} as any} />);

        submitFormWithEmail(container, '', 'james');

        expect(getByTestId(container, 'emailError').props.children).toContain(
            'Please enter your email address'
        );
    });

    test('showing an error if nothing is entered in the username input', () => {
        const { container } = render(<CreatePDA navigation={{} as any} />);

        submitFormWithEmail(container, 'james@email.com', '');

        expect(
            getByTestId(container, 'usernameError').props.children
        ).toContain('Please enter a username');
    });

    test('resetting an error when changing value of email input after error', () => {
        const { container } = render(<CreatePDA navigation={{} as any} />);

        submitFormWithEmail(container, '', 'james');

        expect(getByTestId(container, 'emailError').props.children).toContain(
            'Please enter your email address'
        );

        const emailInput = getByTestId(container, 'emailInput');
        fireEvent.changeText(emailInput, 'j');

        expect(queryByTestId(container, 'emailError')).toBeFalsy();
    });

    describe('handling a redirect from Dataswift', () => {
        test('adding a listener for DS redirect', () => {
            const { container } = render(<CreatePDA navigation={{} as any} />);

            submitFormWithEmail(container, 'me@email.com', 'me');

            expect(mockLinking.addEventListener).toHaveBeenCalledWith(
                'url',
                expect.anything()
            );
        });

        test("removing the listener if there's an error opening the WebBrowser", async () => {
            const { container } = render(<CreatePDA navigation={{} as any} />);

            mockWebBrowser.openBrowserAsync.mockRejectedValue({});

            submitFormWithEmail(container, 'me@email.com', 'me');

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
                <PDAContext.Provider value={{ authenticateWithToken } as any}>
                    <CreatePDA navigation={{} as any} />
                </PDAContext.Provider>
            );

            submitFormWithEmail(container, 'me@email.com', 'me');

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
                <PDAContext.Provider
                    value={{ authenticateWithToken: jest.fn() } as any}
                >
                    <CreatePDA navigation={{} as any} />
                </PDAContext.Provider>
            );

            submitFormWithEmail(container, 'me@email.com', 'me');

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

        test('removing the listener for DS redirect on failure', () => {
            const { container } = render(
                <PDAContext.Provider
                    value={{ authenticateWithToken: jest.fn() } as any}
                >
                    <CreatePDA navigation={{} as any} />
                </PDAContext.Provider>
            );

            submitFormWithEmail(container, 'me@email.com', 'me');

            const handleRedirect =
                mockLinking.addEventListener.mock.calls[0][1];

            mockLinking.parse.mockReturnValue({
                path: 'signup-return',
                queryParams: { error: 'email_is_not_valid' },
            } as any);

            act(() => {
                handleRedirect({ url: '/signup-return' });
            });

            expect(mockLinking.removeEventListener).toHaveBeenCalledWith(
                'url',
                expect.anything()
            );
        });

        [
            {
                error: 'email_is_not_valid',
                expectedEmailError: 'Please enter a valid email address',
            },
            {
                error: 'email_is_required',
                expectedEmailError: 'Please enter your email address',
            },
            {
                error: 'email_already_taken',
                expectedEmailError: 'Email already registered',
            },
        ].forEach(({ error, expectedEmailError }) => {
            test(`showing an error when DS redirect returns ${error} email error`, () => {
                const { container } = render(
                    <PDAContext.Provider
                        value={{ authenticateWithToken: jest.fn() } as any}
                    >
                        <CreatePDA navigation={{} as any} />
                    </PDAContext.Provider>
                );

                submitFormWithEmail(container, 'me@email.com', 'me');

                const handleRedirect =
                    mockLinking.addEventListener.mock.calls[0][1];

                mockLinking.parse.mockReturnValue({
                    path: 'signup-return',
                    queryParams: { error },
                } as any);

                act(() => {
                    handleRedirect({ url: '/signup-return' });
                });

                expect(
                    getByTestId(container, 'emailError').props.children
                ).toContain(expectedEmailError);
            });
        });

        [
            {
                error: 'hat_name_is_required',
                expectedUsernameError: 'Please enter a valid username',
            },
            {
                error: 'hat_name_is_not_valid',
                expectedUsernameError:
                    'Username must be lowercase, between 4 and 24 characters and start with a letter',
            },
            {
                error: 'hat_name_already_taken',
                expectedUsernameError: 'That username is already taken',
            },
        ].forEach(({ error, expectedUsernameError }) => {
            test(`showing an error when DS redirect returns ${error} username/hat name error`, () => {
                const { container } = render(
                    <PDAContext.Provider
                        value={{ authenticateWithToken: jest.fn() } as any}
                    >
                        <CreatePDA navigation={{} as any} />
                    </PDAContext.Provider>
                );

                submitFormWithEmail(container, 'me@email.com', 'me');

                const handleRedirect =
                    mockLinking.addEventListener.mock.calls[0][1];

                mockLinking.parse.mockReturnValue({
                    path: 'signup-return',
                    queryParams: { error },
                } as any);

                act(() => {
                    handleRedirect({ url: '/signup-return' });
                });

                expect(
                    getByTestId(container, 'usernameError').props.children
                ).toContain(expectedUsernameError);
            });
        });
    });
});
