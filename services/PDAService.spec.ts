import pdaService, { PDAService } from './PDAService';
import { HatClient } from '@dataswift/hat-js';
import locationService, {
    LocationService,
    ILocationData,
} from './LocationService';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_STORAGE_KEY } from '../Constants';

jest.useFakeTimers();
jest.mock('expo-secure-store');
jest.mock('./LocationService');

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

const mockLocationService = locationService as jest.Mocked<LocationService>;
const mockHatClient: jest.Mock<HatClient> = HatClient as any;

describe('PDAService', () => {
    beforeEach(() => {
        mockLocationService.getLocations.mockClear();
        mockLocationService.overwriteExistingLocations.mockClear();
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

    describe('writing location data to the HAT', () => {
        test('sending saved locations to HAT', async () => {
            const storedLocations = [
                { coords: { lng: 1, lat: 3 }, timestamp: 32454 },
            ];

            mockLocationService.getLocations.mockResolvedValue(storedLocations);
            pdaService.isAuthenticated = jest.fn().mockReturnValue(true);

            await pdaService.writeLocationData();

            expect(
                mockHatClient.mock.results[0].value.hatData().create
            ).toBeCalledWith('sharetrace', 'locations', storedLocations);
        });

        test('clearing sent locations from saved locations', async () => {
            const storedLocations = [
                { coords: { lng: 1, lat: 3 }, timestamp: 12345 },
            ];

            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockResolvedValue({ parsedBody: {} });

            mockLocationService.getLocations.mockResolvedValue(storedLocations);

            pdaService.isAuthenticated = jest.fn().mockReturnValue(true);

            await pdaService.writeLocationData();
            expect(
                mockLocationService.overwriteExistingLocations
            ).toBeCalledWith([]);
        });

        test('not removing any new locations that have been stored since the writeLocation was called', async (done) => {
            const storedLocations = [
                {
                    coords: {
                        accuracy: 10,
                        altitude: 0,
                        altitudeAccuracy: -1,
                        heading: 80.58,
                        latitude: 37.33019528,
                        longitude: -122.02552394,
                        speed: 3.96,
                    },
                    timestamp: 1587568889623.5708,
                },
            ];

            const newLocationUpdate = {
                coords: {
                    accuracy: 10,
                    altitude: 0,
                    altitudeAccuracy: -1,
                    heading: 88.99,
                    latitude: 37.33019612,
                    longitude: -122.02543657,
                    speed: 3.61,
                },
                timestamp: 1587568891522.1028,
            };

            //@ts-ignore
            mockLocationService.getLocations.mockResolvedValueOnce(
                storedLocations
            );

            pdaService.isAuthenticated = jest.fn().mockReturnValue(true);

            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockReturnValue(
                    new Promise((resolve) =>
                        setTimeout(() => {
                            resolve({ parsedBody: {} });
                        }, 100)
                    )
                );

            pdaService.writeLocationData().then(() => {
                try {
                    expect(
                        mockLocationService.overwriteExistingLocations
                    ).toBeCalledWith([newLocationUpdate]);
                    done();
                } catch (e) {
                    done(e);
                }
            });

            mockLocationService.getLocations.mockResolvedValueOnce([
                ...storedLocations,
                newLocationUpdate,
            ]);

            jest.runAllTimers();
        });

        test('not changing the saved locations if the request to write fails', async () => {
            const storedLocations = [
                { coords: { lng: 1, lat: 3 }, timestamp: 12345 },
            ];

            mockLocationService.getLocations.mockResolvedValueOnce(
                storedLocations
            );

            pdaService.isAuthenticated = jest.fn().mockReturnValue(true);

            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockRejectedValue({});

            await pdaService.writeLocationData();

            expect(
                mockLocationService.overwriteExistingLocations
            ).not.toHaveBeenCalled();
        });

        describe('throttling writes to PDA location data', () => {
            beforeEach(() => {
                const now = Date.now();
                Date.now = jest.fn().mockReturnValue(now);
            });
            afterEach(() => {
                //@ts-ignore
                Date.now.mockRestore();
            });

            test('only writing after a period of time set on the static LOCATION_WRITE_DELAY has passed', async () => {
                const writeLocationSpy = jest.spyOn(
                    pdaService,
                    'writeLocationData'
                );

                await pdaService.throttleWriteLocationData();

                expect(writeLocationSpy).not.toBeCalled();

                //@ts-ignore
                Date.now.mockReturnValue(Date.now() + 1000);

                await pdaService.throttleWriteLocationData();
                expect(writeLocationSpy).not.toBeCalled();

                //@ts-ignore
                Date.now.mockReturnValue(
                    Date.now() + (PDAService.LOCATION_WRITE_DELAY - 1000)
                ); // -1000 to account for the first test increment above

                await pdaService.throttleWriteLocationData();
                expect(writeLocationSpy).toBeCalled();

                writeLocationSpy.mockRestore();
            });
        });
    });

    describe('getting locations from the PDA', () => {
        test('getting the locations', async () => {
            mockHatClient.mock.results[0].value
                .hatData()
                .getAll.mockResolvedValueOnce({
                    parsedBody: [
                        {
                            endpoint: 'sharetrace/locations',
                            recordId: '0a6edd5e-69b4-499d-97e0-bc374fbe69cf',
                            data: {
                                coords: {
                                    speed: -1,
                                    heading: -1,
                                    accuracy: 65,
                                    altitude: 19.153566360473633,
                                    latitude: 51.5302747697369,
                                    longitude: -0.09434700051002931,
                                    altitudeAccuracy: 10,
                                },
                                timestamp: 1587588327022.461,
                            } as ILocationData,
                        },
                    ],
                });

            const locations = await pdaService.requestLocationData();

            expect(
                mockHatClient.mock.results[0].value.hatData().getAll
            ).toHaveBeenCalledWith('sharetrace', 'locations', {
                orderBy: 'timestamp',
                ordering: 'descending',
            });

            expect(locations).toEqual([
                {
                    coords: {
                        speed: -1,
                        heading: -1,
                        accuracy: 65,
                        altitude: 19.153566360473633,
                        latitude: 51.5302747697369,
                        longitude: -0.09434700051002931,
                        altitudeAccuracy: 10,
                    },
                    timestamp: 1587588327022.461,
                },
            ]);
        });
    });

    describe('deleting an account', () => {
        test('removing the token from storage', async () => {
            await pdaService.deleteAccount();
            expect(SecureStore.deleteItemAsync).toBeCalledWith(
                TOKEN_STORAGE_KEY
            );
        });

        test('signing out of the HAT via SDK', async () => {
            await pdaService.deleteAccount();
            expect(
                mockHatClient.mock.results[0].value.auth().signOut
            ).toBeCalled();
        });

        test('calling stopLocationTracking on the Location Service', async () => {
            await pdaService.deleteAccount();
            expect(locationService.stopLocationTracking).toBeCalled();
        });

        test('clearing any stored locations in the cache', async () => {
            await pdaService.deleteAccount();
            expect(mockLocationService.deleteLocationStorage).toBeCalledWith();
        });
    });

    describe('writing HealthCheck data to a PDA', () => {
        test('saving HealthCheck', async () => {
            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockResolvedValue({});

            const healthCheck: st.HealthCheck = {
                symptoms: ['Skipped meals', 'Fatigue'],
            };

            await pdaService.writeHealthCheck(healthCheck);

            expect(
                mockHatClient.mock.results[0].value.hatData().create
            ).toBeCalledWith('sharetrace', 'healthchecks', healthCheck);
        });

        test('handle error when saving HealthCheck', async () => {
            const error = { error: 'something_went_wrong' };
            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockRejectedValue(error);

            const healthCheck: st.HealthCheck = {
                symptoms: ['Skipped meals', 'Fatigue'],
            };

            try {
                await pdaService.writeHealthCheck(healthCheck);
            } catch (err) {
                expect(err).toEqual(error);
            }
        });
    });
});
