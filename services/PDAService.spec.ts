import { HatClient } from '@dataswift/hat-js';

import pdaService, { PDAService } from './PDAService';

jest.useFakeTimers();
jest.mock('expo-secure-store');

jest.mock('expo', () => {
    return {
        Linking: {
            makeUrl: jest.fn().mockReturnValue(''),
        },
    };
});

jest.mock('@dataswift/hat-js', () => ({
    HatClient: jest.fn().mockImplementation(() => {
        return {
            hatData: jest.fn().mockReturnValue({
                create: jest.fn().mockResolvedValue({ parsedBody: {} }),
                getAll: jest.fn().mockResolvedValue({ parsedBody: {} }),
            }),
            auth: jest.fn().mockReturnValue({
                signOut: jest.fn(),
                generateHatLoginUrl: jest.fn(),
                isDomainRegistered: jest.fn(),
            }),
        };
    }),
}));

const mockHatClient: jest.Mock<HatClient> = HatClient as any;

describe('PDAService', () => {
    beforeEach(() => {
        mockHatClient.mock.results[0].value.hatData().create.mockReset();
    });

    describe('getting login url', () => {
        test('returning an error if the HAT URL is invalid', async () => {
            mockHatClient.mock.results[0].value
                .auth()
                .isDomainRegistered.mockResolvedValue(false);
            const [error] = await pdaService.getLoginUrl('invalid-hat-url.net');
            expect(error).toEqual('The HAT url supplied is not valid');
        });

        test('calling the generateHatLoginUrl HAT SDK with the correct params', async () => {
            mockHatClient.mock.results[0].value
                .auth()
                .isDomainRegistered.mockResolvedValue(true);
            const hatDomain = 'mypdhat.hubat.net';
            const mockedRedirectLink = '';
            const mockedFallbackLink = '';

            await pdaService.getLoginUrl('mypdhat.hubat.net');

            expect(
                mockHatClient.mock.results[0].value.auth().generateHatLoginUrl
            ).toBeCalledWith(
                hatDomain,
                PDAService.APPLICATION_ID,
                mockedRedirectLink,
                mockedFallbackLink
            );
        });

        test('returning no error and the url if all goes well', async () => {
            mockHatClient.mock.results[0].value
                .auth()
                .isDomainRegistered.mockResolvedValue(true);

            const urlReturned = 'https://mypdhat.hubat.net/auth';
            mockHatClient.mock.results[0].value
                .auth()
                .generateHatLoginUrl.mockReturnValue(urlReturned);

            const [error, url] = await pdaService.getLoginUrl(
                'mypdhat.hubat.net'
            );

            expect(error).toBe(null);
            expect(url).toBe(`https://${urlReturned}`);
        });
    });

    describe('logging out of a PDA', () => {
        test('signing out of the HAT via SDK', async () => {
            await pdaService.logout();
            expect(
                mockHatClient.mock.results[0].value.auth().signOut
            ).toBeCalled();
        });
    });

    describe('writing HealthSurvey data to a PDA', () => {
        test('saving HealthSurvey', async () => {
            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockResolvedValue({});

            const healthSurvey: st.HealthSurvey = {
                symptoms: ['Skipped meals', 'Fatigue'],
                timestamp: 1591105955,
            };

            await pdaService.writeHealthSurvey(healthSurvey);

            expect(
                mockHatClient.mock.results[0].value.hatData().create
            ).toBeCalledWith('sharetrace', 'healthsurveys', healthSurvey);
        });

        test('handle error when saving HealthSurvey', async () => {
            const error = { error: 'something_went_wrong' };
            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockRejectedValue(error);

            const healthSurvey: st.HealthSurvey = {
                symptoms: ['Skipped meals', 'Fatigue'],
                timestamp: 1591105955,
            };

            try {
                await pdaService.writeHealthSurvey(healthSurvey);
            } catch (err) {
                expect(err).toEqual(error);
            }
        });

        test('getting HeathSurveys', async () => {
            const heathSurveys = [{ symptoms: [], timestamp: '1591105955' }];

            mockHatClient.mock.results[0].value
                .hatData()
                .getAll.mockResolvedValue({ parsedBody: heathSurveys });

            await pdaService.getHealthSurveys();

            expect(
                mockHatClient.mock.results[0].value.hatData().getAll
            ).toBeCalledWith('sharetrace', 'healthsurveys', {
                take: '1',
            });
        });
    });
});
