import React from 'react';
import { render, wait, act } from '@testing-library/react-native';
import Main from './Main';
import { HatContext, IHatContext } from './context/HatContext';

import demographicInformationService from './services/DemographicInformationService';

jest.mock('./services/DemographicInformationService');

const mockDemographicInformationService: jest.Mocked<typeof demographicInformationService> = demographicInformationService as any;

describe('Main', () => {
    describe('logged out', () => {
        const hatContext = {
            authenticateFromStoredToken: jest.fn(),
            isAuthenticated: false,
        } as Partial<IHatContext>;

        test('rendering the Introduction when first opening the app and not being logged in', () => {
            const { getByTestId } = render(
                <HatContext.Provider value={hatContext as IHatContext}>
                    <Main />
                </HatContext.Provider>
            );

            expect(getByTestId('introductionScreen')).toBeTruthy();
        });

        test('rendering the HealthStatus screen when Demographic information is stored on the device', async () => {
            mockDemographicInformationService.getDemographicInformation.mockResolvedValue(
                { age: 54, sex: 'female' }
            );

            const { getByTestId } = render(
                <HatContext.Provider value={hatContext as IHatContext}>
                    <Main />
                </HatContext.Provider>
            );

            await act(async () => {
                await wait(() =>
                    expect(getByTestId('healthStatusScreen')).toBeTruthy()
                );
            });
        });
    });
});
