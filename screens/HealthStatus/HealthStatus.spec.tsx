import React from 'react';
import HealthStatusScreen from './HealthStatus';
import { render, fireEvent } from '@testing-library/react-native';
import { IHatContext, HatContext } from '../../context/HatContext';
describe('Health status screen', () => {
    test('providing link to creating a hat', () => {
        const navigationStub = {
            navigate: jest.fn(),
        };
        const { getByTestId } = render(
            <HealthStatusScreen navigation={navigationStub as any} />
        );
        expect(getByTestId('createPersonalDataAccount')).toBeTruthy();

        fireEvent.press(getByTestId('createPersonalDataAccount'));

        expect(navigationStub.navigate).toBeCalledWith('GetStartedWithHat');
    });

    test('disabled link to providing preliminary health check if not signed into a HAT', () => {
        const navigationStub = {
            navigate: jest.fn(),
        };
        const { getByTestId } = render(
            <HealthStatusScreen navigation={navigationStub as any} />
        );
        expect(getByTestId('provideProvisionalHealthCheck')).toBeTruthy();

        fireEvent.press(getByTestId('provideProvisionalHealthCheck'));

        expect(navigationStub.navigate).not.toBeCalledWith('HealthCheck');
    });

    test('showing creating a PDA step complete once signed into a HAT', () => {
        const navigationStub = {
            navigate: jest.fn(),
        };
        const mockHatContext = { isAuthenticated: true } as IHatContext;

        const { getByTestId } = render(
            <HatContext.Provider value={mockHatContext}>
                <HealthStatusScreen navigation={navigationStub as any} />
            </HatContext.Provider>
        );

        expect(getByTestId('createPersonalDataAccountComplete')).toBeTruthy();
    });

    test('enabling link to providing preliminary health check if signed into HAT', () => {
        const navigationStub = {
            navigate: jest.fn(),
        };
        const mockHatContext = { isAuthenticated: true } as IHatContext;

        const { getByTestId } = render(
            <HatContext.Provider value={mockHatContext}>
                <HealthStatusScreen navigation={navigationStub as any} />
            </HatContext.Provider>
        );

        expect(getByTestId('provideProvisionalHealthCheck')).toBeTruthy();

        fireEvent.press(getByTestId('provideProvisionalHealthCheck'));

        expect(navigationStub.navigate).toBeCalledWith('HealthCheck');
    });
});
