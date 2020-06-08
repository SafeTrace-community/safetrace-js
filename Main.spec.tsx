import React, { Context } from 'react';
import { render, wait, act } from '@testing-library/react-native';
import Main from './Main';
import { PDAContext, IPDAContext } from './context/PDAContext';

import demographicInformationService from './services/DemographicInformationService';

jest.mock('./services/DemographicInformationService');

const mockDemographicInformationService: jest.Mocked<typeof demographicInformationService> = demographicInformationService as any;

describe('Main', () => {
    describe('logged out', () => {
        const pdaContext = {
            authenticateFromStoredToken: jest.fn(),
            isAuthenticated: false,
        } as Partial<IPDAContext>;

        test('rendering the Introduction when first opening the app and not being logged in', () => {
            const { getByTestId } = render(
                <PDAContext.Provider value={pdaContext as IPDAContext}>
                    <Main />
                </PDAContext.Provider>
            );

            expect(getByTestId('introductionScreen')).toBeTruthy();
        });

        test.skip('rendering the HealthStatus screen when Demographic information is stored on the device', async () => {
            mockDemographicInformationService.getDemographicInformation.mockResolvedValue(
                { age: 54, sex: 'female' }
            );

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
