import hatService, { HATService } from './HATService';
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

jest.mock('@dataswift/hat-js', () => ({
    HatClient: jest.fn().mockImplementation(() => {
        return {
            hatData: jest.fn().mockReturnValue({
                create: jest.fn().mockResolvedValue({ parsedBody: {} }),
                getAllDefault: jest.fn().mockResolvedValue({ parsedBody: {} }),
            }),
            auth: jest.fn().mockReturnValue({
                signOut: jest.fn(),
            }),
        };
    }),
}));

const mockLocationService = locationService as jest.Mocked<LocationService>;
const mockHatClient: jest.Mock<HatClient> = HatClient as any;

describe('HatService', () => {
    beforeEach(() => {
        mockLocationService.getLocations.mockClear();
        mockLocationService.overwriteExistingLocations.mockClear();
    });

    describe('writing location data to the HAT', () => {
        test('sending saved locations to HAT', async () => {
            const storedLocations = [
                { coords: { lng: 1, lat: 3 }, timestamp: 32454 },
            ];

            mockLocationService.getLocations.mockResolvedValue(storedLocations);
            hatService.isAuthenticated = jest.fn().mockReturnValue(true);

            await hatService.writeLocationData();
            //@ts-ignore
            expect(
                mockHatClient.mock.results[0].value.hatData().create
            ).toBeCalledWith('safetrace', 'locations', storedLocations);
        });

        test('clearing sent locations from saved locations', async () => {
            const storedLocations = [
                { coords: { lng: 1, lat: 3 }, timestamp: 12345 },
            ];

            mockLocationService.getLocations.mockResolvedValue(storedLocations);

            hatService.isAuthenticated = jest.fn().mockReturnValue(true);

            await hatService.writeLocationData();
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

            hatService.isAuthenticated = jest.fn().mockReturnValue(true);

            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockReturnValue(
                    new Promise((resolve) =>
                        setTimeout(() => {
                            resolve({ parsedBody: {} });
                        }, 100)
                    )
                );

            hatService.writeLocationData().then(() => {
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

            hatService.isAuthenticated = jest.fn().mockReturnValue(true);

            mockHatClient.mock.results[0].value
                .hatData()
                .create.mockRejectedValue({});

            await hatService.writeLocationData();

            expect(
                mockLocationService.overwriteExistingLocations
            ).not.toHaveBeenCalled();
        });

        describe('throttling writes to HAT location data', () => {
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
                    hatService,
                    'writeLocationData'
                );

                await hatService.throttleWriteLocationData();

                expect(writeLocationSpy).not.toBeCalled();

                //@ts-ignore
                Date.now.mockReturnValue(Date.now() + 1000);

                await hatService.throttleWriteLocationData();
                expect(writeLocationSpy).not.toBeCalled();

                //@ts-ignore
                Date.now.mockReturnValue(
                    Date.now() + (HATService.LOCATION_WRITE_DELAY - 1000)
                ); // -1000 to account for the first test increment above

                await hatService.throttleWriteLocationData();
                expect(writeLocationSpy).toBeCalled();

                writeLocationSpy.mockRestore();
            });
        });
    });

    describe('getting locations from the HAT', () => {
        test('getting the locations', async () => {
            mockHatClient.mock.results[0].value
                .hatData()
                .getAllDefault.mockResolvedValueOnce({
                    parsedBody: [
                        {
                            endpoint: 'safetrace/locations',
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

            const locations = await hatService.requestLocationData();

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
            await hatService.deleteAccount();
            expect(SecureStore.deleteItemAsync).toBeCalledWith(
                TOKEN_STORAGE_KEY
            );
        });

        test('signing out of the HAT via SDK', async () => {
            await hatService.deleteAccount();
            expect(
                mockHatClient.mock.results[0].value.auth().signOut
            ).toBeCalled();
        });

        test('calling stopLocationTracking on the Location Service', async () => {
            await hatService.deleteAccount();
            expect(locationService.stopLocationTracking).toBeCalled();
        });
    });
});
